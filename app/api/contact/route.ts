import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT } from "@/lib/site-content";

// The Chapter 1 form in the book. Sends one email to me through Resend and stores nothing.
// RESEND_API_KEY lives only in the server environment. Errors never repeat the visitor's message.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 20 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (status: number) => NextResponse.json({ ok: false }, { status });
const text = (v: unknown) => (typeof v === "string" ? v.trim() : null);

export async function POST(req: Request) {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return fail(400);

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return fail(400);
  }
  if (raw.length > MAX_BODY) return fail(400);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400);
  const b = body as Record<string, unknown>;

  // Bots fill the hidden field. Pretend it worked and send nothing.
  if (typeof b.website === "string" && b.website.trim() !== "") return NextResponse.json({ ok: true });

  const name = text(b.name);
  const mail = text(b.mail);
  const msg = text(b.msg);
  const title = b.title == null ? "" : text(b.title);
  if (name === null || mail === null || msg === null || title === null) return fail(400);
  if (name.length < 1 || name.length > 100) return fail(400);
  if (mail.length > 254 || !EMAIL.test(mail)) return fail(400);
  if (msg.length < 1 || msg.length > 5000) return fail(400);
  if (title.length > 28) return fail(400);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("contact: RESEND_API_KEY is not set, so the contact form cannot send email.");
    return fail(500);
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "Aedwon contact <contact@aedwon.site>",
      to: CONTACT.email,
      replyTo: mail,
      subject: `Portfolio: ${name}${title ? ` · ${title}` : ""}`,
      text: [`Name: ${name}`, `Email: ${mail}`, ...(title ? [`Title: ${title}`] : []), "", msg].join("\n"),
    });
    if (error) {
      console.error("contact: Resend rejected the email:", error.name);
      return fail(502);
    }
  } catch {
    console.error("contact: could not reach Resend.");
    return fail(502);
  }
  return NextResponse.json({ ok: true });
}
