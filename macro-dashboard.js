(() => {
  "use strict";
  const API_URL = "https://marketsignal-data.joeybuilds043.workers.dev/";
  const style = document.createElement("style");
  style.textContent = `
    .ms-live{margin:12px 0 18px;padding:14px;border:1px solid #263a50;border-radius:17px;background:linear-gradient(145deg,#101d2b,#0a1220);color:#edf5ff;box-shadow:0 12px 34px #0002}
    .ms-live *{box-sizing:border-box}.ms-live-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .ms-live-kicker{margin:0 0 3px;color:#9bb5ff!important;font-size:9px!important;letter-spacing:1.5px;font-weight:900}
    .ms-live h2{margin:0;font-size:19px;letter-spacing:-.4px}.ms-live .ms-subtitle{margin:4px 0 0;color:#94a9c2;font-size:10px}
    .ms-live button{padding:8px 11px;border:1px solid #4d6192;border-radius:9px;background:#182745;color:#c4d2ff;font-size:11px;font-weight:800;cursor:pointer}
    .ms-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
    .ms-card{padding:11px;border:1px solid #25384e;border-radius:12px;background:linear-gradient(145deg,#101c2b,#0b1421);min-width:0;overflow:hidden}
    .ms-label{color:#9badc3;font-size:10px;line-height:1.35;min-height:26px}
    .ms-value{font-size:23px;font-weight:850;letter-spacing:-.8px;margin:5px 0 2px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
    .ms-date{color:#7188a3;font-size:9px;line-height:1.35}
    .ms-change{font-size:10px;margin-top:5px;font-weight:750}.ms-change.up{color:#ff9d9d}.ms-change.down{color:#75e8be}.ms-change.flat{color:#c2d0e0}
    .ms-chart{grid-column:1/-1;width:100%;margin-top:10px;padding-top:9px;border-top:1px solid #24364b}.ms-chart svg{display:block;width:100%;height:58px;overflow:visible}.ms-chart-label{font-size:9px}.ms-card{display:block;padding:14px 16px}.ms-card-top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}.ms-card-top .ms-label{min-height:0;flex:1}.ms-card-top .ms-value{font-size:25px;margin:0 0 0 12px;text-align:right;flex-shrink:0}.ms-card .ms-date{margin-top:5px}.ms-card-extra{margin-top:5px}.ms-value{font-size:25px}
    .ms-chart-label{display:flex;justify-content:space-between;color:#7188a3;font-size:9px;margin-top:2px}
    .ms-read{margin-top:9px;padding:11px;border:1px solid #29465a;border-radius:12px;background:#0e1e2d}
    .ms-read-title{font-size:9px;font-weight:900;letter-spacing:1px;color:#9bb5ff;margin-bottom:5px}
    .ms-read p{margin:0;color:#d3e0ef;font-size:11px;line-height:1.5}
    .ms-status{margin:8px 0 0;color:#8ca2ba;font-size:9px;line-height:1.4}
    .ms-footnote{margin:6px 0 0;color:#71849a;font-size:9px;line-height:1.4}
    .ms-gauge{height:5px;margin:9px 0 6px;border-radius:8px;background:linear-gradient(90deg,#9bb5ff 0%,#c0a1ff 45%,#ff9d9d 100%);position:relative}
    .ms-gauge i{position:absolute;top:-3px;width:3px;height:11px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px #0b1421}
    .ms-tools{margin-top:10px;padding:12px;border:1px solid #263a50;border-radius:13px;background:#0b1421}
    .ms-tools h3{font-size:12px;margin:0 0 8px;color:#dce9f7}.ms-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .ms-controls label{display:block;font-size:9px;color:#8fa5bd;margin-bottom:4px}
    .ms-controls select,.ms-controls input{width:100%;min-width:0;padding:9px;border:1px solid #31465d;border-radius:8px;background:#101d2b;color:#edf5ff;font-size:11px}
    .ms-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.ms-actions button{flex:1}
    .ms-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
    .ms-chartbox{margin-top:9px;border:1px solid #263a50;border-radius:12px;background:#0a1320;padding:10px;min-height:120px}
    .ms-chartbox{border-color:#314660;background:radial-gradient(ellipse at 10% 0%,#172842 0%,#0a1320 66%);box-shadow:inset 0 1px 0 #ffffff08}.ms-chartbox svg{display:block;width:100%;height:250px;overflow:visible}.ms-chartbox svg text{font-variant-numeric:tabular-nums}.ms-chartbox svg .ms-gridline{stroke:#24364b;stroke-dasharray:3 5}.ms-chartbox svg .ms-data-point{cursor:crosshair;transition:r .15s}.ms-chartbox svg .ms-data-point:hover{r:5}.ms-chartbox .empty{font-size:10px;color:#8fa5bd;line-height:1.5}
    .ms-edit-note{font-size:9px;line-height:1.4;color:#8fa5bd;margin:8px 0 0}
    .ms-ai-cta{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:14px;padding:15px;border:1px solid #53658c;border-radius:15px;background:linear-gradient(115deg,#1c2b47,#18243b 55%,#282442);box-shadow:0 12px 28px #0003}.ms-ai-cta strong{display:block;font-size:13px;color:#f0f4ff}.ms-ai-cta p{margin:5px 0 0;color:#b4c4dc;font-size:10px;line-height:1.5}.ms-ai-kicker{display:block;margin-bottom:5px;color:#c1b3ff;font-size:9px;letter-spacing:1.4px;font-weight:900}.ms-ai-cta button{flex-shrink:0;padding:11px 13px;border:1px solid #c0caff;border-radius:10px;background:linear-gradient(135deg,#cbd5ff,#a6b8ff);color:#101729;font-size:11px;font-weight:900;box-shadow:0 5px 16px #7f9cff20}.ms-hidden{display:none!important}@media(max-width:480px){.ms-ai-cta{align-items:flex-start;flex-direction:column}.ms-ai-cta button{width:100%}}
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
        <div><label for="ms-series">Indicator</label><select id="ms-series"><option value="us10y">US 10Y Yield</option><option value="dollar">Broad Dollar Index</option><option value="cpi_yoy">CPI Inflation (YoY)</option><option value="cpi">CPI Index</option><option value="ppi">PPI Index</option><option value="vix">VIX / Fear Index</option></select></div>
        <div><label for="ms-range">Period</label><select id="ms-range"><option value="30d">30 days</option><option value="90d">90 days</option><option value="1y" selected>1 year</option><option value="5y">5 years</option></select></div>
      </div>
      <div class="ms-chartbox" id="ms-history-chart"><div class="empty">Choose an indicator and period. Historical series will appear when the Worker history endpoint is deployed.</div></div>
      <div class="ms-status" id="ms-history-status">Historical data endpoint not confirmed yet.</div>
      <div class="ms-ai-cta"><div><span class="ms-ai-kicker">NEXT STEP</span><strong>Turn the data into a market view</strong><p>Ask the financial research assistant to connect macro trends, price action and risk scenarios.</p></div><button id="ms-open-ai" type="button">Open Financial Analyst <span aria-hidden="true">↗</span></button></div>
    </div>
    <div class="ms-status" id="ms-status" role="status" aria-live="polite">Connecting…</div>
    <p class="ms-footnote">Data source: FRED. Release data can lag. Broad dollar index is not ICE DXY. VIX is a published volatility index, not a direct measure of all market fear.</p>`;
  const historyTools=section.querySelector(".ms-tools"); if(historyTools) historyTools.id="ms-history-tools";
  const hero = document.querySelector(".hero");
  if (hero) hero.insertAdjacentElement("afterend",section); else document.querySelector("main")?.prepend(section);
  const grid=section.querySelector("#ms-grid"), status=section.querySelector("#ms-status"), read=section.querySelector("#ms-read-text"), button=section.querySelector("#ms-refresh");
  const historyChart=section.querySelector("#ms-history-chart"), historyStatus=section.querySelector("#ms-history-status");
  const seriesSelect=section.querySelector("#ms-series"), rangeSelect=section.querySelector("#ms-range");
  function renderHistory(points,label,unit){
    const valid=(points||[]).filter(p=>Number.isFinite(Number(p.value))&&p.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(valid.length<2){historyChart.innerHTML='<div class="empty">Not enough dated observations for this range. Choose a longer period; no sample data is shown.</div>';return}
    const values=valid.map(p=>Number(p.value)),min=Math.min(...values),max=Math.max(...values),span=max-min||Math.max(Math.abs(max)*.01,.01);
    const W=720,H=220,L=56,R=18,T=22,B=35,plotW=W-L-R,plotH=H-T-B;
    const pts=values.map((v,i)=>({x:L+i*plotW/(values.length-1),y:T+(max-v)/span*plotH,v,date:valid[i].date}));
    let path="M "+pts[0].x.toFixed(2)+" "+pts[0].y.toFixed(2);
    for(let i=1;i<pts.length;i++){const prev=pts[i-1],cur=pts[i],mx=(prev.x+cur.x)/2;path+=" Q "+prev.x.toFixed(2)+" "+prev.y.toFixed(2)+" "+mx.toFixed(2)+" "+((prev.y+cur.y)/2).toFixed(2);if(i===pts.length-1)path+=" T "+cur.x.toFixed(2)+" "+cur.y.toFixed(2);}
    const area=path+" L "+pts[pts.length-1].x.toFixed(2)+" "+(H-B)+" L "+L+" "+(H-B)+" Z";
    const fmt=v=>Number(v).toLocaleString("en-US",{maximumFractionDigits:3});
    const yTicks=[max,(max+min)/2,min],grid=yTicks.map((v,i)=>{const y=T+i*plotH/2;return '<line class="ms-gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/><text x="'+(L-9)+'" y="'+(y+4)+'" text-anchor="end" fill="#91a6c1" font-size="10">'+fmt(v)+(unit==="percent"?"%":"")+'</text>'}).join("");
    const step=Math.max(1,Math.floor(pts.length/7));
    const dots=pts.filter((p,i)=>i===0||i===pts.length-1||i%step===0).map(p=>'<circle class="ms-data-point" cx="'+p.x.toFixed(2)+'" cy="'+p.y.toFixed(2)+'" r="3" fill="#dce5ff" stroke="#8eaaff" stroke-width="2"><title>'+escapeHtml(p.date)+' · '+fmt(p.v)+(unit==="percent"?"%":"")+'</title></circle>').join("");
    const first=valid[0].date,last=valid[valid.length-1].date;
    const lineColor=label.toLowerCase().includes("inflation")?"#b18cff":label.toLowerCase().includes("yield")?"#26a69a":"#579dff";
    historyChart.innerHTML='<div class="ms-date">'+escapeHtml(label)+' · '+valid.length+' observations · source: published historical data</div><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+escapeHtml(label)+' historical chart" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="msAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+lineColor+'" stop-opacity=".34"/><stop offset="100%" stop-color="'+lineColor+'" stop-opacity=".015"/></linearGradient><linearGradient id="msStrokeGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="'+lineColor+'"/><stop offset="100%" stop-color="#c5d2ff"/></linearGradient></defs>'+grid+'<path d="'+area+'" fill="url(#msAreaGradient)"/><path d="'+path+'" stroke="url(#msStrokeGradient)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'<text x="'+L+'" y="'+(H-10)+'" fill="#8196b2" font-size="10">'+escapeHtml(first)+'</text><text x="'+(W-R)+'" y="'+(H-10)+'" text-anchor="end" fill="#8196b2" font-size="10">'+escapeHtml(last)+'</text></svg><div class="ms-chart-label"><span>Low '+fmt(min)+(unit==="percent"?"%":"")+'</span><span>Latest '+fmt(values[values.length-1])+(unit==="percent"?"%":"")+'</span></div>';
  }
  async function loadHistory(){
    const selected=seriesSelect.value,range=rangeSelect.value;
    const macroSeries={us10y:"DGS10",dollar:"DTWEXBGS",cpi:"CPIAUCSL",ppi:"PPIACO",vix:"VIXCLS"};
    historyStatus.textContent="Loading "+(selected==="cpi_yoy"?"CPI inflation year over year":selected)+" history…";
    try{
      const macro=selected==="cpi_yoy"||Object.prototype.hasOwnProperty.call(macroSeries,selected);
      const series=selected==="cpi_yoy"?"CPIAUCSL":macro?macroSeries[selected]:selected;
      const endpoint=macro?"https://marketpilot-ai.joeybuilds043.workers.dev/api/macro-history?series="+encodeURIComponent(series)+"&range=5y":"https://marketpilot-ai.joeybuilds043.workers.dev/api/history?symbol="+encodeURIComponent(series)+"&range="+encodeURIComponent(range==="1y"?"1y":"5y");
      const response=await fetch(endpoint,{cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.detail||data.error||"History endpoint unavailable");
      let points=(data.points||data.observations||[]).filter(p=>p&&p.date&&Number.isFinite(Number(p.value)));
      let label=data.name||data.label||series,unit=data.unit||"";
      if(selected==="cpi_yoy"){
        const byMonth=new Map(points.map(p=>[String(p.date).slice(0,7),Number(p.value)]));
        points=points.map(p=>{const d=new Date(String(p.date)+"T00:00:00Z");d.setUTCMonth(d.getUTCMonth()-12);const prior=byMonth.get(d.toISOString().slice(0,7)),current=Number(p.value);return prior&&prior!==0?{date:p.date,value:(current/prior-1)*100}:null;}).filter(Boolean);
        label="CPI Inflation (YoY)";unit="percent";
      }
      const days={"30d":30,"90d":90,"1y":365,"5y":1825}[range]||365;
      if(points.length){const cutoff=new Date(String(points[points.length-1].date)+"T00:00:00Z");cutoff.setUTCDate(cutoff.getUTCDate()-days);points=points.filter(p=>p.date>=cutoff.toISOString().slice(0,10));}
      renderHistory(points,label,unit);historyStatus.textContent="Source: "+(data.source||"published data")+" · "+points.length+" observations · fetched "+new Date(data.fetchedAt||Date.now()).toLocaleString();
    }catch(e){historyChart.innerHTML='<div class="empty">Historical chart unavailable. No sample data is shown.</div>';historyStatus.textContent="History unavailable: "+e.message}
  }
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
    el.innerHTML=`<div class="ms-card-top"><div class="ms-label">${escapeHtml(label)}</div><div class="ms-value">${valHtml}</div></div><div class="ms-date">${date ? "As of "+escapeHtml(date) : (value===null?"Not provided by data service":"Date unavailable")}</div>${changeHtml}${opts.chart||""}<div class="ms-card-extra">${opts.extra||""}</div>`;
    return el;
  }
  function gauge(v) {
    const pct=Math.max(0,Math.min(100,(v/50)*100));
    return `<div class="ms-gauge"><i style="left:calc(${pct}% - 1px)"></i></div><div class="ms-date">${v<15?"Low expected volatility":v<25?"Elevated volatility":"High expected volatility"} · descriptive range, not a trade signal</div>`;
  }
  async function refresh(){
    button.disabled=true;status.textContent="Updating published observations…";
    try{
      const response=await fetch(API_URL,{cache:"no-store"}),result=await response.json();if(!response.ok)throw new Error(result.error||"Data request failed");
      const d=result.data||{};const dollar=num(d.dollar?.value),dollarPct=percentChange(d.dollar),dollarPrev=dollar!==null&&num(d.dollar?.change)!==null?dollar-num(d.dollar.change):null;
      const cpiYoY=num(d.cpiYearOverYear?.value),cpiChange=num(d.cpiYearOverYear?.change),ppiPct=percentChange(d.ppi);const yieldVal=num(d.us10y?.value),yieldCh=num(d.us10y?.change),vix=num(d.vix?.value);
      grid.replaceChildren();
      grid.appendChild(card("US 10Y TREASURY YIELD",yieldVal,dateOf(d.us10y),yieldCh===null?null:yieldCh*100,{suffix:"%",changeSuffix:" bps",changeLabel:"change",chart:sparkline(yieldVal,yieldVal!==null&&yieldCh!==null?yieldVal-yieldCh:null,"#26a69a")}));
      grid.appendChild(card("BROAD US DOLLAR INDEX",dollar,dateOf(d.dollar),dollarPct,{decimals:3,chart:sparkline(dollar,dollarPrev,"#579dff"),extra:'<div class="ms-date">Broad dollar index, not ICE DXY</div>'}));
      grid.appendChild(card("CPI INFLATION · YEAR OVER YEAR",cpiYoY,dateOf(d.cpiYearOverYear),null,{suffix:"%",chart:sparkline(cpiYoY,cpiYoY!==null&&cpiChange!==null?cpiYoY-cpiChange:null,"#b18cff")}));
      grid.appendChild(card("PPI PRODUCER PRICE INDEX",num(d.ppi?.value),dateOf(d.ppi),ppiPct,{decimals:3,chart:sparkline(num(d.ppi?.value),num(d.ppi?.value)!==null&&num(d.ppi?.change)!==null?num(d.ppi.value)-num(d.ppi.change):null,"#f5a45d")}));
      grid.appendChild(card("VIX · IMPLIED VOLATILITY",vix,dateOf(d.vix),num(d.vix?.change),{changeSuffix:" pts",changeLabel:"change",extra:vix===null?"<div class=\"ms-date\">No current observation supplied</div>":gauge(vix)}));
      const cpiLine=cpiYoY===null?"CPI inflation unavailable":"CPI inflation: "+fmt(cpiYoY)+"% year over year";const ppiLine=num(d.ppi?.value)===null?"PPI unavailable":"PPI index: "+fmt(d.ppi.value,3);const dollarLine=dollar===null?"Dollar index unavailable":"Broad USD index: "+fmt(dollar,3);
      read.textContent=[cpiLine,ppiLine,dollarLine,vix===null?"VIX unavailable":"VIX "+fmt(vix)+": "+(vix<15?"low":vix<25?"elevated":"high")+" expected volatility"].join(" · ")+". Compare release actuals with consensus and price action.";
      status.textContent="Updated "+(result.fetchedAt?new Date(result.fetchedAt).toLocaleString():"now")+" · Observation dates shown on each card.";
    }catch(e){grid.replaceChildren();["US 10Y TREASURY YIELD","BROAD US DOLLAR INDEX","CPI INFLATION · YEAR OVER YEAR","PPI PRODUCER PRICE INDEX","VIX · IMPLIED VOLATILITY"].forEach(label=>grid.appendChild(card(label,null,"",null)));read.textContent="Macro data could not load. Refresh before drawing a conclusion.";status.textContent="Data unavailable: "+(e.message||"request failed");}
    finally{button.disabled=false;}
  }
  button.addEventListener("click",()=>{refresh();loadHistory()}); refresh(); loadHistory();
})();