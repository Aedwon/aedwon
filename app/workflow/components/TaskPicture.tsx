"use client";

import type { TaskContent } from "@/lib/workflow/types";
import { PartGroup, PartNode } from "./PartGroup";

/** The line a task follows. The audit sits outside it, because the lead may call it at any level. */
export function TaskPicture({ task }: { task: TaskContent }) {
  const byId = (id: string) => task.parts.find((p) => p.id === id)!;
  return (
    <PartGroup label={task.label} parts={task.parts}>
      <div className="task pic">
        <ol className="line">
          {task.picture.line.map((id) => (
            <li key={id}>
              <div className="part-cell">
                <PartNode part={byId(id)} />
              </div>
            </li>
          ))}
        </ol>
        {task.picture.optional.map((o) => (
          <div className="opt-wrap" key={o.id}>
            <div className="task-rule" aria-hidden="true" />
            <div className="opt part-cell">
              <PartNode part={byId(o.id)} sub={o.sub} outside />
            </div>
          </div>
        ))}
      </div>
    </PartGroup>
  );
}
