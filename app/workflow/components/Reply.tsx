import type { Inline } from "@/lib/workflow/reply";
import { parseReply } from "@/lib/workflow/reply";

function Inl({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) =>
        n.t === "b" ? (
          <strong key={i}>
            <Inl nodes={n.children} />
          </strong>
        ) : n.t === "code" ? (
          <code key={i}>{n.v}</code>
        ) : (
          <span key={i}>{n.v}</span>
        ),
      )}
    </>
  );
}

/** Parsed chat reply rendered with headings, lists, rules, bold, and code spans. */
export function Reply({ source }: { source: string }) {
  return (
    <>
      {parseReply(source).map((b, i) => {
        switch (b.t) {
          case "h":
            return (
              <h4 key={i}>
                <Inl nodes={b.children} />
              </h4>
            );
          case "hr":
            return <hr key={i} />;
          case "ol":
          case "ul": {
            const Tag = b.t;
            return (
              <Tag key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Inl nodes={it} />
                  </li>
                ))}
              </Tag>
            );
          }
          default:
            return (
              <p key={i}>
                <Inl nodes={b.children} />
              </p>
            );
        }
      })}
    </>
  );
}
