(() => {
  "use strict";
  const API_URL = "https://marketsignal-data.asadlang05.workers.dev/";
  const style = document.createElement("style");
  style.textContent = `
    .ms-live{margin:12px 0 18px;padding:14px;border:1px solid #263a50;border-radius:17px;background:linear-gradient(145deg,#101d2b,#0a1220);color:#edf5ff;box-shadow:0 12px 34px #0002}
    .ms-live *{box-sizing:border-box}.ms-live-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .ms-live-kicker{margin:0 0 3px;color:#69f0c1!important;font-size:9px!important;letter-spacing:1.5px;font-weight:900}
    .ms-live h2{margin:0;font-size:19px;letter-spacing:-.4px}.ms-live .ms-subtitle{margin:4px 0 0;color:#94a9c2;font-size:10px}
    .ms-live button{padding:8px 11px;border:1px solid #397966;border-radius:9px;background:#12392f;color:#80f4ce;font-size:11px;font-weight:800;cursor:pointer}
    .ms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
    .ms-card{padding:11px;border:1px solid #25384e;border-radius:12px;background:linear-gradient(145deg,#101c2b,#0b1421);min-width:0;overflow:hidden}
    .ms-label{color:#9badc3;font-size:10px;line-height:1.35;min-height:26px}
    .ms-value{font-size:23px;font-weight:850;letter-spacing:-.8px;margin:5px 0 2px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
    .ms-date{color:#7188a3;font-size:9px;line-height:1.35}
    .ms-change{font-size:10px;margin-top:5px;font-weight:750}.ms-change.up{color:#ff9d9d}.ms-change.down{color:#75e8be}.ms-change.flat{color:#c2d0e0}
    .ms-chart{margin-top:9px;padding-top:7px;border-top:1px solid #24364b}.ms-chart svg{display:block;width:100%;height:38px;overflow:visible}
    .ms-chart-label{display:flex;justify-content:space-between;color:#7188a3;font-size:9px;margin-top:2px}
    .ms-read{margin-top:9px;padding:11px;border:1px solid #29465a;border-radius:12px;background:#0e1e2d}
    .ms-read-title{font-size:9px;font-weight:900;letter-spacing:1px;color:#69f0c1;margin-bottom:5px}
    .ms-read p{margin:0;color:#d3e0ef;font-size:11px;line-height:1.5}
    .ms-status{margin:8px 0 0;color:#8ca2ba;font-size:9px;line-height:1.4}
    .ms-footnote{margin:6px 0 0;color:#71849a;font-size:9px;line-height:1.4}
    .ms-gauge{height:5px;margin:9px 0 6px;border-radius:8px;background:linear-gradient(90deg,#69f0c1 0%,#d9db83 45%,#ff9d9d 100%);position:relative}
    .ms-gauge i{position:absolute;top:-3px;width:3px;height:11px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px #0b1421}
    @media(min-width:560px){.ms-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:360px){.ms-live{padding:10px}.ms-grid{gap:6px}.ms-card{padding:9px}.ms-value{font-size:20px}}
  `;
  document.head.appendChild(style);
  const section = document.createElement("section");
  section.className = "ms-live";
  section.setAttribute("aria-label","Macro market dashboard");
  section.innerHTML = `
    <div class="ms-live-head"><div><p class="ms-live-kicker">MARKETSIGNAL / MACRO TERMINAL</p><h2>Market pulse</h2><p class="ms-subtitle">US macro · latest available readings</p></div><button id="ms-refresh" type="button">↻ Refresh</button></div>
    <div class="ms-grid" id="ms-grid"><div class="ms-card">Loading data…</div></div>
    <div class="ms-read"><div class="ms-read-title">MACRO READ</div><p id="ms-read-text">Loading latest observations.</p></div>
    <div class="ms-status" id="ms-status" role="status" aria-live="polite">Connecting…</div>
    <p class="ms-footnote">Data source: FRED. Release data can lag. Broad dollar index is not ICE DXY. VIX is shown only when the data service supplies it.</p>`;
  const hero = document.querySelector(".hero");
  if (hero) hero.insertAdjacentElement("afterend",section); else document.querySelector("main")?.prepend(section);
  const grid=section.querySelector("#ms-grid"), status=section.querySelector("#ms-status"), read=section.querySelector("#ms-read-text"), button=section.querySelector("#ms-refresh");
  const num = v => v!==null && v!=="" && Number.isFinite(Number(v)) ? Number(v) : null;
  const fmt = (v,d=2) => num(v)===null ? "—" : Number(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:d,useGrouping:false});
  const dateOf = x => x?.date || x?.latestDate || x?.observationDate || "";
  function percentChange(item) {
    const v=num(item?.value), ch=num(item?.change);
    if(v===null || ch===null || v===ch) return null;
    return ch/(v-ch)*100;
  }
  function sparkline(current, previous, color) {
    const a=num(previous), b=num(current);
    if(a===null || b===null) return "";
    const low=Math.min(a,b), high=Math.max(a,b), span=high-low || Math.abs(high)*.01 || 1;
    const y1=27-((a-low)/span)*19, y2=27-((b-low)/span)*19;
    return `<div class="ms-chart"><svg viewBox="0 0 220 34" role="img" aria-label="Latest versus previous available reading"><path d="M4 29H216" stroke="#26384d" stroke-width="1"/><path d="M8 ${y1} L212 ${y2}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><circle cx="8" cy="${y1}" r="3" fill="${color}"/><circle cx="212" cy="${y2}" r="3.5" fill="${color}"/></svg><div class="ms-chart-label"><span>Previous</span><span>Latest</span></div></div>`;
  }
  function card(label,value,date,change,opts={}) {
    const el=document.createElement("article"); el.className="ms-card";
    const changeHtml=change===null || change===undefined ? "" : `<div class="ms-change ${change>0?"up":change<0?"down":"flat"}">${change>0?"+":""}${fmt(change,2)}${opts.changeSuffix||"%" } ${opts.changeLabel||"vs prior"}</div>`;
    const valHtml=value===null ? "—" : fmt(value,opts.decimals||2)+(opts.suffix||"");
    el.innerHTML=`<div class="ms-label">${label}</div><div class="ms-value">${valHtml}</div><div class="ms-date">${date ? "As of "+date : (value===null?"Not provided by data service":"Date unavailable")}</div>${changeHtml}${opts.chart||""}${opts.extra||""}`;
    return el;
  }
  function gauge(v) {
    const pct=Math.max(0,Math.min(100,(v/50)*100));
    return `<div class="ms-gauge"><i style="left:calc(${pct}% - 1px)"></i></div><div class="ms-date">${v<15?"Low expected volatility":v<25?"Elevated volatility":"High expected volatility"} · descriptive range, not a trade signal</div>`;
  }
  async function refresh(){
    button.disabled=true; status.textContent="Updating published observations…";
    try{
      const response=await fetch(API_URL,{cache:"no-store"});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||"Data request failed");
      const d=result.data||{};
      const dollar=num(d.dollar?.value), dollarPct=percentChange(d.dollar), dollarPrev=(dollar!==null&&num(d.dollar?.change)!==null)?dollar-num(d.dollar.change):null;
      const cpiYoY=num(d.cpiYearOverYear?.value), cpiChange=num(d.cpiYearOverYear?.change);
      const ppiPct=percentChange(d.ppi);
      const yieldVal=num(d.us10y?.value), yieldCh=num(d.us10y?.change);
      const vix=num(d.vix?.value);
      grid.replaceChildren();
      grid.appendChild(card("US 10Y YIELD",yieldVal,dateOf(d.us10y),yieldCh===null?null:yieldCh*100,{suffix:"%",changeSuffix:" bps",changeLabel:"change"}));
      grid.appendChild(card("USD STRENGTH · BROAD INDEX",dollar,dateOf(d.dollar),dollarPct,{changeSuffix:"%",chart:sparkline(dollar,dollarPrev,"#69f0c1")}));
      grid.appendChild(card("CPI INFLATION · YOY",cpiYoY,dateOf(d.cpiYearOverYear),cpiChange,{suffix:"%",changeSuffix:" pp",changeLabel:"vs prior"}));
      grid.appendChild(card("PPI · MONTHLY CHANGE",ppiPct,dateOf(d.ppi),null,{suffix:"%",decimals:2,chart:""}));
      const vixChart=vix===null?"":gauge(vix);
      grid.appendChild(card("VIX · FEAR / VOLATILITY INDEX",vix,dateOf(d.vix),num(d.vix?.change),{changeSuffix:" pts",changeLabel:"change",extra:vixChart}));
      const cpiLine=cpiYoY===null?"CPI YoY unavailable":`CPI inflation: ${fmt(cpiYoY)}% YoY`;
      const ppiLine=ppiPct===null?"PPI change unavailable":`PPI monthly change: ${fmt(ppiPct)}%`;
      const dollarLine=dollarPct===null?"Dollar change unavailable":`Broad USD index: ${dollarPct>0?"up":dollarPct<0?"down":"flat"} ${fmt(Math.abs(dollarPct))}% vs prior reading`;
      read.textContent=[cpiLine,ppiLine,dollarLine,vix===null?"VIX unavailable — not supplied by current data service.":`VIX ${fmt(vix)}: ${vix<15?"low":vix<25?"elevated":"high"} expected volatility.`].join(" · ")+ " Compare release actuals with consensus and confirm with price action.";
      status.textContent="Updated "+(result.fetchedAt?new Date(result.fetchedAt).toLocaleString():"now")+" · Observation dates shown on each card";
    }catch(e){
      grid.replaceChildren();
      ["US 10Y YIELD","USD STRENGTH · BROAD INDEX","CPI INFLATION · YOY","PPI · MONTHLY CHANGE","VIX · FEAR / VOLATILITY INDEX"].forEach(label=>grid.appendChild(card(label,null,"",null)));
      read.textContent="Macro data could not load. Refresh again; do not infer a bias from missing data.";
      status.textContent="Data unavailable: "+(e.message||"request failed");
    }finally{button.disabled=false;}
  }
  button.addEventListener("click",refresh); refresh();
})();