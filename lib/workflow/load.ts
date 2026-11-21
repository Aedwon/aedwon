import page from "@/content/workflow/page.json";
import { validateWorkflowPage } from "./validate";
import type { WorkflowPage } from "./types";

let cached: WorkflowPage | null = null;

export function loadWorkflowPage(): WorkflowPage {
  if (!cached) cached = validateWorkflowPage(page);
  return cached;
}
