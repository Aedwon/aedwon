import type { WorkflowPage, WorkflowPart } from "./types";

export function promptParts(page: WorkflowPage): WorkflowPart[] {
  return [...page.setup.parts, ...page.task.parts].filter((p) => p.prompt);
}

/** One plain-text document that holds every prompt, in page order. */
export function buildAgentText(page: WorkflowPage): string {
  const blocks = promptParts(page).map((p) => `## ${p.title}\n\n${p.prompt}`);
  return `# ${page.title}\n\n${page.snapshot.text}\n\n${blocks.join("\n\n")}\n`;
}
