import type { WorkflowPage, WorkflowPart } from "./types";

type Rec = Record<string, unknown>;

function isRec(v: unknown): v is Rec {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Returns a list of problems. An empty list means the content is valid. */
export function workflowProblems(input: unknown): string[] {
  const out: string[] = [];
  const str = (v: unknown, where: string) => {
    if (typeof v !== "string" || v.trim() === "") out.push(`${where} must be a non-empty string`);
  };
  const strs = (v: unknown, where: string) => {
    if (!Array.isArray(v) || v.length === 0) return out.push(`${where} must be a non-empty list`);
    v.forEach((s, i) => str(s, `${where}[${i}]`));
  };

  if (!isRec(input)) return ["page must be an object"];
  const p = input as Rec;
  str(p.title, "title");
  str(p.line, "line");
  str(p.copyAll, "copyAll");
  if (!isRec(p.snapshot)) out.push("snapshot must be an object");
  else {
    str(p.snapshot.text, "snapshot.text");
    if (typeof p.snapshot.iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.snapshot.iso)) {
      out.push("snapshot.iso must be YYYY-MM-DD");
    }
  }
  for (const k of ["mindset", "treatment"] as const) {
    const s = p[k];
    if (!isRec(s)) out.push(`${k} must be an object`);
    else {
      str(s.id, `${k}.id`);
      str(s.title, `${k}.title`);
      strs(s.paragraphs, `${k}.paragraphs`);
    }
  }

  const checkParts = (group: unknown, name: string): WorkflowPart[] => {
    if (!isRec(group)) {
      out.push(`${name} must be an object`);
      return [];
    }
    str(group.label, `${name}.label`);
    const parts = group.parts;
    if (!Array.isArray(parts) || parts.length === 0) {
      out.push(`${name}.parts must be a non-empty list`);
      return [];
    }
    parts.forEach((part, i) => {
      const w = `${name}.parts[${i}]`;
      if (!isRec(part)) return out.push(`${w} must be an object`);
      str(part.id, `${w}.id`);
      str(part.title, `${w}.title`);
      strs(part.paragraphs, `${w}.paragraphs`);
      if (part.lines !== undefined) strs(part.lines, `${w}.lines`);
      if (part.prompt !== undefined) str(part.prompt, `${w}.prompt`);
    });
    return parts.filter(isRec) as unknown as WorkflowPart[];
  };

  const setupParts = checkParts(p.setup, "setup");
  const taskParts = checkParts(p.task, "task");
  const sectionIds: string[] = [];
  for (const k of ["mindset", "treatment", "paste", "beforeAfter", "oneTask", "rulesGrew"] as const) {
    const sec = p[k];
    if (isRec(sec) && typeof sec.id === "string") sectionIds.push(sec.id);
    else out.push(`${k}.id must be a string`);
  }
  const ids = [...sectionIds, ...setupParts.map((x) => x.id), ...taskParts.map((x) => x.id)];
  ids.forEach((id, i) => {
    if (ids.indexOf(id) !== i) out.push(`section id "${id}" is used twice`);
  });

  if (isRec(p.setup)) {
    const pic = p.setup.picture;
    if (!isRec(pic) || !Array.isArray(pic.nodes) || !Array.isArray(pic.edges)) {
      out.push("setup.picture needs nodes and edges");
    } else {
      const nodeIds = new Set<string>();
      pic.nodes.forEach((n, i) => {
        const w = `setup.picture.nodes[${i}]`;
        if (!isRec(n)) return out.push(`${w} must be an object`);
        str(n.id, `${w}.id`);
        str(n.label, `${w}.label`);
        if (typeof n.id === "string") {
          if (nodeIds.has(n.id)) out.push(`${w}.id is used twice`);
          nodeIds.add(n.id);
        }
        if (typeof n.to !== "string" || !ids.includes(n.to)) out.push(`${w}.to must name a section on the page`);
        const g = n.grid;
        if (!Array.isArray(g) || g.length !== 2 || !g.every((x) => Number.isInteger(x) && x >= 1)) {
          out.push(`${w}.grid must be [column, row]`);
        }
      });
      if (!Array.isArray(pic.extras) || !pic.extras.every((x) => setupParts.some((q) => q.id === x))) {
        out.push("setup.picture.extras must list setup part ids");
      }
      pic.edges.forEach((e, i) => {
        const w = `setup.picture.edges[${i}]`;
        if (!isRec(e)) return out.push(`${w} must be an object`);
        if (!nodeIds.has(e.from as string)) out.push(`${w}.from is not a node`);
        if (!nodeIds.has(e.to as string)) out.push(`${w}.to is not a node`);
        if (e.ends !== "to" && e.ends !== "both") out.push(`${w}.ends must be "to" or "both"`);
      });
    }
  }

  if (isRec(p.task)) {
    const pic = p.task.picture;
    if (!isRec(pic) || !Array.isArray(pic.line) || !Array.isArray(pic.optional)) {
      out.push("task.picture needs line and optional");
    } else {
      const line = pic.line as string[];
      const optional = (pic.optional as Rec[]).map((o) => o.id as string);
      for (const id of [...line, ...optional]) {
        if (!taskParts.some((x) => x.id === id)) out.push(`task.picture names "${id}", which is not a task part`);
      }
      for (const part of taskParts) {
        const n = line.filter((x) => x === part.id).length + optional.filter((x) => x === part.id).length;
        if (n !== 1) out.push(`task part "${part.id}" must be drawn once, found ${n}`);
      }
      const order = taskParts.map((x) => x.id).filter((id) => line.includes(id));
      if (order.join() !== line.join()) out.push("task.picture.line must follow the order of task.parts");
    }
  }

  if (!isRec(p.paste)) out.push("paste must be an object");
  else {
    str(p.paste.title, "paste.title");
    strs(p.paste.paragraphs, "paste.paragraphs");
    strs(p.paste.head, "paste.head");
    const w = Array.isArray(p.paste.head) ? p.paste.head.length : 0;
    if (!Array.isArray(p.paste.rows) || p.paste.rows.length === 0) out.push("paste.rows must be a non-empty list");
    else {
      p.paste.rows.forEach((r, i) => {
        if (!Array.isArray(r) || r.length !== w) out.push(`paste.rows[${i}] must have ${w} cells`);
        else r.forEach((c, j) => str(c, `paste.rows[${i}][${j}]`));
      });
    }
  }

  if (!isRec(p.beforeAfter)) out.push("beforeAfter must be an object");
  else {
    str(p.beforeAfter.title, "beforeAfter.title");
    strs(p.beforeAfter.paragraphs, "beforeAfter.paragraphs");
    const items = p.beforeAfter.items;
    if (!Array.isArray(items) || items.length === 0) out.push("beforeAfter.items must be a non-empty list");
    else {
      items.forEach((it, i) => {
        if (!isRec(it) || (it.type !== "quote" && it.type !== "reply")) out.push(`beforeAfter.items[${i}].type must be quote or reply`);
        else str(it.text, `beforeAfter.items[${i}].text`);
      });
      if (items.filter((i) => isRec(i) && i.type === "reply").length !== 2) out.push("beforeAfter needs exactly two replies");
    }
  }

  const leadItems = (v: unknown, where: string) => {
    if (!Array.isArray(v) || v.length === 0) return out.push(`${where} must be a non-empty list`);
    v.forEach((s, i) => {
      if (!isRec(s)) return out.push(`${where}[${i}] must be an object`);
      str(s.lead, `${where}[${i}].lead`);
      str(s.text, `${where}[${i}].text`);
      if (s.quote !== undefined) str(s.quote, `${where}[${i}].quote`);
    });
  };
  if (!isRec(p.oneTask)) out.push("oneTask must be an object");
  else {
    str(p.oneTask.title, "oneTask.title");
    strs(p.oneTask.paragraphs, "oneTask.paragraphs");
    leadItems(p.oneTask.steps, "oneTask.steps");
  }
  if (!isRec(p.rulesGrew)) out.push("rulesGrew must be an object");
  else {
    str(p.rulesGrew.title, "rulesGrew.title");
    leadItems(p.rulesGrew.items, "rulesGrew.items");
  }
  return out;
}

export function validateWorkflowPage(input: unknown): WorkflowPage {
  const problems = workflowProblems(input);
  if (problems.length) throw new Error(`Invalid workflow content:\n- ${problems.join("\n- ")}`);
  return input as WorkflowPage;
}
