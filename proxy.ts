import { NextRequest, NextResponse } from "next/server";
import {
  appendVaryAccept,
  preferredPageRepresentation,
} from "@/lib/accept-negotiation";

const MARKDOWN_PATH_HEADER = "x-aedwon-markdown-path";

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept");
  const representation = preferredPageRepresentation(accept);

  if (accept && representation === null) {
    return new NextResponse(
      "Not Acceptable\n\nAvailable representations: text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
        },
      },
    );
  }

  if (representation === "text/markdown") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/agent-markdown";
    rewriteUrl.searchParams.set("path", request.nextUrl.pathname);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MARKDOWN_PATH_HEADER, request.nextUrl.pathname);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    response.headers.set("Vary", "Accept");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set(
    "Vary",
    appendVaryAccept(response.headers.get("Vary")),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|agent-markdown|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|llms.txt|.*\\.[^/]+$).*)",
  ],
};
