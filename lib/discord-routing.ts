export type DiscordChannel = "home" | "projects" | "blogs";

export interface DiscordThreadRoute {
  parent: "projects" | "blogs";
  slug: string;
}

export interface DiscordRouteState {
  activeChannel: DiscordChannel;
  activeThread: DiscordThreadRoute | null;
}

function firstPathSegment(path: string, prefix: string): string | null {
  const remainder = path.slice(prefix.length).replace(/^\/+|\/+$/g, "");
  if (!remainder) return null;
  const [segment] = remainder.split("/");
  return segment || null;
}

export function getDiscordRouteState(pathname: string): DiscordRouteState {
  if (pathname.startsWith("/projects/")) {
    const slug = firstPathSegment(pathname, "/projects/");
    return {
      activeChannel: "projects",
      activeThread: slug ? { parent: "projects", slug } : null,
    };
  }

  if (pathname.startsWith("/blogs/")) {
    const slug = firstPathSegment(pathname, "/blogs/");
    return {
      activeChannel: "blogs",
      activeThread: slug ? { parent: "blogs", slug } : null,
    };
  }

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return { activeChannel: "projects", activeThread: null };
  }

  if (pathname === "/blogs" || pathname.startsWith("/blogs/")) {
    return { activeChannel: "blogs", activeThread: null };
  }

  return { activeChannel: "home", activeThread: null };
}

export function getDiscordChannelPath(channel: DiscordChannel): string {
  if (channel === "projects") return "/projects";
  if (channel === "blogs") return "/blogs";
  return "/";
}

export function getDiscordThreadPath(thread: DiscordThreadRoute): string {
  return `/${thread.parent}/${thread.slug}`;
}
