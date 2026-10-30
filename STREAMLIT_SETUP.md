# MarketPilot AI — Streamlit setup

The Streamlit UI is a separate build of MarketPilot AI. It uses Plotly for richer financial charts and calls Grok server-side when the xAI API key is configured. The existing GitHub Pages app remains available and its browser-local journal is not changed.

## Deploy

**Open the pre-filled deployment page:** https://share.streamlit.io/deploy?repository=Joeybuilds043/Learner-journal&branch=main&mainModule=streamlit_app.py

1. Sign in to Streamlit Community Cloud with GitHub.
2. Select repository `Joeybuilds043/Learner-journal`.
3. Select branch `main`.
4. Set main file path to `streamlit_app.py`.
5. Deploy. Wait for the app health/build status to report success before using it.

The public Streamlit URL is assigned by Streamlit after deployment. It cannot be confirmed from this repository alone.

## Configure Grok (xAI API)

After deployment, open the app's **Settings → Secrets** and add:

```toml
XAI_API_KEY = "your-xai-api-key"
GROK_MODEL = "grok-4.7"
```

Create and manage the key in https://console.x.ai/. Never add the key to source code, browser JavaScript, GitHub commits, screenshots, or chat messages. The app uses the official server-side xAI Responses API and requests `store = false`.

Grok API access is billed separately from the consumer Grok subscription and may require credits. It is not assumed to be free or unlimited. Confirm current rates and usage in the xAI Console.

## What's included

- Dark, ice-blue market dashboard with CPI YoY bars, a 3-month trend curve and 2% reference.
- PPI inflation, US 10-year yield, DXY candlesticks, VIX bars, S&P 500, gold and BTC charts.
- **Atlas**, a financial research assistant using available observations and dated headlines.
- Daily Brief, Historical Patterns, Your Journal, CSV export, and Profile preferences.
- Saad Hashmani inspiration credit.

## Data and storage notes

- CPI and PPI year-over-year values are calculated from monthly FRED index observations.
- US 10-year yield comes from FRED's DGS10 series.
- DXY, VIX, S&P 500, gold and BTC use Yahoo Finance's chart endpoint; values may be delayed.
- News discovery uses a public Google News RSS feed and may be incomplete.
- Historical correlations are based on available daily returns; they are not causal or predictive claims.
- Streamlit journal entries and profile preferences are currently session-only. Export CSV for a local backup.
- The old GitHub Pages app and `learner-journal-entries-v1` browser storage are not deleted or cleared by this Streamlit build.
