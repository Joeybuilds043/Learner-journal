# MarketPilot AI

**A dark, chart-first workspace for macro research, cross-asset markets and disciplined journaling.**

MarketPilot AI brings US inflation, Treasury yields, dollar strength, volatility and major asset prices into one research terminal. Its assistant, **Atlas**, explains market context and competing scenarios rather than presenting unsupported trading signals.

## Live app and services

- **GitHub Pages app:** https://joeybuilds043.github.io/Learner-journal/
- **Repository:** https://github.com/Joeybuilds043/Learner-journal
- **Market data Worker:** https://marketsignal-data.joeybuilds043.workers.dev/
- **Existing AI/data Worker:** https://marketpilot-ai.joeybuilds043.workers.dev/

The existing Pages app remains the production frontend. The Streamlit UI is a separate research prototype; it is not automatically synchronized with Pages. The optional FastAPI AI service is in \`backend/\`. It is designed to use Gemini by default and can be deployed separately.

## Application sections

- **Markets:** CPI year-over-year monthly bars and 3-month average, PPI, US 10-year yield, broad dollar index, VIX and cross-asset prices.
- **AI Analyst:** source-aware answers that separate observations, interpretation, scenarios and invalidation conditions.
- **Daily Brief:** on-demand research from the available data and headline context.
- **News & Market Impact:** source-led news discovery; a headline is not proof of causation.
- **Historical Relationships:** cross-asset comparisons with missing trading sessions handled explicitly.
- **Your Journal:** the original browser-local journal with entry search, export/import and deletion.
- **Profile:** browser-local workspace preferences. This is not account authentication.

Navigation in the Pages app is through the three-dot menu. The older Markets/Charts row has been removed from the visible interface. The app name is standardized as **MarketPilot AI**; the repository path and live URL are unchanged.

## AI configuration

### Default model candidate: Gemini 3.8 Flash

The optional FastAPI service defaults to Google Gemini with \`GEMINI_MODEL=gemini-3.8-flash\`. Create a key in Google AI Studio and configure it only as a server-side secret.

Official documentation:
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

The free tier is model-, project- and account-quota-limited. Gemini request-per-day quotas reset at midnight Pacific Time; request-per-minute and token-per-minute limits are separate. Google's Gemini API free-tier content may be used to improve Google products. Do not send confidential journal entries, passwords, account identifiers or sensitive personal information through a free-tier API key.

### Deploy the optional FastAPI service

1. Open Render and create a Blueprint from this repository using the root \`render.yaml\`.
2. Add \`GEMINI_API_KEY\` as a Render secret. Do not commit it to GitHub.
3. Wait until the service's \`/health\` endpoint reports healthy.
4. Add the deployed public service URL to \`window.MARKETPILOT_AI_API_BASE\` in \`marketpilot-config.js\`.
5. Keep \`window.MARKETPILOT_API_BASE\` pointing to the existing Cloudflare Worker. Market quotes, history and news continue to use that Worker.

\`MARKETPILOT_AI_API_BASE\` is blank by default. This is intentional: the current Worker remains the AI endpoint until the separate Gemini service has actually been deployed and tested. No deployed Worker code is changed by this repository update.

The Gemini backend makes one model call per answer, caps output at 1,200 tokens, and applies a basic backend limit of 4 requests per minute and 15 requests per IP per UTC day. The browser has a separate soft cap of 15 AI calls per UTC day. These limits reduce accidental usage; the in-memory backend counters reset if the service restarts and are not production-grade abuse protection. Render's free service may sleep while idle.

### Optional xAI provider

The FastAPI service can use xAI only when \`AI_PROVIDER=xai\`, \`XAI_API_KEY\` and \`GROK_MODEL\` are explicitly configured. xAI API billing is separate from a consumer Grok subscription. The system does not silently switch to a paid provider.

## Data and analytical limitations

- **FRED via the Market data Worker:** CPI, PPI, US 10-year Treasury yield and broad dollar observations. Economic data is released periodically, not tick-by-tick.
- **Yahoo Finance through the existing AI/data Worker:** cross-asset chart data may be delayed, incomplete or unavailable.
- **Public crypto market endpoints:** availability and geographic access can vary.
- **News RSS/search:** coverage is incomplete; verify original publishers before drawing conclusions.

The application should label stale or unavailable data rather than invent prices or events. Correlation is not causation, and historical relationships can change across market regimes.

## Journal preservation and privacy

The original Pages journal storage key remains exactly \`learner-journal-entries-v1\`. The update does not clear, rename, migrate or overwrite this browser storage. Export a JSON backup before changing devices or browsers.

The Pages journal is browser-local and is not synchronized across devices. The Streamlit prototype's journal and profile are session-only. A durable cross-device account requires separately configured authentication and database services; login is not claimed to be active.
