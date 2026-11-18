# Contact form

The Chapter 1 form posts JSON to `POST /api/contact`. The route validates the input and sends one email to the site owner through Resend. It stores nothing.

## What the route does

In order:

1. Same-origin check. The `Origin` header must be present, and its host must equal `x-forwarded-host` (or `host` if that is absent). Otherwise it returns 403. This needs no hardcoded domain list, so production, Vercel previews and localhost all work.
2. Body checks. Bodies over 20 KB, invalid JSON, and fields that fail validation return 400.
3. Honeypot. If the hidden `website` field has text, the route returns `{ok: true}` and sends nothing.
4. Rate limit (see below). Over a limit returns 429.
5. Send through Resend. A missing key returns 500. A Resend error or outage returns 502.

Every failure returns `{ok: false}`. The client treats any non-ok response as the error state.

## Environment variables

- `RESEND_API_KEY`: required. Server only.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: enable the rate limit.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`: the names Vercel's Upstash integration sets. The code uses these if the Upstash pair is empty.

## Rate limits

The helper is `lib/contact/ratelimit.ts`. Both limiters use the Redis prefix `contact`.

- Per visitor: 3 requests per hour, sliding window. The key is the first entry of `x-forwarded-for`, then `x-real-ip`, then `unknown`.
- Global: 50 requests per day, fixed window, key `global`.

The route checks the visitor limit first. It checks the global limit only if the visitor passes. Invalid and honeypot requests never reach the limiter, so they use no quota.

## Fail-open behavior

The limit protects the inbox, but a broken limiter must not block real messages.

- If no Upstash variables are set, the limit is skipped and the server logs `contact: rate limit disabled, Upstash env vars not set` once per process.
- If Upstash throws at runtime, the server logs an error and sends the email anyway.

Because of this, a missing or mistyped variable in production fails silently apart from that one warning. Check the logs after setting up a new environment.
