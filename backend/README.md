# MarketPilot AI backend

Python 3.12 + FastAPI + CrewAI. The service retrieves current public Binance spot ticker data and the existing MarketSignal FRED Worker data on the server, then runs a two-agent CrewAI workflow (market analyst and risk reviewer) using the Gemini API.

## Run locally

1. Create a virtual environment and install `requirements.txt`.
2. Set `GEMINI_API_KEY` in your shell environment (never commit it).
3. Run `uvicorn main:app --reload --port 7860` from this directory.
4. Test `GET /health`, `POST /api/analyze` with `{"question":"Summarize BTC and ETH and explain the main uncertainties."}`, and `POST /api/daily-brief` with `{}`.

Set `PAGES_ORIGIN` to the exact GitHub Pages origin when deploying. The frontend can be configured with `window.MARKETPILOT_API_BASE` pointing to the public service URL. Do not expose `GEMINI_API_KEY` in frontend JavaScript.

## Free-tier reality

The Gemini API free tier has model-specific RPM/TPM/RPD quotas, not unlimited requests. Binance public market-data endpoints do not require a key but are rate-limited and can be unavailable in some regions. This service limits requests per IP as a basic guardrail; that in-memory limit is not sufficient for a public production service. Add persistent gateway rate limiting before inviting public traffic.

## Data quality

This version uses Binance spot tickers for BTC, ETH, SOL, BNB and XRP, plus the existing FRED Worker. It does not include a news feed, stock-market feed, official economic calendar or broker execution. The AI must not invent those facts. The SQL schema is a proposed data model; account authentication and durable report storage are not active yet.
