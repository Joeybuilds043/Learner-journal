# MarketPilot AI

**A dark, chart-first workspace for macro research and cross-asset market context.**

MarketPilot AI brings US inflation, producer prices, Treasury yields, dollar strength, volatility and major asset prices into one dashboard. Its research assistant is named **Atlas** and uses the xAI Grok API when the server-side key is configured.

## Current public app

The existing GitHub Pages version remains available while the Streamlit build is validated:

- **Live legacy app:** https://joeybuilds043.github.io/Learner-journal/
- **Repository:** https://github.com/Joeybuilds043/Learner-journal
- **Macro data service:** https://marketsignal-data.joeybuilds043.workers.dev/
- **Existing AI service:** https://marketpilot-ai.joeybuilds043.workers.dev/

The Streamlit build lives in `streamlit_app.py`. It is a separate deployment; a Streamlit URL is not active until the deployment is created in Streamlit Community Cloud. Do not delete the existing Pages app or its browser storage while testing the new version.

## Features

- **Markets dashboard:** CPI year-over-year monthly bars with a 3-month average and 2% reference, PPI inflation bars, 10-year Treasury yield, DXY candlesticks, VIX bars, S&P 500, gold and Bitcoin.
- **Atlas AI Analyst:** finance-focused explanations that separate observations, interpretation and scenarios; includes available dated market context and retrieved headlines.
- **Daily Brief:** headline discovery with an optional Grok-generated summary.
- **Historical Patterns:** correlations between available daily asset returns. Correlation is not causation.
- **Your Journal:** thesis, market outcome and lesson fields, CSV export, and individual entry deletion.
- **Profile:** session-only display preferences.
- **Saad Hashmani inspiration credit:** a short acknowledgement of the person who first introduced the project author to markets.

## Deploy the Streamlit UI

1. Open the [Streamlit Community Cloud deployment page](https://share.streamlit.io/deploy?repository=Joeybuilds043/Learner-journal&branch=main&mainModule=streamlit_app.py).
2. Sign in with GitHub and select repository `Joeybuilds043/Learner-journal`, branch `main`.
3. Set the main file path to `streamlit_app.py` and deploy.
4. After deployment succeeds, open the app's Settings → Secrets and configure the Grok API key as shown below.

Local dependencies are in `requirements.txt`; detailed instructions are in [STREAMLIT_SETUP.md](STREAMLIT_SETUP.md).

## Configure Grok

Add the key in Streamlit Community Cloud → App settings → Secrets. Do not commit it to GitHub, put it in frontend JavaScript, or paste it into a chat.

```toml
XAI_API_KEY = "your-xai-api-key"
GROK_MODEL = "grok-4.7"
```

The app calls the official xAI Responses API server-side. Grok API billing is separate from a consumer Grok subscription and may require credits; it is not unlimited or guaranteed free. Check the [xAI Console](https://console.x.ai/) for billing and usage.

## Data sources and limitations

- **FRED public CSV:** CPI index, PPI index and DGS10 Treasury yield. CPI/PPI year-over-year rates are calculated from monthly observations; releases are not real-time.
- **Yahoo Finance chart endpoint:** DXY, VIX, S&P 500, gold futures and BTC/USD. Quotes can be delayed, incomplete or unavailable.
- **Google News RSS:** headline discovery. Coverage is incomplete; headlines alone do not prove market causality.
- **xAI Grok API:** optional server-side assistant and brief generation, only when `XAI_API_KEY` is configured and account usage is available.

No synthetic market prices are intentionally generated when a provider fails. Check observation dates and sources before relying on a chart.

## Journal and privacy

The original Pages app uses browser-local storage key `learner-journal-entries-v1`. This project does not clear or overwrite that storage. The Streamlit prototype's own journal and profile preferences are session-only and are not a permanent database; export its journal as CSV if you use it. The two versions do not automatically sync entries.
