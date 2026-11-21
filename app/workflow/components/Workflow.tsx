import type { LeadItem, WorkflowPage } from "@/lib/workflow/types";
import { buildAgentText } from "@/lib/workflow/agent-text";
import { parseInline } from "@/lib/workflow/inline";
import { CopyButton } from "./CopyButton";
import { SetupPicture } from "./SetupPicture";
import { TaskPicture } from "./TaskPicture";

function Quote({ text }: { text: string }) {
  return (
    <blockquote className="note">
      <p>{text}</p>
    </blockquote>
  );
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="wf-prose">
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

function Inline({ source }: { source: string }) {
  return (
    <>
      {parseInline(source).map((s, i) =>
        s.href ? (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">
            {s.text}
          </a>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

function LeadText({ item }: { item: LeadItem }) {
  return (
    <>
      <p>
        <span className="lead">{item.lead}</span> {item.text}
      </p>
      {item.quote ? <Quote text={item.quote} /> : null}
    </>
  );
}

export function Workflow({ page }: { page: WorkflowPage }) {
  const columns: { type: "quote" | "reply"; text: string }[][] = [];
  let cur: { type: "quote" | "reply"; text: string }[] = [];
  for (const item of page.beforeAfter.items) {
    cur.push(item);
    if (item.type === "reply") {
      columns.push(cur);
      cur = [];
    }
  }
  if (cur.length) columns.push(cur);

  return (
    <main className="wf-wrap">
      <header className="wf-hero">
        <h1>{page.title}</h1>
        <p className="wf-line">{page.line}</p>
        <p className="wf-snap">
          <time dateTime={page.snapshot.iso}>{page.snapshot.text}</time>
        </p>
        <CopyButton text={buildAgentText(page)} label={page.copyAll} className="btn btn-primary" />
      </header>

      <div className="wf-sec wf-duo">
        <section>
          <h2 className="wf-h">{page.mindset.title}</h2>
          <Prose paragraphs={page.mindset.paragraphs} />
        </section>
        <section>
          <h2 className="wf-h">{page.treatment.title}</h2>
          <Prose paragraphs={page.treatment.paragraphs} />
        </section>
      </div>

      <div className="wf-sec">
        <SetupPicture setup={page.setup} />
      </div>

      <div className="wf-sec">
        <TaskPicture task={page.task} />
      </div>

      <section className="wf-sec">
        <h2 className="wf-h">{page.paste.title}</h2>
        <Prose paragraphs={page.paste.paragraphs} />
        <table className="tbl">
          <thead>
            <tr>
              {page.paste.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.paste.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i} data-l={page.paste.head[i]}>
                    <Inline source={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="wf-sec">
        <h2 className="wf-h">{page.beforeAfter.title}</h2>
        <Prose paragraphs={page.beforeAfter.paragraphs} />
        <div className="ba">
          {columns.map((col, i) => (
            <div className="ba-col" key={i}>
              {col.map((item, j) =>
                item.type === "quote" ? (
                  <Quote key={j} text={item.text} />
                ) : (
                  <div className="reply" key={j} role="group" aria-label="Reply">
                    {item.text}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="wf-sec">
        <h2 className="wf-h">{page.oneTask.title}</h2>
        <Prose paragraphs={page.oneTask.paragraphs} />
        <ol className="steps">
          {page.oneTask.steps.map((s) => (
            <li key={s.lead}>
              <LeadText item={s} />
            </li>
          ))}
        </ol>
      </section>

      <section className="wf-sec">
        <h2 className="wf-h">{page.rulesGrew.title}</h2>
        <ul className="grew">
          {page.rulesGrew.items.map((s) => (
            <li key={s.lead}>
              <LeadText item={s} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
