(() => {
  "use strict";

  const API_URL = "https://marketsignal-data.asadlang05.workers.dev/";

  const style = document.createElement("style");
  style.textContent = `
    .ms-live{margin:18px 0 24px;padding:16px;border:1px solid #25354b;border-radius:18px;background:linear-gradient(145deg,#101b2c,#0c1727);color:#eef4ff}
    .ms-live *{box-sizing:border-box}
    .ms-live-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px}
    .ms-live-kicker{margin:0 0 5px;color:#68e0bd!important;font-size:10px!important;letter-spacing:1.4px;font-weight:800}
    .ms-live h2{margin:0;font-size:20px}
    .ms-live .ms-subtitle{margin:5px 0 0;color:#9aacc4;font-size:12px}
    .ms-live button{padding:10px 13px;border:1px solid #68e0bd;border-radius:10px;background:#68e0bd;color:#071a17;font-weight:800;cursor:pointer}
    .ms-live button:disabled{opacity:.6;cursor:wait}
    .ms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:15px}
    .ms-card{padding:12px;border:1px solid #25354b;border-radius:12px;background:#0a1422;min-width:0}
    .ms-label{color:#9aacc4;font-size:11px;line-height:1.35}
    .ms-value{font-size:23px;font-weight:800;letter-spacing:-.5px;margin:7px 0 4px;overflow-wrap:anywhere}
    .ms-date{color:#8194ad;font-size:10px;line-height:1.4}
    .ms-change{font-size:11px;margin-top:7px;font-weight:700}
    .ms-change.up{color:#ffb0a9}.ms-change.down{color:#8fe6c7}.ms-change.flat{color:#c5d0e0}
    .ms-read{margin-top:12px;padding:13px;border:1px solid #2d435a;border-radius:12px;background:#122136}
    .ms-read-title{font-size:11px;font-weight:800;letter-spacing:.7px;color:#86b5ff;margin-bottom:6px}
    .ms-read p{margin:0;color:#d8e3f3;font-size:12px;line-height:1.55}
    .ms-status{margin:10px 0 0;color:#68e0bd;font-size:11px;line-height:1.45}
    .ms-footnote{margin:8px 0 0;color:#8194ad;font-size:10px;line-height:1.45}
    @media(min-width:560px){.ms-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:360px){.ms-live{padding:12px}.ms-grid{gap:7px}.ms-card{padding:10px}.ms-value{font-size:20px}.ms-live-head{gap:8px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "ms-live";
  section.setAttribute("aria-label", "Macro data dashboard");
  section.innerHTML = `
    <div class="ms-live-head">
      <div>
        <p class="ms-live-kicker">MARKETSIGNAL / DATA TERMINAL</p>
        <h2>Macro Dashboard</h2>
        <p class="ms-subtitle">Published US macro data · quick trader read</p>
      </div>
      <button id="ms-refresh" type="button">Refresh</button>
    </div>
    <div class="ms-grid" id="ms-grid"><div class="ms-card">Connecting to data source…</div></div>
    <div class="ms-read">
      <div class="ms-read-title">TRADER'S READ</div>
      <p id="ms-read-text">Waiting for the latest observations. Treat macro data as context, not an entry signal.</p>
    </div>
    <div class="ms-status" id="ms-status" role="status" aria-live="polite">Connecting to MarketSignal data source…</div>
    <p class="ms-footnote">Source: FRED. CPI/PPI are release-based indicators; yields and the broad dollar index are not tick-by-tick prices. Broad dollar index is not the ICE DXY. VIX will appear when the data service provides it.</p>
  `;

  const hero = document.querySelector(".hero");
  if (hero) hero.insertAdjacentElement("afterend", section);
  else document.querySelector("main")?.prepend(section);

  const grid = section.querySelector("#ms-grid");
  const status = section.querySelector("#ms-status");
  const read = section.querySelector("#ms-read-text");
  const button = section.querySelector("#ms-refresh");

  function fmt(value, decimals = 3) {
    if (value == null || value === "" || !Number.isFinite(Number(value))) return "Unavailable";
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals });
  }

  function card(label, item, opts = {}) {
    const el = document.createElement("div");
    el.className = "ms-card";
    const title = document.createElement("div");
    title.className = "ms-label";
    title.textContent = label;
    const value = document.createElement("div");
    value.className = "ms-value";
    value.textContent = item?.value == null ? "Unavailable" : fmt(item.value) + (opts.suffix || "");
    const date = document.createElement("div");
    date.className = "ms-date";
    date.textContent = item?.date || item?.latestDate ? "Observation: " + (item.date || item.latestDate) : "No observation date supplied";
    el.append(title, value, date);
    if (item?.change != null && Number.isFinite(Number(item.change))) {
      const change = document.createElement("div");
      const n = Number(item.change);
      change.className = "ms-change " + (n > 0 ? "up" : n < 0 ? "down" : "flat");
      change.textContent = "Change: " + (n > 0 ? "+" : "") + fmt(n, 3) + (opts.changeSuffix || "");
      el.appendChild(change);
    }
    return el;
  }

  function traderRead(data) {
    const lines = [];
    const cpi = data.cpiYearOverYear?.value;
    const ppi = data.ppi?.value;
    const yieldChange = Number(data.us10y?.change);
    const dollarChange = Number(data.dollar?.change);

    if (cpi != null) lines.push("CPI YoY is " + fmt(cpi, 2) + "%; compare it with consensus and the prior release before judging the inflation surprise.");
    if (ppi != null) lines.push("PPI index is " + fmt(ppi, 3) + "; the index level alone is not an inflation surprise—check its change and release expectations.");
    if (Number.isFinite(yieldChange)) lines.push("10-year yield change: " + (yieldChange > 0 ? "higher" : yieldChange < 0 ? "lower" : "unchanged") + " (" + (yieldChange > 0 ? "+" : "") + fmt(yieldChange, 3) + ").");
    if (Number.isFinite(dollarChange)) lines.push("Broad US dollar index change: " + (dollarChange > 0 ? "higher" : dollarChange < 0 ? "lower" : "unchanged") + " (" + (dollarChange > 0 ? "+" : "") + fmt(dollarChange, 3) + ").");
    if (!lines.length) return "Data loaded, but the service did not provide enough change fields for a directional read. Check release actual vs consensus, yields, dollar and price action.";
    return lines.join(" ") + " These are context clues, not a buy/sell signal. Confirm with price action, liquidity and the event's market expectations.";
  }

  async function refresh() {
    button.disabled = true;
    status.textContent = "Fetching latest published observations…";
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Data request failed.");
      const data = result.data || {};
      grid.replaceChildren();
      grid.appendChild(card("US 10-Year Treasury Yield", data.us10y, { suffix: "%", changeSuffix: " pp" }));
      grid.appendChild(card("Broad US Dollar Index · not ICE DXY", data.dollar));
      grid.appendChild(card("CPI Index", data.cpi));
      grid.appendChild(card("CPI Year-over-Year", data.cpiYearOverYear ? { value: data.cpiYearOverYear.value, date: data.cpiYearOverYear.latestDate, change: data.cpiYearOverYear.change } : null, { suffix: "%" }));
      grid.appendChild(card("PPI Index", data.ppi));
      if (data.vix) {
        grid.appendChild(card("VIX · expected equity volatility", data.vix));
      } else {
        grid.appendChild(card("VIX · volatility gauge", null));
      }
      read.textContent = traderRead(data);
      status.textContent = "Data request successful. Retrieved: " + (result.fetchedAt ? new Date(result.fetchedAt).toLocaleString() : "timestamp not supplied");
    } catch (error) {
      grid.replaceChildren();
      ["US 10-Year Treasury Yield","Broad US Dollar Index","CPI Index","CPI Year-over-Year","PPI Index","VIX"].forEach(label => grid.appendChild(card(label, null)));
      read.textContent = "Macro data could not be loaded. Refresh again; do not infer a market bias from missing data.";
      status.textContent = "Data unavailable: " + (error.message || "request failed");
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener("click", refresh);
  refresh();
})();
