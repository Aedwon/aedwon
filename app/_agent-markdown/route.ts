import { markdownForPath } from "@/lib/agent-content";

export const dynamic = "force-dynamic";

function responseFor(request: Request, includeBody: boolean) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("path") ?? "/";
  const result = markdownForPath(pathname);

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept",
    "Cache-Control": "public, max-age=0, s-maxage=300",
  });

  if (result.location) headers.set("Location", result.location);

  return new Response(includeBody ? result.body : null, {
    status: result.status,
    headers,
  });
}

export async function GET(request: Request) {
  return responseFor(request, true);
}

export async function HEAD(request: Request) {
  return responseFor(request, false);
}
