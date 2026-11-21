import type { TaskContent } from "@/lib/workflow/types";
import { NodeLink } from "./NodeLink";

/** The line a task follows. The audit sits outside it, because the lead may call it at any level. */
export function TaskPicture({ task }: { task: TaskContent }) {
  const byId = (id: string) => task.parts.find((p) => p.id === id)!;
  return (
    <figure className="pic" aria-label={task.label}>
      <div className="task">
        <ol className="line">
          {task.picture.line.map((id) => (
            <li key={id}>
              <div className="part-cell">
                <NodeLink to={id} label={byId(id).title} />
              </div>
            </li>
          ))}
        </ol>
        <div className="task-rule" aria-hidden="true" />
        {task.picture.optional.map((o) => (
          <div className="opt part-cell" key={o.id}>
            <NodeLink to={o.id} label={byId(o.id).title} sub={o.sub} outside />
          </div>
        ))}
      </div>
    </figure>
  );
}
