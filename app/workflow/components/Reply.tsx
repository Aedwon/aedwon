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

/** A chat reply as it looked in the app: headings, rules, lists, bold and code terms. Scrolls inside a fixed box. */
export function Reply({ source }: { source: string }) {
  return (
    <div className="reply" role="region" aria-label="Reply" tabIndex={0}>
      {parseReply(source).map((b, i) => {
        switch (b.t) {
          case "h":
            return (
              <h3 key={i}>
                <Inl nodes={b.children} />
              </h3>
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
    </div>
  );
}
