import { loadWorkflowPage } from "@/lib/workflow/load";
import { Workflow } from "./components/Workflow";

export default function WorkflowPage() {
  return <Workflow page={loadWorkflowPage()} />;
}
