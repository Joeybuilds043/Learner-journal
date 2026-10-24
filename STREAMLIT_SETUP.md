# CandleDesk — Streamlit rebuild

CandleDesk is the new Python/Streamlit version of the market dashboard. The existing GitHub Pages app remains untouched while this version is prepared and deployed.

## Included

- TradingView-inspired dark interface with straightforward horizontal navigation.
- Separate macro/market charts: CPI YoY, PPI YoY, US 10-year Treasury yield, DXY candlesticks, VIX fear-index bars, S&P 500, gold and Bitcoin.
- Public observations from FRED and Yahoo Finance; Google News RSS headlines for research.
- Pip, a conversational financial research assistant powered by Grok (xAI API) once its server-side key is configured.
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

## Connect Grok (xAI API)

After the Streamlit app is deployed, open the app's **Settings → Secrets** and add:

```toml
XAI_API_KEY = "your-xai-api-key"
# Optional: defaults to grok-4.7
GROK_MODEL = "grok-4.7"
```

Create the API key in the [xAI Console](https://console.x.ai/). Do not put the key in source files, public GitHub, screenshots, or chat messages. The app sends requests server-side to the official xAI Responses API and sets `store = false` for API responses.

**Billing note:** Grok API access is separate from the consumer Grok chat subscription and may require billing/credits. It is not assumed to be free or unlimited. Check current API pricing and limits in the xAI Console before using it heavily.

## Data notes

- CPI and PPI are calculated year-over-year from monthly FRED index observations; release dates can lag the current day.
- US 10-year yield comes from FRED's DGS10 series.
- DXY, VIX, S&P 500, gold and BTC use Yahoo Finance's chart endpoint and can be delayed or unavailable.
- News discovery uses a public RSS feed and may be incomplete. It is not a paid, guaranteed real-time terminal.
- Historical correlation is computed from available daily returns and is not a causal or predictive claim.
- The journal is session-only in this prototype. Export CSV to keep your entries; permanent private storage requires a database.
- The old Pages app and its existing browser-local journal storage have not been deleted or cleared.
