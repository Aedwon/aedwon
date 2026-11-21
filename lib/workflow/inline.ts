export type InlineSegment = { text: string; href?: string };

/** Splits "text [label](url) text" into plain and linked segments. */
export function parseInline(source: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (m.index > last) out.push({ text: source.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last) });
  return out;
}
