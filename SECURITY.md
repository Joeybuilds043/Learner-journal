# MarketSignal Security Review

**Review date:** 2026-10-20  
**Scope:** Public frontend source, journal backup import flow, Cloudflare Worker source and visible Worker bindings. This is a focused code review, not a full penetration test.

## Changes applied

- **HTML injection / XSS risk in dashboard rendering:** API-provided series labels and date strings were inserted into HTML/SVG markup without escaping. The dashboard now HTML-escapes those strings before insertion. Numeric chart values continue to be converted to numbers before plotting.
- **Oversized journal backup imports:** Import now rejects files larger than 2 MB, backups with more than 2,000 entries, and text fields longer than 10,000 characters. This reduces accidental or malicious browser-storage exhaustion from imported files.
- **Worker request throttling:** Added best-effort per-IP, per-path throttling in Worker memory: 60 requests/minute for the latest-data endpoint and 10 requests/minute for history. This is not a distributed or durable rate limiter; isolate restarts and traffic distributed across isolates can bypass it.
- **Input validation:** The Worker now rejects unsupported history ranges; accepted values are `30d`, `90d`, `1y`, and `5y`.
- **Error disclosure:** The Worker now returns a generic upstream-data error instead of forwarding internal exception details to clients.
- **Secret handling:** The Cloudflare configuration was inspected. `FRED_API_KEY` remains a Cloudflare secret binding, and `DB` remains a D1 binding. The key is not embedded in the public frontend repository.

## Remaining risks and required hardening

1. **Edge-level rate limiting is still recommended.** The in-memory Worker limiter is only a secondary safeguard. Configure a Cloudflare rate-limiting rule or a supported durable/native rate-limiting mechanism for the Worker endpoint before treating it as resistant to deliberate API abuse.
2. **The Worker endpoint is public.** CORS restricts which browser origins can read responses; it does not authenticate callers and does not stop scripts or command-line clients from sending requests. Do not treat CORS as access control.
3. **Journal privacy is device-local, not account-secured.** Entries and manual overrides live in browser `localStorage`. Anyone with access to that browser profile can inspect them, and any successful same-origin script injection could read them. Avoid entering passwords, API keys, or other secrets in journal notes.
4. **Live verification is incomplete.** The repository source changes and Cloudflare Worker upload were accepted by their respective APIs, but an external live HTTP test could not be completed from the review environment. Confirm the published Pages build, dashboard refresh, invalid-range response (HTTP 400), and throttling response (HTTP 429) from a normal browser/network.
5. **No claim of attack-proof security.** This review does not include authenticated-user testing, dependency scanning, a full threat model, or a third-party penetration test.

## Verification checklist

- [ ] Open the live MarketSignal app and confirm dashboard data loads.
- [ ] Confirm existing journal entries still appear after refresh.
- [ ] Import a normal backup and confirm it works.
- [ ] Confirm a backup larger than 2 MB is rejected.
- [ ] Confirm an unsupported history range returns HTTP 400.
- [ ] Send repeated requests from one client and confirm the Worker eventually returns HTTP 429.
- [ ] Add an edge-level rate limit before relying on the public API in production.
