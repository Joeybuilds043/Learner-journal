# MarketPilot AI — Gemini API service

This optional FastAPI service handles AI analysis for the existing GitHub Pages app. The existing Cloudflare Worker remains responsible for market quotes, historical prices and news. The frontend routes only /api/analyze and /api/daily-brief here after this service has been deployed and verified.

## Deploy with Render

The repository-root render.yaml is the Blueprint. In Render, create a Blueprint from this GitHub repository and add GEMINI_API_KEY as a secret. The service runs from backend/ and exposes /health.

Default provider: Google Gemini, model gemini-3.8-flash. Create the key in Google AI Studio. Never put it in GitHub, browser JavaScript, marketpilot-config.js or chat.

After deployment, copy the public service URL into window.MARKETPILOT_AI_API_BASE in marketpilot-config.js. It is blank by default, so the existing Cloudflare Worker remains active until you deliberately connect and test the new service.

## Provider selection

- Default free-tier candidate: AI_PROVIDER=gemini, GEMINI_MODEL=gemini-3.8-flash, GEMINI_API_KEY.
- Optional xAI API: AI_PROVIDER=xai, GROK_MODEL and XAI_API_KEY. xAI API billing is separate from a consumer Grok subscription. It is never selected automatically.

The backend makes one model call per answer and caps output at 1,200 tokens. It accepts market context and recent conversation context from the frontend. It does not use the old two-agent CrewAI workflow, which made two model calls for one answer.

## Limits and privacy

Default backend limits are 4 requests/minute and 15 requests per IP per UTC day. The browser also applies a soft 15-request daily cap. These counters are in memory and reset if the service restarts; they are guardrails for low-volume personal use, not production-grade anti-abuse protection. Provider quotas are independent and may reset on a different schedule.

Google's Gemini API free tier is quota-limited and Google states that free-tier content may be used to improve its products. Do not send confidential journal notes, passwords, account information or other sensitive information through a free-tier API key. Review the current Google AI Studio pricing, rate limits and terms.

## Data boundaries

The frontend supplies current assets, macro readings, cross-asset groups and optional historical context. This service does not provide broker execution or a verified economic calendar. It must not invent missing data, headlines or prices.
