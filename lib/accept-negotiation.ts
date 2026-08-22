export type PageRepresentation = "text/html" | "text/markdown";

interface AcceptEntry {
  type: string;
  q: number;
  specificity: number;
  position: number;
}

const PAGE_REPRESENTATIONS: PageRepresentation[] = ["text/html", "text/markdown"];

function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(",")
    .map((raw, position) => {
      const [mediaRange = "", ...params] = raw
        .trim()
        .split(";")
        .map((part) => part.trim());
      const type = mediaRange.toLowerCase();
      if (!type || !type.includes("/")) return null;

      let q = 1;
      for (const param of params) {
        const [name, value] = param.split("=").map((part) => part.trim().toLowerCase());
        if (name !== "q") continue;
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.min(1, Math.max(0, parsed));
      }

      const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
      return { type, q, specificity, position };
    })
    .filter((entry): entry is AcceptEntry => entry !== null);
}

function matches(entry: AcceptEntry, candidate: PageRepresentation): boolean {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(`${entry.type.slice(0, -1)}`);
  }
  return entry.type === candidate;
}

export function preferredPageRepresentation(
  header: string | null,
): PageRepresentation | null {
  if (!header || !header.trim()) return "text/html";

  const entries = parseAccept(header);
  let best: PageRepresentation | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of PAGE_REPRESENTATIONS) {
    let matched: AcceptEntry | null = null;

    for (const entry of entries) {
      if (!matches(entry, candidate)) continue;
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && entry.position < matched.position)
      ) {
        matched = entry;
      }
    }

    if (!matched || matched.q <= 0) continue;
    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matched.position < bestPosition)
    ) {
      best = candidate;
      bestQ = matched.q;
      bestPosition = matched.position;
    }
  }

  return best;
}

export function appendVaryAccept(existing: string | null): string {
  if (!existing) return "Accept";
  const tokens = existing.split(",").map((token) => token.trim().toLowerCase());
  return tokens.includes("accept") ? existing : `${existing}, Accept`;
}
