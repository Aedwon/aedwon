const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aedwon.com";
const SITE_ORIGIN = "https://aedwon.com";
const SITE_REFERER = "https://aedwon.com/contact";

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return Response.json({ success: "false", message: "Invalid payload" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    if (!name || !email || !goal) {
        return Response.json({ success: "false", message: "Missing required fields" }, { status: 400 });
    }

    const payload = {
        name,
        email,
        project: typeof body.project === "string" ? body.project : "",
        goal,
        _subject: `New inquiry · aedwon.com · ${name}`,
        _template: "table",
        _replyto: email,
    };

    const upstream = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: SITE_ORIGIN,
            Referer: SITE_REFERER,
        },
        body: JSON.stringify(payload),
    });

    const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    return Response.json(data, { status: upstream.status });
}
