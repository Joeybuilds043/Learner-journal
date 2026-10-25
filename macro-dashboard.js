(() => {
  "use strict";
  const API_URL = "https://marketsignal-data.joeybuilds043.workers.dev/";
  const responseCache = new Map();
  const responsePending = new Map();
  async function getMacroJson(url) {
    const cached=responseCache.get(url);
    if(cached && Date.now()-cached.at<60000) return cached.data;
    if(responsePending.has(url)) return responsePending.get(url);
    const pending=(async()=>{
      const response=await fetch(url,{cache:"no-store"});
      const data=await response.json().catch(()=>({error:"Invalid data response"}));
      if(!response.ok){
        const message=data.detail||data.error||"Data request failed";
        if(response.status===429 || /too many requests|rate.?limit/i.test(message)) throw new Error("Source rate limit (HTTP 429). Wait 60 seconds before retrying; avoid repeated refreshes.");
        throw new Error(message);
      }
      responseCache.set(url,{at:Date.now(),data});
      return data;
    })();
    responsePending.set(url,pending);
    try{return await pending;}finally{responsePending.delete(url);}
  }
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
    .ms-change{font-size:10px;margin-top:5px;font-weight:750}.ms-change.up{color:#ff9d9d}.ms-change.down{color:#8bd1ff}.ms-change.flat{color:#c2d0e0}
    .ms-chart{grid-column:1/-1;width:100%;margin-top:10px;padding-top:9px;border-top:1px solid #24364b}.ms-chart svg{display:block;width:100%;height:58px;overflow:visible}.ms-chart-label{font-size:9px}.ms-card{display:block;padding:14px 16px}.ms-card-top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}.ms-card-top .ms-label{min-height:0;flex:1}.ms-card-top .ms-value{font-size:25px;margin:0 0 0 12px;text-align:right;flex-shrink:0}.ms-card .ms-date{margin-top:5px}.ms-card-extra{margin-top:5px}.ms-value{font-size:25px}
    .ms-chart-label{display:flex;justify-content:space-between;color:#7188a3;font-size:9px;margin-top:2px}
    .ms-cpi-panel{margin:12px 0 14px;padding:15px;border:1px solid #394361;border-radius:17px;background:radial-gradient(ellipse at 96% 0%,#282344 0%,transparent 39%),linear-gradient(145deg,#111c2d,#0a1220);box-shadow:0 14px 28px #0002}
    .ms-cpi-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.ms-cpi-kicker{margin:0 0 4px;color:#c3aaff;font-size:9px;font-weight:900;letter-spacing:1.4px}.ms-cpi-head h3{margin:0;font-size:17px;letter-spacing:-.3px}.ms-cpi-head p{margin:4px 0 0;color:#8ea4bd;font-size:10px}
    .ms-cpi-current{flex-shrink:0;min-width:90px;padding:9px 11px;border:1px solid #65558d;border-radius:12px;background:linear-gradient(145deg,#282642,#161e31);text-align:right}.ms-cpi-current strong{display:block;font-size:23px;letter-spacing:-.7px;color:#e3d7ff;font-variant-numeric:tabular-nums}.ms-cpi-current small{font-size:9px;color:#aa9bcf}
    .ms-cpi-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.ms-cpi-metric{padding:9px;border:1px solid #29364b;border-radius:10px;background:#0a1320;min-width:0}.ms-cpi-metric span{display:block;color:#8ca1bb;font-size:9px}.ms-cpi-metric strong{display:block;margin-top:4px;color:#e7eef9;font-size:14px;font-variant-numeric:tabular-nums}
    .ms-cpi-chart{margin-top:10px;padding:9px 10px 5px;border:1px solid #30445e;border-radius:14px;background:radial-gradient(ellipse at 90% 0%,#292447 0%,transparent 48%),linear-gradient(145deg,#0b1422,#0a1220);box-shadow:inset 0 1px 0 #ffffff08}.ms-cpi-chart svg{display:block;width:100%;height:205px;overflow:visible}.ms-cpi-chart .ms-gridline{stroke:#29374c;stroke-dasharray:3 5}.ms-cpi-chart .ms-cpi-bar{opacity:.42;transition:opacity .16s}.ms-cpi-chart .ms-cpi-bar:hover{opacity:.78}.ms-cpi-chart .ms-cpi-trend{filter:drop-shadow(0 2px 5px #c3a3ff48)}.ms-cpi-chart .ms-cpi-dot{stroke:#0b1422;stroke-width:2}.ms-cpi-legend{display:flex;flex-wrap:wrap;gap:13px;margin:4px 2px 0;color:#8ba0b9;font-size:9px}.ms-cpi-legend span{display:inline-flex;align-items:center;gap:6px}.ms-cpi-legend i{display:inline-block;width:14px;height:6px;border-radius:4px;background:linear-gradient(90deg,#65c9e7,#b18cff)}.ms-cpi-legend i.line{height:2px;background:linear-gradient(90deg,#b18cff,#f0d5ff)}.ms-cpi-status{margin:7px 0 0;color:#7f94ac;font-size:9px;line-height:1.5}
    @media(max-width:480px){.ms-cpi-panel{padding:12px}.ms-cpi-head h3{font-size:15px}.ms-cpi-current{min-width:78px;padding:8px}.ms-cpi-current strong{font-size:20px}.ms-cpi-metric{padding:8px 6px}.ms-cpi-metric strong{font-size:12px}.ms-cpi-chart svg{height:170px}}
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
    .ms-chartbox{border-color:#314660;background:radial-gradient(ellipse at 10% 0%,#172842 0%,#0a1320 66%);box-shadow:inset 0 1px 0 #ffffff08}.ms-chartbox svg{display:block;width:100%;height:250px;overflow:visible}.ms-chartbox svg text{font-variant-numeric:tabular-nums}.ms-chartbox svg .ms-gridline{stroke:#24364b;stroke-dasharray:3 5}.ms-chartbox svg .ms-bar{opacity:.22;transition:opacity .18s}.ms-chartbox svg .ms-bar:hover{opacity:.58}.ms-chartbox svg .ms-data-point{cursor:crosshair;transition:r .15s}.ms-chartbox svg .ms-data-point:hover{r:5}.ms-chartbox .empty{font-size:10px;color:#8fa5bd;line-height:1.5}
    .ms-edit-note{font-size:9px;line-height:1.4;color:#8fa5bd;margin:8px 0 0}
    .ms-ai-cta{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:14px;padding:15px;border:1px solid #53658c;border-radius:15px;background:linear-gradient(115deg,#1c2b47,#18243b 55%,#282442);box-shadow:0 12px 28px #0003}.ms-ai-cta strong{display:block;font-size:13px;color:#f0f4ff}.ms-ai-cta p{margin:5px 0 0;color:#b4c4dc;font-size:10px;line-height:1.5}.ms-ai-kicker{display:block;margin-bottom:5px;color:#c1b3ff;font-size:9px;letter-spacing:1.4px;font-weight:900}.ms-ai-cta button{flex-shrink:0;padding:11px 13px;border:1px solid #c0caff;border-radius:10px;background:linear-gradient(135deg,#cbd5ff,#a6b8ff);color:#101729;font-size:11px;font-weight:900;box-shadow:0 5px 16px #7f9cff20}.ms-hidden{display:none!important}.ms-ai-cta-dashboard{margin:12px 0 18px}@media(max-width:480px){.ms-ai-cta{align-items:flex-start;flex-direction:column}.ms-ai-cta button{width:100%}}
    @media(min-width:560px){.ms-grid{grid-template-columns:1fr}}
    @media(max-width:360px){.ms-live{padding:10px}.ms-grid{gap:6px}.ms-card{padding:9px}.ms-value{font-size:20px}}
  `;
  document.head.appendChild(style);
  const section = document.createElement("section");
  section.className = "ms-live";
  section.setAttribute("aria-label","Macro market dashboard");
  section.innerHTML = `
    <div class="ms-live-head"><div><p class="ms-live-kicker">MARKETSCOPE AI / MACRO TERMINAL</p><h2>Market pulse</h2><p class="ms-subtitle">US macro · latest available readings</p></div><button id="ms-refresh" type="button">↻ Refresh</button></div>
    <div class="ms-grid" id="ms-grid"><div class="ms-card">Loading data…</div></div>
    <div class="ms-read"><div class="ms-read-title">MACRO READ</div><p id="ms-read-text">Loading latest observations.</p></div>
    <section class="ms-cpi-panel" id="ms-cpi-panel" aria-label="US CPI inflation trend"><div class="ms-cpi-head"><div><p class="ms-cpi-kicker">INFLATION TRACKER / FRED CPI</p><h3>US CPI inflation</h3><p>Year-over-year rate · monthly observations</p></div><div class="ms-cpi-current"><strong id="ms-cpi-latest">—</strong><small>latest YoY</small></div></div><div class="ms-cpi-metrics"><div class="ms-cpi-metric"><span>Change vs prior month</span><strong id="ms-cpi-change">—</strong></div><div class="ms-cpi-metric"><span>12-month high</span><strong id="ms-cpi-high">—</strong></div><div class="ms-cpi-metric"><span>12-month low</span><strong id="ms-cpi-low">—</strong></div></div><div class="ms-cpi-chart" id="ms-cpi-bars"><div class="empty">Loading monthly CPI observations…</div></div><p class="ms-cpi-status" id="ms-cpi-status">Loading published CPI data…</p></section>
    <div class="ms-ai-cta ms-ai-cta-dashboard" id="ms-dashboard-ai-cta"><div><span class="ms-ai-kicker">AI MARKET RESEARCH</span><strong>Put the macro picture together</strong><p>Ask the Financial Assistant how inflation, Treasury yields and the dollar may connect to risk assets.</p></div><button id="ms-dashboard-open-ai" type="button">Open Financial Assistant <span aria-hidden="true">↗</span></button></div>
    <div class="ms-tools">
      <h3>Historical macro explorer</h3>
      <div class="ms-controls">
        <div><label for="ms-series">Indicator</label><select id="ms-series"><option value="us10y">US 10Y Yield</option><option value="dollar">Broad Dollar Index</option><option value="cpi_yoy">CPI Inflation (YoY)</option><option value="cpi">CPI Index</option><option value="ppi">PPI Index</option><option value="vix">VIX / Market Stress · colour bars</option></select></div>
        <div><label for="ms-range">Period</label><select id="ms-range"><option value="30d">30 days</option><option value="90d">90 days</option><option value="1y" selected>1 year</option><option value="5y">5 years</option></select></div>
      </div>
      <div class="ms-chartbox" id="ms-history-chart"><div class="empty">Select an indicator and period to explore published history. No sample data is shown.</div></div>
      <div class="ms-status" id="ms-history-status">Historical data endpoint not confirmed yet.</div>
      
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
    const W=720,H=220,L=56,R=18,T=22,B=35,plotW=W-L-R,plotH=H-T-B,baseY=H-B;
    const pts=values.map((v,i)=>({x:L+i*plotW/(values.length-1),y:T+(max-v)/span*plotH,v,date:valid[i].date}));
    let path="M "+pts[0].x.toFixed(2)+" "+pts[0].y.toFixed(2);
    for(let i=1;i<pts.length;i++){const prev=pts[i-1],cur=pts[i],mx=(prev.x+cur.x)/2;path+=" Q "+prev.x.toFixed(2)+" "+prev.y.toFixed(2)+" "+mx.toFixed(2)+" "+((prev.y+cur.y)/2).toFixed(2);if(i===pts.length-1)path+=" T "+cur.x.toFixed(2)+" "+cur.y.toFixed(2);}
    const area=path+" L "+pts[pts.length-1].x.toFixed(2)+" "+(H-B)+" L "+L+" "+(H-B)+" Z";
    const fmt=v=>Number(v).toLocaleString("en-US",{maximumFractionDigits:3});
    const yTicks=[max,(max+min)/2,min],grid=yTicks.map((v,i)=>{const y=T+i*plotH/2;return '<line class="ms-gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/><text x="'+(L-9)+'" y="'+(y+4)+'" text-anchor="end" fill="#91a6c1" font-size="10">'+fmt(v)+(unit==="percent"?"%":"")+'</text>'}).join("");
    const step=Math.max(1,Math.floor(pts.length/7));
    const dots=pts.filter((p,i)=>i===0||i===pts.length-1||i%step===0).map(p=>'<circle class="ms-data-point" cx="'+p.x.toFixed(2)+'" cy="'+p.y.toFixed(2)+'" r="3" fill="#dce5ff" stroke="#8eaaff" stroke-width="2"><title>'+escapeHtml(p.date)+' · '+fmt(p.v)+(unit==="percent"?"%":"")+'</title></circle>').join("");
    const first=valid[0].date,last=valid[valid.length-1].date;
    const lineColor=label.toLowerCase().includes("inflation")?"#b18cff":label.toLowerCase().includes("yield")?"#8da2ff":"#579dff";
    const barWidth=Math.max(1,Math.min(7,plotW/pts.length*.58));
    const bars=pts.map(p=>{const h=Math.max(1,baseY-p.y),y=baseY-h;return '<rect class="ms-bar" x="'+(p.x-barWidth/2).toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+barWidth.toFixed(2)+'" height="'+h.toFixed(2)+'" rx="1.2" fill="'+lineColor+'"><title>'+escapeHtml(p.date)+' · '+fmt(p.v)+(unit==="percent"?"%":"")+'</title></rect>';}).join("");
    if(label.toLowerCase().includes("vix")){
      const stressBars=pts.map(p=>{const h=Math.max(2,baseY-p.y),y=baseY-h,color=p.v>=30?"#ff5964":p.v>=20?"#f2c14e":"#46d7a1";return '<rect x="'+(p.x-barWidth/2).toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+barWidth.toFixed(2)+'" height="'+h.toFixed(2)+'" rx="2.5" fill="'+color+'" opacity=".9"><title>'+escapeHtml(p.date)+' · VIX '+fmt(p.v,2)+(p.v>=30?' · High stress':p.v>=20?' · Elevated':' · Lower volatility')+'</title></rect>';}).join("");
      historyChart.innerHTML='<div class="ms-date">VIX volatility · '+valid.length+' observations · stress bands are descriptive, not a Fear & Greed Index reading</div><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="VIX market stress bar chart" preserveAspectRatio="xMidYMid meet">'+grid+stressBars+'<text x="'+L+'" y="'+(H-10)+'" fill="#8196b2" font-size="10">'+escapeHtml(first)+'</text><text x="'+(W-R)+'" y="'+(H-10)+'" text-anchor="end" fill="#8196b2" font-size="10">'+escapeHtml(last)+'</text></svg><div class="ms-chart-label"><span style="color:#46d7a1">Below 20 · calmer</span><span style="color:#f2c14e">20–29 · elevated</span><span style="color:#ff5964">30+ · high stress</span></div>';
      return;
    }
    historyChart.innerHTML='<div class="ms-date">'+escapeHtml(label)+' · '+valid.length+' observations · source: published historical data</div><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+escapeHtml(label)+' historical chart" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="msAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+lineColor+'" stop-opacity=".34"/><stop offset="100%" stop-color="'+lineColor+'" stop-opacity=".015"/></linearGradient><linearGradient id="msStrokeGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="'+lineColor+'"/><stop offset="100%" stop-color="#c5d2ff"/></linearGradient></defs>'+grid+bars+'<path d="'+area+'" fill="url(#msAreaGradient)"/><path d="'+path+'" stroke="url(#msStrokeGradient)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'<text x="'+L+'" y="'+(H-10)+'" fill="#8196b2" font-size="10">'+escapeHtml(first)+'</text><text x="'+(W-R)+'" y="'+(H-10)+'" text-anchor="end" fill="#8196b2" font-size="10">'+escapeHtml(last)+'</text></svg><div class="ms-chart-label"><span>Low '+fmt(min)+(unit==="percent"?"%":"")+'</span><span>Latest '+fmt(values[values.length-1])+(unit==="percent"?"%":"")+'</span></div>';
  }
  async function loadHistory(){
    const selected=seriesSelect.value,range=rangeSelect.value;
    historyStatus.textContent="Loading "+(selected==="cpi_yoy"?"CPI inflation year over year":selected)+" history…";
    try{
      const series=selected==="cpi_yoy"?"cpi":selected;
      const data=await getMacroJson(API_URL+"history?series="+encodeURIComponent(series)+"&range="+encodeURIComponent(selected==="cpi_yoy"?"5y":range));
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
    }catch(e){historyChart.innerHTML='<div class="empty">Historical macro explorer unavailable. No sample data is shown.</div>';historyStatus.textContent="History unavailable: "+e.message}
  }
  seriesSelect.addEventListener("change",loadHistory);rangeSelect.addEventListener("change",loadHistory);
  const escapeHtml = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll(String.fromCharCode(34),"&quot;").replaceAll(String.fromCharCode(39),"&#39;");
  const num = v => v!==null && v!=="" && Number.isFinite(Number(v)) ? Number(v) : null;
  const fmt = (v,d=2) => num(v)===null ? "—" : Number(v).toLocaleString("en-US",{minimumFractionDigits:Math.min(2,d),maximumFractionDigits:d,useGrouping:false});
  const dateOf = x => x?.date || x?.latestDate || x?.observationDate || "";
  let latestCpiYoyValue=null,latestCpiYoyDate="";
  async function loadCpiTrend(){
    const host=section.querySelector("#ms-cpi-bars"),statusEl=section.querySelector("#ms-cpi-status");
    const latestEl=section.querySelector("#ms-cpi-latest"),changeEl=section.querySelector("#ms-cpi-change"),highEl=section.querySelector("#ms-cpi-high"),lowEl=section.querySelector("#ms-cpi-low");
    statusEl.textContent="Loading published monthly CPI observations…";
    try{
      const data=await getMacroJson(API_URL+"history?series=cpi&range=5y");
      const raw=(data.points||data.observations||[]).filter(p=>p&&p.date&&Number.isFinite(Number(p.value))).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      if(raw.length<14)throw new Error("Not enough dated CPI observations to calculate year-over-year inflation.");
      const byMonth=new Map(raw.map(p=>[String(p.date).slice(0,7),Number(p.value)]));
      const yoy=raw.map(p=>{const d=new Date(String(p.date)+"T00:00:00Z");d.setUTCMonth(d.getUTCMonth()-12);const prior=byMonth.get(d.toISOString().slice(0,7)),v=Number(p.value);return prior!==undefined&&prior!==0?{date:String(p.date),value:(v/prior-1)*100}:null;}).filter(Boolean);
      if(yoy.length<2)throw new Error("Not enough matching year-ago observations.");
      const recent=yoy.slice(-12),latest=recent[recent.length-1],previous=recent[recent.length-2],values=recent.map(p=>p.value),min=Math.min(...values),max=Math.max(...values),delta=latest.value-previous.value;latestCpiYoyValue=latest.value;latestCpiYoyDate=latest.date;const mainCpiCard=grid.children[2];if(mainCpiCard){const mainValue=mainCpiCard.querySelector(".ms-value"),mainDate=mainCpiCard.querySelector(".ms-date");if(mainValue)mainValue.textContent=fmt(latest.value,2)+"%";if(mainDate)mainDate.textContent="As of "+latest.date;}if(read.textContent.includes("CPI inflation unavailable"))read.textContent=read.textContent.replace("CPI inflation unavailable","CPI inflation: "+fmt(latest.value,2)+"% year over year");
      latestEl.textContent=fmt(latest.value,2)+"%";changeEl.textContent=(delta>0?"+":"")+fmt(delta,2)+" pp";changeEl.style.color=delta>0?"#eaa3b5":delta<0?"#80d3f0":"#dce7f7";highEl.textContent=fmt(max,2)+"%";lowEl.textContent=fmt(min,2)+"%";
      const W=720,H=210,L=44,R=17,T=17,B=34,plotW=W-L-R,plotH=H-T-B,axisMin=0,axisMax=Math.max(4,Math.ceil((max+.35)*2)/2),span=axisMax-axisMin||1;
      const yOf=v=>T+(axisMax-v)/span*plotH,baseY=H-B,slot=plotW/recent.length,bw=Math.min(26,slot*.52);
      const ticks=[axisMax,axisMax/2,0],grid=ticks.map(v=>'<line class="ms-gridline" x1="'+L+'" y1="'+yOf(v).toFixed(1)+'" x2="'+(W-R)+'" y2="'+yOf(v).toFixed(1)+'"/><text x="'+(L-8)+'" y="'+(yOf(v)+3).toFixed(1)+'" text-anchor="end" fill="#8ba0b9" font-size="9">'+fmt(v,1)+'%</text>').join("");
      const bars=recent.map((p,i)=>{const x=L+i*slot+(slot-bw)/2,y=yOf(p.value),h=Math.max(2,baseY-y),prev=i?recent[i-1].value:p.value,color=p.value>prev+.015?"#d783a7":p.value<prev-.015?"#65c9e7":"#b4a0ff";return '<g><rect class="ms-cpi-bar" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="4" fill="'+color+'"><title>'+escapeHtml(p.date)+' · '+fmt(p.value,2)+'% YoY</title></rect>'+(i%3===0||i===recent.length-1?'<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-9)+'" text-anchor="middle" fill="#8297b0" font-size="9">'+escapeHtml(p.date.slice(0,7))+'</text>':"")+'</g>';}).join("");
      const trendPoints=recent.map((p,i)=>({x:L+i*slot+slot/2,y:yOf(p.value),value:p.value,date:p.date}));
      let trendPath="M "+trendPoints[0].x.toFixed(1)+" "+trendPoints[0].y.toFixed(1);
      for(let i=1;i<trendPoints.length;i++){const prev=trendPoints[i-1],cur=trendPoints[i],mx=(prev.x+cur.x)/2,my=(prev.y+cur.y)/2;trendPath+=" Q "+prev.x.toFixed(1)+" "+prev.y.toFixed(1)+" "+mx.toFixed(1)+" "+my.toFixed(1);if(i===trendPoints.length-1)trendPath+=" T "+cur.x.toFixed(1)+" "+cur.y.toFixed(1);}
      const areaPath=trendPath+" L "+trendPoints[trendPoints.length-1].x.toFixed(1)+" "+baseY+" L "+trendPoints[0].x.toFixed(1)+" "+baseY+" Z";
      const dots=trendPoints.map((p,i)=>'<circle class="ms-cpi-dot" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(i===trendPoints.length-1?4.2:2.5)+'" fill="'+(i===trendPoints.length-1?'#f0d5ff':'#c7b7ff')+'"><title>'+escapeHtml(p.date)+' · '+fmt(p.value,2)+'% YoY</title></circle>').join("");
      const lastPoint=trendPoints[trendPoints.length-1],latestTagY=Math.max(T+11,lastPoint.y-10);
      host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="US CPI inflation: monthly columns and smoothed twelve-month trend" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="msCpiArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b18cff" stop-opacity=".22"/><stop offset="100%" stop-color="#b18cff" stop-opacity=".01"/></linearGradient><linearGradient id="msCpiLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#65c9e7"/><stop offset="55%" stop-color="#b18cff"/><stop offset="100%" stop-color="#f0d5ff"/></linearGradient></defs>'+grid+'<line x1="'+L+'" y1="'+baseY+'" x2="'+(W-R)+'" y2="'+baseY+'" stroke="#31445d"/>'+bars+'<path d="'+areaPath+'" fill="url(#msCpiArea)"/><path class="ms-cpi-trend" d="'+trendPath+'" stroke="url(#msCpiLine)" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'<text x="'+(lastPoint.x-5).toFixed(1)+'" y="'+latestTagY.toFixed(1)+'" text-anchor="end" fill="#f0d5ff" font-size="10" font-weight="800">'+fmt(latest.value,2)+'%</text></svg><div class="ms-cpi-legend"><span><i></i> Monthly inflation (YoY)</span><span><i class="line"></i> Trend path</span></div>';
      statusEl.textContent="Source: "+(data.source||"FRED")+" · "+recent.length+" recent monthly readings · last observation "+latest.date+" · fetched "+new Date(data.fetchedAt||Date.now()).toLocaleString()+". CPI is released monthly; it is not a live price feed.";
    }catch(e){
      latestEl.textContent="—";changeEl.textContent="—";highEl.textContent="—";lowEl.textContent="—";host.innerHTML='<div class="empty">CPI inflation history is unavailable. No illustrative or fabricated data is shown.</div>';statusEl.textContent=/429|rate limit/i.test(e.message||"")?"FRED source rate-limited this request. Wait 60 seconds before retrying.":"CPI history unavailable: "+(e.message||"request failed");
    }
  }
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
  async function loadMetricCharts(){
    const configs=[
      {series:"us10y",index:0,color:"#65c9e7",label:"US 10Y yield"},
      {series:"dollar",index:1,color:"#8faaff",label:"Broad USD index"},
      {series:"cpi",index:2,color:"#c3a3ff",label:"CPI inflation"},
      {series:"ppi",index:3,color:"#f0b27a",label:"PPI index"}
    ];
    await Promise.all(configs.map(async cfg=>{
      const cardEl=grid.children[cfg.index];if(!cardEl)return;
      let host=cardEl.querySelector(".ms-metric-history");
      if(!host){host=document.createElement("div");host.className="ms-metric-history";cardEl.appendChild(host);}
      host.innerHTML='<div class="ms-date">Loading published history…</div>';
      try{
        const data=await getMacroJson(API_URL+"history?series="+encodeURIComponent(cfg.series)+"&range="+(cfg.series==="cpi"?"5y":"1y"));
        let points=(data.points||data.observations||[]).filter(p=>p&&p.date&&Number.isFinite(Number(p.value))).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
        if(cfg.series==="cpi"){
          const byMonth=new Map(points.map(p=>[String(p.date).slice(0,7),Number(p.value)]));
          points=points.map(p=>{const d=new Date(String(p.date)+"T00:00:00Z");d.setUTCMonth(d.getUTCMonth()-12);const prior=byMonth.get(d.toISOString().slice(0,7));return prior!==undefined&&prior!==0?{date:p.date,value:(Number(p.value)/prior-1)*100}:null;}).filter(Boolean);
        }
        if(points.length<3)throw new Error("Not enough dated observations");
        points=points.slice(-24);const vals=points.map(p=>Number(p.value)),min=Math.min(...vals),max=Math.max(...vals),span=max-min||Math.max(Math.abs(max)*.01,.01),W=340,H=76,L=5,R=5,T=8,B=8,pw=W-L-R,ph=H-T-B,base=H-B;
        const pts=vals.map((v,i)=>({x:L+i*pw/(vals.length-1),y:T+(max-v)/span*ph,v,date:points[i].date}));
        let path="M "+pts[0].x.toFixed(1)+" "+pts[0].y.toFixed(1);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a.x+b.x)/2;path+=" Q "+a.x.toFixed(1)+" "+a.y.toFixed(1)+" "+mx.toFixed(1)+" "+((a.y+b.y)/2).toFixed(1);if(i===pts.length-1)path+=" T "+b.x.toFixed(1)+" "+b.y.toFixed(1);}
        const area=path+" L "+pts[pts.length-1].x.toFixed(1)+" "+base+" L "+pts[0].x.toFixed(1)+" "+base+" Z",gid="msMetric"+cfg.index;
        const bars=pts.map((p,i)=>{const bw=Math.max(2,pw/pts.length*.52),x=p.x-bw/2;return '<rect x="'+x.toFixed(1)+'" y="'+p.y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,base-p.y).toFixed(1)+'" rx="2" fill="'+cfg.color+'" opacity=".24"><title>'+escapeHtml(p.date)+" · "+fmt(p.v,2)+(cfg.series==="us10y"||cfg.series==="cpi"?"%":"")+'</title></rect>';}).join("");
        host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+cfg.label+' published history chart"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+cfg.color+'" stop-opacity=".28"/><stop offset="100%" stop-color="'+cfg.color+'" stop-opacity=".01"/></linearGradient></defs><path d="M5 25H335 M5 50H335" stroke="#26384d" stroke-dasharray="3 5"/>'+bars+'<path d="'+area+'" fill="url(#'+gid+')"/><path d="'+path+'" fill="none" stroke="'+cfg.color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+pts[pts.length-1].x.toFixed(1)+'" cy="'+pts[pts.length-1].y.toFixed(1)+'" r="3.2" fill="'+cfg.color+'"><title>'+escapeHtml(pts[pts.length-1].date)+' · '+fmt(pts[pts.length-1].v,2)+'</title></circle></svg><div class="ms-chart-label"><span>'+escapeHtml(points[0].date.slice(0,7))+'</span><span>Latest '+escapeHtml(points[points.length-1].date.slice(0,7))+'</span></div>';
      }catch(e){host.innerHTML='<div class="ms-date">History unavailable · '+escapeHtml(e.message||"source error")+'</div>';}
    }));
  }
  async function refresh(){
    button.disabled=true;status.textContent="Updating published observations…";
    try{
      const result=await getMacroJson(API_URL);
      const d=result.data||{};const dollar=num(d.dollar?.value),dollarPct=percentChange(d.dollar),dollarPrev=dollar!==null&&num(d.dollar?.change)!==null?dollar-num(d.dollar.change):null;
      const cpiYoY=num(d.cpiYearOverYear?.value)??latestCpiYoyValue,cpiChange=num(d.cpiYearOverYear?.change),ppiPct=percentChange(d.ppi);const yieldVal=num(d.us10y?.value),yieldCh=num(d.us10y?.change),vix=num(d.vix?.value);
      grid.replaceChildren();
      grid.appendChild(card("US 10Y TREASURY YIELD",yieldVal,dateOf(d.us10y),yieldCh===null?null:yieldCh*100,{suffix:"%",changeSuffix:" bps",changeLabel:"change",}));
      grid.appendChild(card("BROAD US DOLLAR INDEX",dollar,dateOf(d.dollar),dollarPct,{decimals:3,extra:'<div class="ms-date">Broad dollar index, not ICE DXY</div>'}));
      grid.appendChild(card("CPI INFLATION · YEAR OVER YEAR",cpiYoY,dateOf(d.cpiYearOverYear)||latestCpiYoyDate,null,{suffix:"%",}));
      grid.appendChild(card("PPI PRODUCER PRICE INDEX",num(d.ppi?.value),dateOf(d.ppi),ppiPct,{decimals:3,}));
      grid.appendChild(card("VIX · IMPLIED VOLATILITY",vix,dateOf(d.vix),num(d.vix?.change),{changeSuffix:" pts",changeLabel:"change",extra:vix===null?"<div class=\"ms-date\">No current observation supplied</div>":gauge(vix)}));
      const cpiLine=cpiYoY===null?"CPI inflation unavailable":"CPI inflation: "+fmt(cpiYoY)+"% year over year";const ppiLine=num(d.ppi?.value)===null?"PPI unavailable":"PPI index: "+fmt(d.ppi.value,3);const dollarLine=dollar===null?"Dollar index unavailable":"Broad USD index: "+fmt(dollar,3);
      read.textContent=[cpiLine,ppiLine,dollarLine,vix===null?"VIX unavailable":"VIX "+fmt(vix)+": "+(vix<15?"low":vix<25?"elevated":"high")+" expected volatility"].join(" · ")+". Compare release actuals with consensus and price action.";
      status.textContent="Updated "+(result.fetchedAt?new Date(result.fetchedAt).toLocaleString():"now")+" · Observation dates shown on each card.";
    }catch(e){grid.replaceChildren();["US 10Y TREASURY YIELD","BROAD US DOLLAR INDEX","CPI INFLATION · YEAR OVER YEAR","PPI PRODUCER PRICE INDEX","VIX · IMPLIED VOLATILITY"].forEach(label=>grid.appendChild(card(label,null,"",null)));read.textContent="Macro data could not load. Refresh before drawing a conclusion.";status.textContent=/429|rate limit/i.test(e.message||"")?"FRED/source rate limit. Wait 60 seconds before retrying; repeated refreshes may extend the limit.":"Data unavailable: "+(e.message||"request failed");}
    finally{button.disabled=false;loadMetricCharts();}
  }
  button.addEventListener("click",()=>{refresh();loadHistory();loadCpiTrend()}); refresh(); loadHistory(); loadCpiTrend();
})();