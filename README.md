# CandleDesk

**Market intelligence, without the noise.**

CandleDesk is a dark, chart-first market research workspace built with Python and Streamlit. It brings inflation, Treasury yields, dollar strength, volatility, and cross-asset context into one interface, with a plain-English research assistant named **Pip**.

> CandleDesk is for education and market research, not for executing trades or providing personalized financial advice.

## What's in the app

- **Market dashboard:** separate charts for US CPI year-over-year, US PPI year-over-year, the 10-year Treasury yield, DXY candlesticks, VIX volatility bars, S&P 500, gold, and Bitcoin.
- **Research brief:** public news headlines with source links, plus an optional AI-generated summary.
- **Pip:** a conversational market analyst designed to distinguish observations, interpretation, and scenarios.
- **Trading journal:** thesis, market outcome, and lesson fields with CSV export. The current prototype keeps entries in the active session, so export your file before leaving.
- **Historical patterns:** a heatmap of daily-return correlations for available market series. Correlation does not imply causation.

## Run on Streamlit Community Cloud

1. Sign in at [Streamlit Community Cloud](https://share.streamlit.io/) using GitHub.
2. Create an app from this repository: `Joeybuilds043/Learner-journal`.
3. Select branch `main`.
4. Set the main file path to `streamlit_app.py`.
5. Deploy. Streamlit assigns the final public URL after deployment.

Local requirements are in [requirements.txt](requirements.txt). Full instructions are in [STREAMLIT_SETUP.md](STREAMLIT_SETUP.md).

## Enable Pip with Gemini

The dashboard and charts are designed to work without an AI API key. To enable AI responses, create a Gemini API key through [Google AI Studio](https://aistudio.google.com/) and add it in Streamlit Community Cloud under **App settings → Secrets**:

```toml
GEMINI_API_KEY = "your-key-here"
# Optional; the default is gemini-3.8-flash
GEMINI_MODEL = "gemini-3.8-flash"
```

Never commit an actual API key to GitHub or paste it into the chat. Gemini free usage has rate limits and can be temporarily unavailable. Pip will report when the API cannot respond rather than fabricate a market answer.

## Data sources and limitations

- **FRED:** CPI index, PPI index, and DGS10 Treasury yield. CPI/PPI year-over-year values are calculated from monthly index data; release observations can lag the current day.
- **Yahoo Finance chart endpoint:** DXY, VIX, S&P 500, gold futures, and BTC/USD. These quotes may be delayed or unavailable.
- **Google News RSS:** headline discovery. Coverage can be incomplete; a headline alone does not prove a causal market impact.
- **Gemini API:** available only when the server-side secret is configured and quota is available.

No synthetic prices are used when a data provider fails. Check observation timestamps and sources before relying on a chart.

## Privacy and legacy app

The earlier GitHub Pages app remains at https://joeybuilds043.github.io/Learner-journal/ while the Streamlit version is deployed separately. This new app does not clear the previous app's browser storage. The Streamlit journal is session-only for now and is not a substitute for a private, persistent database.

