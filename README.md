# MarketSignal — Macro Terminal & Trading Journal

[![Deploy MarketSignal](https://github.com/asadlang05-ctrl/Learner-journal/actions/workflows/deploy.yml/badge.svg)](https://github.com/asadlang05-ctrl/Learner-journal/actions/workflows/deploy.yml)

**Live demo:** https://asadlang05-ctrl.github.io/Learner-journal/

MarketSignal is a mobile-first macro dashboard and trading journal. It combines published US economic observations with a structured place to record a market expectation, what price action actually did, and the lesson to carry into the next review.

## Features

- **Macro dashboard:** latest available US 10-year Treasury yield, broad US dollar index, CPI, PPI and VIX observations from FRED.
- **Historical chart:** inspect an indicator over selected periods when the source endpoint returns enough observations.
- **Manual values:** save clearly labelled local overrides without altering the official source data.
- **Trading journal:** record DXY/dollar context, yields, CPI/PPI releases, expectations, market outcomes and lessons.
- **Search and backup:** search saved reviews, delete an entry, export a JSON backup and import a prior backup.
- **Progressive Web App:** installable app shell with a service worker for core offline assets.

## Technology

- HTML, CSS and vanilla JavaScript
- Progressive Web App manifest and service worker
- GitHub Pages and GitHub Actions deployment
- Cloudflare Worker as the server-side data proxy
- FRED API for published economic observations
- Cloudflare D1 for storing historical observations

## Architecture

The browser loads the static app from GitHub Pages. The dashboard requests data from the Cloudflare Worker, which calls FRED using a server-side secret. The FRED API key is not placed in the browser code. The Worker can store requested historical observations in D1. Journal entries and manual dashboard overrides remain in the visitor's browser storage.

## Data and privacy notes

FRED indicators are published economic observations, not tick-by-tick prices. Release dates can lag the current date. The broad US dollar index shown here is not the ICE DXY index. Journal entries and manual overrides are stored locally in the current browser; they do not automatically sync to another device. Export a backup before clearing site data or changing devices.

MarketSignal is a learning and analysis tool, not an automated trading system or financial advice.

## Run locally

Because this is a static web app, the front end can be served from a local static HTTP server or hosted on GitHub Pages. The macro dashboard uses the deployed Cloudflare Worker endpoint configured in `macro-dashboard.js`; a working deployment requires the Worker secret `FRED_API_KEY` to be configured server-side.
