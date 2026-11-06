export interface ContactFields { name: string; mail: string; msg: string; title?: string; website?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The rule that enables the "Close and shelve" button. The server checks the same fields again. */
export function contactReady(f: Pick<ContactFields, 'name' | 'mail' | 'msg'>): boolean {
  return !!(f.name.trim() && f.msg.trim() && EMAIL.test(f.mail.trim()));
}

/** Posts the Chapter 1 form. Resolves true only when the server accepted it. */
export async function sendContact(f: ContactFields): Promise<boolean> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: f.name, mail: f.mail, msg: f.msg, title: f.title ?? '', website: f.website ?? '' }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
