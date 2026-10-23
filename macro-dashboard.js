(() => {
  "use strict";
  const API_URL = "https://marketsignal-data.joeybuilds043.workers.dev/";
  const style = document.createElement("style");
  style.textContent = `
    .ms-live{margin:12px 0 18px;padding:14px;border:1px solid #263a50;border-radius:17px;background:linear-gradient(145deg,#101d2b,#0a1220);color:#edf5ff;box-shadow:0 12px 34px #0002}
    .ms-live *{box-sizing:border-box}.ms-live-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .ms-live-kicker{margin:0 0 3px;color:#69f0c1!important;font-size:9px!important;letter-spacing:1.5px;font-weight:900}
    .ms-live h2{margin:0;font-size:19px;letter-spacing:-.4px}.ms-live .ms-subtitle{margin:4px 0 0;color:#94a9c2;font-size:10px}
    .ms-live button{padding:8px 11px;border:1px solid #397966;border-radius:9px;background:#12392f;color:#80f4ce;font-size:11px;font-weight:800;cursor:pointer}
    .ms-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
    .ms-card{padding:11px;border:1px solid #25384e;border-radius:12px;background:linear-gradient(145deg,#101c2b,#0b1421);min-width:0;overflow:hidden}
    .ms-label{color:#9badc3;font-size:10px;line-height:1.35;min-height:26px}
    .ms-value{font-size:23px;font-weight:850;letter-spacing:-.8px;margin:5px 0 2px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
    .ms-date{color:#7188a3;font-size:9px;line-height:1.35}
    .ms-change{font-size:10px;margin-top:5px;font-weight:750}.ms-change.up{color:#ff9d9d}.ms-change.down{color:#75e8be}.ms-change.flat{color:#c2d0e0}
    .ms-chart{grid-column:1/-1;width:100%;margin-top:10px;padding-top:9px;border-top:1px solid #24364b}.ms-chart svg{display:block;width:100%;height:58px;overflow:visible}.ms-chart-label{font-size:9px}.ms-card{display:block;padding:14px 16px}.ms-value{font-size:25px}
    .ms-chart-label{display:flex;justify-content:space-between;color:#7188a3;font-size:9px;margin-top:2px}
    .ms-read{margin-top:9px;padding:11px;border:1px solid #29465a;border-radius:12px;background:#0e1e2d}
    .ms-read-title{font-size:9px;font-weight:900;letter-spacing:1px;color:#69f0c1;margin-bottom:5px}
    .ms-read p{margin:0;color:#d3e0ef;font-size:11px;line-height:1.5}
    .ms-status{margin:8px 0 0;color:#8ca2ba;font-size:9px;line-height:1.4}
    .ms-footnote{margin:6px 0 0;color:#71849a;font-size:9px;line-height:1.4}
    .ms-gauge{height:5px;margin:9px 0 6px;border-radius:8px;background:linear-gradient(90deg,#69f0c1 0%,#d9db83 45%,#ff9d9d 100%);position:relative}
    .ms-gauge i{position:absolute;top:-3px;width:3px;height:11px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px #0b1421}
    .ms-tools{margin-top:10px;padding:12px;border:1px solid #263a50;border-radius:13px;background:#0b1421}
    .ms-tools h3{font-size:12px;margin:0 0 8px;color:#dce9f7}.ms-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .ms-controls label{display:block;font-size:9px;color:#8fa5bd;margin-bottom:4px}
    .ms-controls select,.ms-controls input{width:100%;min-width:0;padding:9px;border:1px solid #31465d;border-radius:8px;background:#101d2b;color:#edf5ff;font-size:11px}
    .ms-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.ms-actions button{flex:1}
    .ms-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
    .ms-chartbox{margin-top:9px;border:1px solid #263a50;border-radius:12px;background:#0a1320;padding:10px;min-height:120px}
    .ms-chartbox svg{display:block;width:100%;height:170px}.ms-chartbox .empty{font-size:10px;color:#8fa5bd;line-height:1.5}
    .ms-edit-note{font-size:9px;line-height:1.4;color:#8fa5bd;margin:8px 0 0}
    .ms-hidden{display:none!important}
    @media(min-width:560px){.ms-grid{grid-template-columns:1fr}}
    @media(max-width:360px){.ms-live{padding:10px}.ms-grid{gap:6px}.ms-card{padding:9px}.ms-value{font-size:20px}}
  `;
  document.head.appendChild(style);
  const section = document.createElement("section");
  section.className = "ms-live";
  section.setAttribute("aria-label","Macro market dashboard");
  section.innerHTML = `
    <div class="ms-live-head"><div><p class="ms-live-kicker">MARKETPILOT AI / MACRO TERMINAL</p><h2>Market pulse</h2><p class="ms-subtitle">US macro · latest available readings</p></div><button id="ms-refresh" type="button">↻ Refresh</button></div>
    <div class="ms-grid" id="ms-grid"><div class="ms-card">Loading data…</div></div>
    <div class="ms-read"><div class="ms-read-title">MACRO READ</div><p id="ms-read-text">Loading latest observations.</p></div>
    <div class="ms-tools">
      <h3>Historical chart</h3>
      <div class="ms-controls">
        <div><label for="ms-series">Indicator</label><select id="ms-series"><option value="us10y">US 10Y Yield</option><option value="dollar">Broad Dollar Index</option><option value="cpi">CPI Index</option><option value="ppi">PPI Index</option><option value="vix">VIX / Fear Index</option></select></div>
        <div><label for="ms-range">Period</label><select id="ms-range"><option value="30d">30 days</option><option value="90d">90 days</option><option value="1y" selected>1 year</option><option value="5y">5 years</option></select></div>
      </div>
      <div class="ms-chartbox" id="ms-history-chart"><div class="empty">Choose an indicator and period. Historical series will appear when the Worker history endpoint is deployed.</div></div>
      <div class="ms-status" id="ms-history-status">Historical data endpoint not confirmed yet.</div>
    </div>
    <div class="ms-tools">
      <h3>Edit dashboard values</h3>
      <div class="ms-edit-grid">
        <div><label for="ms-edit-yield">US 10Y yield (%)</label><input id="ms-edit-yield" type="number" step="0.001" placeholder="e.g. 4.25"></div>
        <div><label for="ms-edit-dollar">Broad dollar index</label><input id="ms-edit-dollar" type="number" step="0.001" placeholder="e.g. 121.6"></div>
        <div><label for="ms-edit-cpi">CPI YoY (%)</label><input id="ms-edit-cpi" type="number" step="0.01" placeholder="e.g. 3.1"></div>
        <div><label for="ms-edit-ppi">PPI index</label><input id="ms-edit-ppi" type="number" step="0.001" placeholder="e.g. 295.7"></div>
        <div><label for="ms-edit-vix">VIX (optional)</label><input id="ms-edit-vix" type="number" step="0.01" placeholder="No data by default"></div>
        <div><label for="ms-edit-date">As-of date</label><input id="ms-edit-date" type="date"></div>
      </div>
      <div class="ms-actions"><button id="ms-save-values" type="button">Save overrides</button><button id="ms-clear-values" type="button">Reset to source</button></div>
      <p class="ms-edit-note">Overrides are saved on this device only for now and marked as manual. They do not alter official FRED data. Cloud database sync is a separate backend step.</p>
    </div>
    <div class="ms-status" id="ms-status" role="status" aria-live="polite">Connecting…</div>
    <p class="ms-footnote">Data source: FRED. Release data can lag. Broad dollar index is not ICE DXY. VIX is a published volatility index, not a direct measure of all market fear.</p>`;
  const historyTools=section.querySelector(".ms-tools"); if(historyTools) historyTools.id="ms-history-tools";
  const hero = document.querySelector(".hero");
  if (hero) hero.insertAdjacentElement("afterend",section); else document.querySelector("main")?.prepend(section);
  const grid=section.querySelector("#ms-grid"), status=section.querySelector("#ms-status"), read=section.querySelector("#ms-read-text"), button=section.querySelector("#ms-refresh");
  const historyChart=section.querySelector("#ms-history-chart"), historyStatus=section.querySelector("#ms-history-status");
  const seriesSelect=section.querySelector("#ms-series"), rangeSelect=section.querySelector("#ms-range");
  const overrideKey="marketsignal-manual-overrides-v1";
  const editFields={us10y:section.querySelector("#ms-edit-yield"),dollar:section.querySelector("#ms-edit-dollar"),cpi:section.querySelector("#ms-edit-cpi"),ppi:section.querySelector("#ms-edit-ppi"),vix:section.querySelector("#ms-edit-vix")};
  const dateInput=section.querySelector("#ms-edit-date");
  const safeOverrides=()=>{try{return JSON.parse(localStorage.getItem(overrideKey)||"{}")}catch(_){return {}}};
  function loadOverrideInputs(){const o=safeOverrides();Object.keys(editFields).forEach(k=>editFields[k].value=o[k]?.value??"");dateInput.value=o.date||new Date().toISOString().slice(0,10)}
  function renderHistory(points,label,unit){
    const valid=(points||[]).filter(p=>Number.isFinite(Number(p.value))&&p.date);
    if(valid.length<2){historyChart.innerHTML='<div class="empty">Not enough historical observations returned for this period. The backend must return a dated series; the two-point sparkline is not a historical chart.</div>';return}
    const values=valid.map(p=>Number(p.value)), min=Math.min(...values), max=Math.max(...values), span=max-min||Math.abs(max)*.01||1;
    const W=600,H=170,L=42,R=8,T=10,B=25;
    const pts=values.map((v,i)=>({x:L+i*(W-L-R)/(values.length-1),y:T+(max-v)*(H-T-B)/span}));
    const path=pts.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ");
    const area=path+" L "+pts[pts.length-1].x+" "+(H-B)+" L "+pts[0].x+" "+(H-B)+" Z";
    const ylabels=[max,(min+max)/2,min].map(v=>v.toLocaleString("en-US",{maximumFractionDigits:3}));
    const first=valid[0].date,last=valid[valid.length-1].date;
    historyChart.innerHTML='<div class="ms-date">'+escapeHtml(label)+' · '+valid.length+' observations · source: FRED</div><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+escapeHtml(label)+' historical chart"><path d="M'+L+' '+T+'V'+(H-B)+'H'+(W-R)+'" stroke="#26384d" fill="none"/><path d="'+area+'" fill="#69f0c1" opacity=".08"/><path d="'+path+'" stroke="#69f0c1" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="2" y="'+(T+4)+'" fill="#8fa5bd" font-size="10">'+ylabels[0]+'</text><text x="2" y="'+((H+T-B)/2)+'" fill="#8fa5bd" font-size="10">'+ylabels[1]+'</text><text x="2" y="'+(H-B)+'" fill="#8fa5bd" font-size="10">'+ylabels[2]+'</text><text x="'+L+'" y="'+(H-7)+'" fill="#8fa5bd" font-size="10">'+escapeHtml(first)+'</text><text x="'+(W-R)+'" y="'+(H-7)+'" text-anchor="end" fill="#8fa5bd" font-size="10">'+escapeHtml(last)+'</text></svg>';
  }
  async function loadHistory(){
    const series=seriesSelect.value, range=rangeSelect.value;
    historyStatus.textContent="Loading "+series+" history…";
    try{
      const response=await fetch(API_URL+"history?series="+encodeURIComponent(series)+"&range="+encodeURIComponent(range),{cache:"no-store"});
      const data=await response.json(); if(!response.ok)throw new Error(data.error||"History endpoint unavailable");
      renderHistory(data.points||data.observations,data.label||series,data.unit||"");
      historyStatus.textContent="Fetched "+(data.fetchedAt?new Date(data.fetchedAt).toLocaleString():"now")+" · "+(data.points||data.observations||[]).length+" observations";
    }catch(e){historyChart.innerHTML='<div class="empty">Historical chart is waiting for the Worker API update. No sample or fabricated data is displayed.</div>';historyStatus.textContent="History unavailable: "+e.message}
  }
  section.querySelector("#ms-save-values").addEventListener("click",()=>{
    const values={};Object.entries(editFields).forEach(([k,input])=>{if(input.value.trim()!==""){const v=Number(input.value);if(Number.isFinite(v))values[k]={value:v,source:"manual"}}});
    const payload={...values,date:dateInput.value||new Date().toISOString().slice(0,10),savedAt:new Date().toISOString()};
    localStorage.setItem(overrideKey,JSON.stringify(payload));status.textContent="Manual overrides saved on this device. Official source data remains unchanged.";refresh();
  });
  section.querySelector("#ms-clear-values").addEventListener("click",()=>{localStorage.removeItem(overrideKey);loadOverrideInputs();status.textContent="Manual overrides cleared; showing source values.";refresh()});
  seriesSelect.addEventListener("change",loadHistory);rangeSelect.addEventListener("change",loadHistory);
  const escapeHtml = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll(String.fromCharCode(34),"&quot;").replaceAll(String.fromCharCode(39),"&#39;");
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
    el.innerHTML=`<div class="ms-label">${escapeHtml(label)}</div><div class="ms-value">${valHtml}</div><div class="ms-date">${date ? "As of "+escapeHtml(date) : (value===null?"Not provided by data service":"Date unavailable")}</div>${changeHtml}${opts.chart||""}${opts.extra||""}`;
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
      const overrides=safeOverrides();
      const chosenDate=escapeHtml(overrides.date||"");
      const manual=(key,source)=>overrides[key]?.value!==undefined?num(overrides[key].value):source;
      const showYield=manual("us10y",yieldVal), showDollar=manual("dollar",dollar), showCpi=manual("cpi",cpiYoY), showPpi=manual("ppi",num(d.ppi?.value)), showVix=manual("vix",vix);
      grid.replaceChildren();
      grid.appendChild(card("US 10Y YIELD",showYield,overrides.us10y?chosenDate:dateOf(d.us10y),overrides.us10y?null:(yieldCh===null?null:yieldCh*100),{suffix:"%",changeSuffix:" bps",changeLabel:"change",chart:sparkline(yieldVal,yieldVal!==null&&yieldCh!==null?yieldVal-yieldCh:null,"#78aaff"),extra:overrides.us10y?'<div class="ms-date">Manual override · '+chosenDate+'</div>':""}));
      grid.appendChild(card("USD STRENGTH · BROAD INDEX",showDollar,overrides.dollar?chosenDate:dateOf(d.dollar),overrides.dollar?null:dollarPct,{decimals:3,chart:sparkline(dollar,dollarPrev,"#69f0c1"),extra:'<div class="ms-date">'+(overrides.dollar?"Manual override · "+chosenDate:"Broad dollar index · not ICE DXY")+'</div>'}));
      grid.appendChild(card("CPI INFLATION · YOY",showCpi,overrides.cpi?chosenDate:dateOf(d.cpiYearOverYear),null,{suffix:"%",chart:sparkline(cpiYoY,cpiYoY!==null&&cpiChange!==null?cpiYoY-cpiChange:null,"#c0a1ff"),extra:overrides.cpi?'<div class="ms-date">Manual override · '+chosenDate+'</div>':""}));
      grid.appendChild(card("PPI INDEX · CHANGE VS PRIOR MONTH",showPpi,overrides.ppi?chosenDate:dateOf(d.ppi),overrides.ppi?null:ppiPct,{decimals:3,chart:sparkline(num(d.ppi?.value),num(d.ppi?.value)!==null&&num(d.ppi?.change)!==null?num(d.ppi.value)-num(d.ppi.change):null,"#c0a1ff"),extra:overrides.ppi?'<div class="ms-date">Manual override · '+chosenDate+'</div>':""}));
      const vixChart=showVix===null?"":gauge(showVix);
      grid.appendChild(card("VIX · FEAR / VOLATILITY INDEX",showVix,overrides.vix?chosenDate:dateOf(d.vix),overrides.vix?null:num(d.vix?.change),{changeSuffix:" pts",changeLabel:"change",extra:vixChart+(overrides.vix?'<div class="ms-date">Manual override · '+chosenDate+'</div>':"")}));
      const cpiLine=showCpi===null?"CPI YoY unavailable":`CPI inflation: ${fmt(showCpi)}% YoY`;
      const ppiLine=showPpi===null?"PPI index unavailable":`PPI index: ${fmt(showPpi,3)}`;
      const dollarLine=showDollar===null?"Dollar index unavailable":`Broad USD index: ${fmt(showDollar,3)}${overrides.dollar?" (manual override)":""}`;
      read.textContent=[cpiLine,ppiLine,dollarLine,vix===null?"VIX unavailable — not supplied by current data service.":`VIX ${fmt(vix)}: ${vix<15?"low":vix<25?"elevated":"high"} expected volatility.`].join(" · ")+ " Compare release actuals with consensus and confirm with price action.";
      status.textContent="Updated "+(result.fetchedAt?new Date(result.fetchedAt).toLocaleString():"now")+" · Observation dates shown on each card";
    }catch(e){
      grid.replaceChildren();
      ["US 10Y YIELD","USD STRENGTH · BROAD INDEX","CPI INFLATION · YOY","PPI · MONTHLY CHANGE","VIX · FEAR / VOLATILITY INDEX"].forEach(label=>grid.appendChild(card(label,null,"",null)));
      read.textContent="Macro data could not load. Refresh again; do not infer a bias from missing data.";
      status.textContent="Data unavailable: "+(e.message||"request failed");
    }finally{button.disabled=false;}
  }
  button.addEventListener("click",()=>{refresh();loadHistory()}); loadOverrideInputs(); refresh(); loadHistory();
})();