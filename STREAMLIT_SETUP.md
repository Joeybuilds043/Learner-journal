# MarketPilot AI — Streamlit research prototype

The Streamlit UI is a separate research prototype. The existing GitHub Pages app remains the primary public frontend; its browser-local journal is not changed by this prototype.

## Deploy

Open the pre-filled deployment page:

https://share.streamlit.io/deploy?repository=Joeybuilds043/Learner-journal&branch=main&mainModule=streamlit_app.py

1. Sign in to Streamlit Community Cloud with GitHub.
2. Select repository \`Joeybuilds043/Learner-journal\`, branch \`main\`.
3. Set main file path to \`streamlit_app.py\`.
4. Deploy. Streamlit assigns the public URL after deployment.

## Configure the AI provider

The default provider is Gemini:

\`\`\`toml
AI_PROVIDER = "gemini"
GEMINI_API_KEY = "your-gemini-api-key"
GEMINI_MODEL = "gemini-3.8-flash"
MAX_AI_REQUESTS_PER_DAY = "15"
\`\`\`

The key belongs only in Streamlit Cloud → App settings → Secrets. Never commit it, put it in browser JavaScript or paste it into chat.

The app caps its own AI use at 15 requests per Streamlit session per UTC day by default. This is separate from Google's model-specific request/token quotas. Provider reset windows are not guaranteed to align with the app's UTC counter.

**Privacy notice:** Google's Gemini API free-tier content may be used to improve Google products. Do not submit confidential journal notes, passwords, account identifiers or sensitive personal information through a free-tier key. Review the current [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

### Optional xAI provider

Grok can be selected explicitly, but its API is billed separately from a consumer Grok subscription:

\`\`\`toml
AI_PROVIDER = "xai"
XAI_API_KEY = "your-xai-api-key"
GROK_MODEL = "grok-4.7"
\`\`\`

The app does not automatically fall back to a paid provider.

## Research features

- Dark, ice-blue Markets dashboard with CPI, PPI, 10Y yield, dollar, VIX, equities, gold and crypto.
- Atlas AI Analyst and Daily Brief.
- Historical Patterns, Your Journal and Profile.
- Three-dot vertical workspace navigation.
- Recent conversation context for the latest eight messages in the active session.

## Data and storage

- CPI/PPI year-over-year calculations do not forward-fill missing observations.
- Historical returns are calculated on each instrument's own observed trading dates; non-overlapping dates are not filled with synthetic prices.
- FRED and Yahoo Finance observations may be delayed or unavailable.
- Google News RSS provides headline discovery, not complete article text.
- Streamlit journal entries and profile preferences are session-only. Export the journal as CSV if you use it.
- The original Pages journal key \`learner-journal-entries-v1\` is untouched and does not sync to Streamlit.
