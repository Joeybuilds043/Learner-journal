
(() => {
  "use strict";

  const API_URL = "PASTE_YOUR_WORKER_URL_HERE";

  const style = document.createElement("style");
  style.textContent = `
    .ms-live{margin:22px 0;padding:18px;border:1px solid #25354b;border-radius:18px;background:#101b2c;color:#eef4ff}
    .ms-live *{box-sizing:border-box}
    .ms-live-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px}
    .ms-live h2{margin:0;font-size:20px}
    .ms-live p{color:#9aacc4;font-size:12px}
    .ms-live button{padding:10px 14px;border:0;border-radius:10px;background:#68e0bd;color:#071a17;font-weight:800}
    .ms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}
    .ms-card{padding:14px;border:1px solid #25354b;border-radius:12px;background:#0c1727;overflow-wrap:anywhere}
    .ms-label,.ms-date{color:#9aacc4;font-size:11px}
    .ms-value{font-size:25px;font-weight:800;margin:9px 0}
    .ms-status{margin-top:14px;font-size:12px;color:#68e0bd}
    @media(max-width:420px){.ms-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "ms-live";
  section.innerHTML = `
    <div class="ms-live-head">
      <div>
        <p>MARKETSIGNAL / DATA TERMINAL</p>
        <h2>Live Macro Dashboard</h2>
        <p>Latest published US economic observations</p>
      </div>
      <button id="ms-refresh">Refresh data</button>
    </div>
    <div class="ms-grid" id="ms-grid">Connecting to data source…</div>
    <div class="ms-status" id="ms-status" role="status"></div>
    <p>Source: FRED. These are published economic observations, not tick-by-tick prices or trading signals.</p>
  `;

  const hero = document.querySelector(".hero");
  if (hero) hero.insertAdjacentElement("afterend", section);
  else document.querySelector("main")?.prepend(section);

  const grid = section.querySelector("#ms-grid");
  const status = section.querySelector("#ms-status");
  const button = section.querySelector("#ms-refresh");

  function addCard(label, item, percent = false) {
    const card = document.createElement("div");
    card.className = "ms-card";

    const title = document.createElement("div");
    title.className = "ms-label";
    title.textContent = label;

    const value = document.createElement("div");
    value.className = "ms-value";
    value.textContent = item?.value == null
      ? "Unavailable"
      : Number(item.value).toLocaleString(undefined, {
          maximumFractionDigits: 3
        }) + (percent ? "%" : "");

    const date = document.createElement("div");
    date.className = "ms-date";
    date.textContent = item?.date
      ? "Observation date: " + item.date
      : item?.latestDate
        ? "Observation date: " + item.latestDate
        : "";

    card.append(title, value, date);
    grid.appendChild(card);
  }

  async function refresh() {
    button.disabled = true;
    status.textContent = "Fetching latest published data…";

    try {
      if (API_URL.includes("PASTE_YOUR_WORKER_URL_HERE")) {
        throw new Error("Worker URL abhi configure nahi hua.");
      }

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Data request failed.");
      }

      grid.replaceChildren();
      addCard("US 10-Year Treasury Yield", result.data.us10y, true);
      addCard("Broad US Dollar Index", result.data.dollar);
      addCard("US CPI Index", result.data.cpi);
      addCard("US PPI Index", result.data.ppi);

      if (result.data.cpiYearOverYear) {
        addCard("CPI Year-over-Year", {
          value: result.data.cpiYearOverYear.value,
          date: result.data.cpiYearOverYear.latestDate
        }, true);
      }

      status.textContent =
        "Updated: " + new Date(result.fetchedAt).toLocaleString();
    } catch (error) {
      status.textContent = "Data unavailable: " + error.message;
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener("click", refresh);
  refresh();
})();
