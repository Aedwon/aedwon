/** A small reader for the chat replies: headings, rules, lists, bold, code terms and file links. */

export type Inline =
  | { t: "text"; v: string }
  | { t: "b"; children: Inline[] }
  | { t: "code"; v: string };

export type Block =
  | { t: "h"; children: Inline[] }
  | { t: "p"; children: Inline[] }
  | { t: "hr" }
  | { t: "ol"; items: Inline[][] }
  | { t: "ul"; items: Inline[][] };

const TOKEN = /\*\*(.+?)\*\*|`([^`]+)`|\[((?:[^[\]]|\[[^\]]*\])*)\]\(([^)]*)\)/;

export function parseInlineMd(source: string): Inline[] {
  const out: Inline[] = [];
  let rest = source;
  while (rest) {
    const m = TOKEN.exec(rest);
    if (!m) {
      out.push({ t: "text", v: rest });
      break;
    }
    if (m.index > 0) out.push({ t: "text", v: rest.slice(0, m.index) });
    if (m[1] !== undefined) out.push({ t: "b", children: parseInlineMd(m[1]) });
    else if (m[2] !== undefined) out.push({ t: "code", v: m[2] });
    else out.push({ t: "code", v: m[3] }); // file links in the chat: show the name as a code term
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

export function parseReply(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: "p", children: parseInlineMd(para.join(" ")) });
    para = [];
  };
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    let m: RegExpMatchArray | null;
    if (!trimmed) flush();
    else if ((m = trimmed.match(/^#{1,6}\s+(.*)$/))) {
      flush();
      blocks.push({ t: "h", children: parseInlineMd(m[1]) });
    } else if (/^-{3,}$/.test(trimmed)) {
      flush();
      blocks.push({ t: "hr" });
    } else if ((m = trimmed.match(/^\d+\.\s+(.*)$/))) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.t === "ol") last.items.push(parseInlineMd(m[1]));
      else blocks.push({ t: "ol", items: [parseInlineMd(m[1])] });
    } else if ((m = trimmed.match(/^[-*]\s+(.*)$/))) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.t === "ul") last.items.push(parseInlineMd(m[1]));
      else blocks.push({ t: "ul", items: [parseInlineMd(m[1])] });
    } else para.push(trimmed);
  }
  flush();
  return blocks;
}

/** The words of a reply with the marks removed. Used to check that nothing was lost. */
export function replyWords(source: string): string {
  const inline = (nodes: Inline[]): string => nodes.map((n) => (n.t === "b" ? inline(n.children) : n.t === "code" ? n.v : n.v)).join("");
  return parseReply(source)
    .map((b) => (b.t === "hr" ? "" : b.t === "ol" || b.t === "ul" ? b.items.map(inline).join(" ") : inline(b.children)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
