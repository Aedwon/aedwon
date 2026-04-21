import { track as vercelTrack } from "@vercel/analytics";
import posthog from "posthog-js";

type Primitive = string | number | boolean | null;

function vercelSafe(props?: Record<string, unknown>): Record<string, Primitive> | undefined {
    if (!props) return undefined;
    const out: Record<string, Primitive> = {};
    for (const [key, value] of Object.entries(props)) {
        if (value === null) out[key] = null;
        else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") out[key] = value;
        else out[key] = String(value);
    }
    return out;
}

export function track(event: string, properties?: Record<string, unknown>) {
    try {
        vercelTrack(event, vercelSafe(properties));
    } catch {
        // Vercel Analytics not mounted yet (e.g. during SSR) — safe to ignore.
    }
    try {
        if (typeof window !== "undefined") posthog.capture(event, properties);
    } catch {
        // PostHog not initialized (no key set) — safe to ignore.
    }
}

export function setPersonProperty(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        posthog.setPersonProperties({ [key]: value });
    } catch {
        // PostHog not initialized.
    }
}
