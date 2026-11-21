import type { ReactNode } from "react";
import type { LeadItem, WorkflowPage, WorkflowPart } from "@/lib/workflow/types";
import { buildAgentText } from "@/lib/workflow/agent-text";
import { parseInline } from "@/lib/workflow/inline";
import { CopyButton } from "./CopyButton";
import { PromptBlock } from "./PromptBlock";
import { Reply } from "./Reply";
import { SetupPicture } from "./SetupPicture";
import { TaskPicture } from "./TaskPicture";
import { Toc } from "./Toc";
import type { TocGroup } from "./Toc";

function Section({ id, title, children, checkIgnore }: { id: string; title: string; children: ReactNode; checkIgnore?: string }) {
  return (
    <section id={id} className="wf-sec" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="wf-h" tabIndex={-1} data-design-check-ignore={checkIgnore}>
        {title}
      </h2>
      {children}
    </section>
  );
}

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

function PartSection({ part }: { part: WorkflowPart }) {
  return (
    <Section id={part.id} title={part.title}>
      <Prose paragraphs={part.paragraphs} />
      {part.lines ? (
        <ul className="model-list">
          {part.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
      {part.prompt ? <PromptBlock text={part.prompt} /> : null}
    </Section>
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

export function tocGroups(page: WorkflowPage): TocGroup[] {
  const t = (s: { id: string; title: string }) => ({ id: s.id, title: s.title });
  return [
    { items: [t(page.mindset), t(page.treatment)] },
    { label: "Setup", items: page.setup.parts.map(t) },
    { label: "A task", items: [...page.task.parts.map(t), t(page.paste)] },
    { label: "Examples", items: [t(page.beforeAfter), t(page.oneTask), t(page.rulesGrew)] },
  ];
}

export function Workflow({ page }: { page: WorkflowPage }) {
  // Before and after: each side is its quoted messages, then its reply. Replies line up in one row on wide screens.
  const sides: { type: "quote" | "reply"; text: string }[][] = [];
  let cur: { type: "quote" | "reply"; text: string }[] = [];
  for (const item of page.beforeAfter.items) {
    cur.push(item);
    if (item.type === "reply") {
      sides.push(cur);
      cur = [];
    }
  }

  return (
    <div className="wf-wrap">
      <header className="wf-hero">
        <h1>{page.title}</h1>
        <p className="wf-line">{page.line}</p>
        <p className="wf-snap">
          <time dateTime={page.snapshot.iso}>{page.snapshot.text}</time>
        </p>
        <CopyButton text={buildAgentText(page)} label={page.copyAll} className="btn btn-primary" />
      </header>

      <div className="wf-body">
        <Toc groups={tocGroups(page)} />
        <main className="wf-main">
          <Section id={page.mindset.id} title={page.mindset.title}>
            <Prose paragraphs={page.mindset.paragraphs} />
          </Section>
          <Section id={page.treatment.id} title={page.treatment.title}>
            <Prose paragraphs={page.treatment.paragraphs} />
          </Section>

          <SetupPicture setup={page.setup} />
          {page.setup.parts.map((p) => (
            <PartSection key={p.id} part={p} />
          ))}

          <TaskPicture task={page.task} />
          {page.task.parts.map((p) => (
            <PartSection key={p.id} part={p} />
          ))}

          <Section id={page.paste.id} title={page.paste.title}>
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
          </Section>

          <Section id={page.beforeAfter.id} title={page.beforeAfter.title}>
            <Prose paragraphs={page.beforeAfter.paragraphs} />
            <div className="ba">
              {sides.map((side, i) => [
                <div className="ba-q" style={{ gridColumn: i + 1, gridRow: 1 }} key={`q${i}`}>
                  {side
                    .filter((x) => x.type === "quote")
                    .map((x) => (
                      <Quote key={x.text} text={x.text} />
                    ))}
                </div>,
                <div className="ba-r" style={{ gridColumn: i + 1, gridRow: 2 }} key={`r${i}`}>
                  <Reply source={side.find((x) => x.type === "reply")!.text} />
                </div>,
              ])}
            </div>
          </Section>

          {/* Exempt from the eyebrow check: the text the check finds above this heading sits inside the reply boxes,
              which scroll. It is clipped, so it is not on screen above the heading. */}
          <Section id={page.oneTask.id} title={page.oneTask.title} checkIgnore="eyebrow">
            <Prose paragraphs={page.oneTask.paragraphs} />
            <ol className="steps">
              {page.oneTask.steps.map((s) => (
                <li key={s.lead}>
                  <LeadText item={s} />
                </li>
              ))}
            </ol>
          </Section>

          <Section id={page.rulesGrew.id} title={page.rulesGrew.title}>
            <ul className="grew">
              {page.rulesGrew.items.map((s) => (
                <li key={s.lead}>
                  <LeadText item={s} />
                </li>
              ))}
            </ul>
          </Section>
        </main>
      </div>
    </div>
  );
}
