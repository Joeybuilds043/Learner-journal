# CandleDesk — Streamlit rebuild

CandleDesk is the new Python/Streamlit version of the market dashboard. The existing GitHub Pages app remains untouched while this version is prepared and deployed.

## Included

- TradingView-inspired dark interface with straightforward horizontal navigation.
- Separate macro/market charts: CPI YoY, PPI YoY, US 10-year Treasury yield, DXY candlesticks, VIX fear-index bars, S&P 500, gold and Bitcoin.
- Public observations from FRED and Yahoo Finance; Google News RSS headlines for research.
- Pip, a conversational financial research assistant powered by Gemini once its server-side key is configured.
- Clear-chat control, session-based journal, CSV export, and historical correlation heatmap.

## Deploy on Streamlit Community Cloud

**Open the pre-filled deployment page:** [Deploy CandleDesk](https://share.streamlit.io/deploy?repository=Joeybuilds043/Learner-journal&branch=main&mainModule=streamlit_app.py)

1. Open the link above (or https://share.streamlit.io/) and sign in with GitHub.
2. Choose **Create app**.
3. Repository: `Joeybuilds043/Learner-journal`
4. Branch: `main`
5. Main file path: `streamlit_app.py`
6. Deploy the app. The first build can take several minutes.

The new app will receive a Streamlit URL such as `https://<chosen-name>.streamlit.app`. The exact URL is assigned by Streamlit during deployment; it is not available until that step succeeds.

## Add Gemini later (server-side secret)

After deployment, open the app's Settings → Secrets and add:

```toml
GEMINI_API_KEY = "your-key-here"
# Optional. Default model is gemini-3.8-flash.
# GEMINI_MODEL = "gemini-3.8-flash"
```

Do not put a real API key in source files or public GitHub. Use Google AI Studio to create the key, and confirm the account's free-tier quotas. Free use is rate-limited and is not unlimited. The code tries `gemini-3.8-flash` first and `gemini-3.6-flash` as a fallback.

## Data notes

- CPI and PPI are calculated year-over-year from monthly FRED index observations; release dates can lag the current day.
- US 10-year yield comes from FRED's DGS10 series.
- DXY, VIX, S&P 500, gold and BTC use Yahoo Finance's chart endpoint and can be delayed or unavailable.
- News discovery uses a public RSS feed and may be incomplete. It is not a paid, guaranteed real-time terminal.
- Historical correlation is computed from available daily returns and is not a causal or predictive claim.
- The journal is session-only in this prototype. Export CSV to keep your entries; permanent private storage requires a database.
- The old Pages app and its existing browser-local journal storage have not been deleted or cleared.
