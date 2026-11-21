import { buildAgentText } from "@/lib/workflow/agent-text";
import { loadWorkflowPage } from "@/lib/workflow/load";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildAgentText(loadWorkflowPage()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
