import os
import json
import html
from io import StringIO
from datetime import datetime, timedelta, timezone

import pandas as pd
import plotly.graph_objects as go
import requests
import streamlit as st
import xml.etree.ElementTree as ET
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed

APP_NAME = "MarketPilot AI"
ASSISTANT_NAME = "Atlas"
GEMINI_DEFAULT_MODEL = "gemini-3.8-flash"
GROK_DEFAULT_MODEL = "grok-4.7"

st.set_page_config(
    page_title="MarketPilot AI | Market Intelligence",
    page_icon="assets/candledesk-mark.svg",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
    :root { color-scheme: dark; }
    html, body, [data-testid="stAppViewContainer"], .stApp {
        background: #0b0f16;
        color: #e8edf5;
    }
    [data-testid="stHeader"], #MainMenu, footer { visibility: hidden; height: 0; }
    [data-testid="stAppViewContainer"] > .main .block-container {
        max-width: 1480px; padding: 1.05rem 1.45rem 3rem;
    }
    [data-testid="stSidebar"] { display: none; }
    h1, h2, h3 { color: #edf3fc !important; letter-spacing: -0.035em; }
    h1 { font-size: clamp(1.55rem, 3vw, 2.15rem) !important; font-weight: 760 !important; }
    h2 { font-size: 1.35rem !important; font-weight: 700 !important; }
    h3 { font-size: 1.03rem !important; font-weight: 680 !important; }
    p, li, label { color: #b8c3d3; }
    small, .muted { color: #7f8da2; }
    div[data-testid="stMarkdownContainer"] p { line-height: 1.55; }
    div[role="radiogroup"] {
        gap: .35rem; flex-wrap: wrap; padding: .28rem 0 .62rem;
        border-bottom: 1px solid #202a38; margin-bottom: 1.15rem;
    }
    div[role="radiogroup"] label {
        border: 1px solid #222e3e; border-radius: 10px;
        padding: .43rem .9rem; background: #101722; color: #aebbd0;
        transition: all .15s ease;
    }
    div[role="radiogroup"] label:has(input:checked) {
        background: #1b2b3e; color: #f0f6ff; border-color: #4b83d1;
        box-shadow: inset 0 -2px 0 #63a3ff;
    }
    div[role="radiogroup"] label p { font-size: .88rem; font-weight: 650; }
    [data-testid="stMetric"] {
        background: #101722; border: 1px solid #202b3a; border-radius: 14px;
        padding: .9rem 1rem; min-height: 105px;
    }
    [data-testid="stMetricLabel"] p { color: #98a8bd !important; font-size: .78rem !important; }
    [data-testid="stMetricValue"] { color: #f1f5fb !important; font-size: 1.5rem !important; }
    [data-testid="stMetricDelta"] { font-size: .77rem !important; }
    [data-testid="stVerticalBlockBorderWrapper"] {
        border-color: #202b3a !important; border-radius: 15px !important;
        background: #0e141e;
    }
    div[data-testid="stPlotlyChart"] {
        background: #0e141e; border: 1px solid #202b3a;
        border-radius: 14px; padding: .35rem .35rem .05rem;
    }
    div.stButton > button, div.stDownloadButton > button {
        border-radius: 10px; border: 1px solid #354861; min-height: 2.55rem;
        background: #172437; color: #edf4ff; font-weight: 650;
        transition: all .15s ease;
    }
    div.stButton > button:hover, div.stDownloadButton > button:hover {
        border-color: #69a6ff; background: #20334b; color: #ffffff;
    }
    div.stButton > button[kind="primary"] {
        background: #2c6ac4; border-color: #3e7bd2; color: white;
    }
    div[data-testid="stChatMessage"] {
        background: #101722; border: 1px solid #202b3a; border-radius: 14px;
        padding: .4rem .6rem; margin: .55rem 0;
    }
    [data-testid="stChatInput"] textarea {
        background: #111a27; border: 1px solid #304158; border-radius: 12px;
        color: #edf4ff;
    }
    input, textarea, [data-baseweb="select"] > div {
        background: #101722 !important; color: #edf4ff !important;
        border-color: #2a3749 !important; border-radius: 9px !important;
    }
    div[data-testid="stAlert"] { border-radius: 12px; }
    a { color: #8dbbff !important; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .inspiration-banner { display:flex; align-items:flex-start; gap:.7rem; margin:.15rem 0 1rem; padding:.75rem .9rem; border:1px solid #2a3d57; border-radius:13px; background:linear-gradient(105deg,#111d2c,#171d32 72%,#211c31); }
    .inspiration-badge { flex:0 0 30px; width:30px; height:30px; display:grid; place-items:center; border-radius:9px; background:linear-gradient(135deg,#b9d9ff,#c9b7ff); color:#101a2a; font-weight:900; }
    .inspiration-copy { color:#d5e1f2; font-size:.79rem; line-height:1.5; }
    .inspiration-copy small { display:block; margin-top:.2rem; color:#8297b3; font-size:.69rem; }
    .status-dot { background:#68c8f4; }
    .brand-row { display: flex; align-items: center; gap: 11px; margin: .1rem 0 .65rem; }
    .brand-mark { width: 39px; height: 39px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .brand-name { font-size: 1.2rem; line-height:1.05; letter-spacing:-.035em; font-weight:800; color:#f1f6ff; }
    .brand-sub { margin-top: 4px; font-size:.72rem; letter-spacing:.10em; color:#7f8da2; text-transform:uppercase; }
    .eyebrow { color:#78aefc; text-transform:uppercase; letter-spacing:.12em; font-size:.70rem; font-weight:800; }
    .section-note { color:#7f8da2; font-size:.82rem; margin-top:-.45rem; margin-bottom:.85rem; }
    .chart-heading { font-size:1rem; font-weight:760; color:#eef4fc; margin:.15rem 0 .1rem; }
    .chart-caption { font-size:.75rem; color:#8291a7; margin-bottom:.45rem; }
    .status-pill { display:inline-flex; align-items:center; gap:6px; border:1px solid #253548;
        background:#111a27; color:#b6c9e3; border-radius:100px; padding:5px 10px; font-size:.72rem; }
    .status-dot { width:7px; height:7px; display:inline-block; border-radius:100%; background:#68c8f4; }
    .insight-box { padding: .9rem 1rem; border: 1px solid #24354b; border-radius: 13px; background: linear-gradient(120deg, #101b2a, #101722); }
    .insight-title { color:#eef5ff; font-size:.92rem; font-weight:750; margin-bottom:.25rem; }
    .insight-copy { color:#a9b8cc; font-size:.85rem; line-height:1.55; }
    .avatar-wrap { display:flex; justify-content:center; padding:.1rem 0 .6rem; }
    .avatar-wrap img { border-radius: 50%; border: 1px solid #2b3b51; }
    .source-line { font-size:.72rem; color:#73839a; margin-top:.35rem; }
    .footer-note { border-top:1px solid #202a38; padding-top:.75rem; margin-top:1.7rem; color:#718096; font-size:.72rem; }
    @media (max-width: 720px) {
        [data-testid="stAppViewContainer"] > .main .block-container { padding: .7rem .65rem 2rem; }
        div[role="radiogroup"] label { padding: .35rem .55rem; }
        [data-testid="stMetric"] { padding: .7rem; min-height: 94px; }
        [data-testid="stMetricValue"] { font-size: 1.23rem !important; }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

SYSTEM_PROMPT = """
You are Atlas, a disciplined cross-asset financial markets analyst and teacher.
Write like a real, experienced analyst: clear, compact, natural, and specific.
Use the data and dated headlines supplied with the user's question. Start with the direct answer.
Separate (1) verified facts, (2) interpretation, and (3) scenarios or what would invalidate the view.
Explain technical terms in plain English. When useful, show the causal chain between inflation,
Treasury yields, the US dollar, equities, gold, and crypto—but never treat a relationship as a law.
Never invent prices, events, results, dates, sources, article contents, or market correlations.
If an input is missing, stale, or contradictory, say so. Do not claim live data when the source date
is old or unavailable. Headlines are clues, not proof of causation. Cite supplied headline URLs inline
when relying on a story. Avoid overconfident predictions, personalized financial advice, and buy/sell
orders. Use short headings and practical watch-points. Usually stay below 500 words unless asked
for a deeper report. Do not show chain-of-thought or hidden reasoning.
"""

def get_secret(name: str) -> str:
    try:
        value = st.secrets.get(name, "")
        if value:
            return str(value).strip()
    except Exception:
        pass
    return os.getenv(name, "").strip()


def ai_provider() -> str:
    provider = (get_secret("AI_PROVIDER") or "gemini").strip().lower()
    if provider not in {"gemini", "xai"}:
        raise RuntimeError("AI_PROVIDER must be either 'gemini' or 'xai'.")
    return provider


def ai_model() -> str:
    if ai_provider() == "gemini":
        return get_secret("GEMINI_MODEL") or GEMINI_DEFAULT_MODEL
    return get_secret("GROK_MODEL") or GROK_DEFAULT_MODEL


def ai_api_key(provider: str | None = None) -> str:
    selected = provider or ai_provider()
    return get_secret("GEMINI_API_KEY") if selected == "gemini" else get_secret("XAI_API_KEY")


def consume_session_ai_request() -> None:
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        limit = max(1, min(30, int(get_secret("MAX_AI_REQUESTS_PER_DAY") or "15")))
    except ValueError:
        limit = 15
    usage = st.session_state.get("atlas_ai_usage", {})
    if usage.get("day") != today:
        usage = {"day": today, "count": 0}
    if int(usage.get("count", 0)) >= limit:
        raise RuntimeError(
            f"App daily AI limit reached ({limit} requests per session). "
            "The app counter resets at 00:00 UTC; provider quotas may use a different schedule."
        )
    usage["count"] = int(usage.get("count", 0)) + 1
    st.session_state["atlas_ai_usage"] = usage


def fmt_num(value, digits=2, suffix=""):
    try:
        if value is None or pd.isna(value):
            return "—"
        return f"{float(value):,.{digits}f}{suffix}"
    except Exception:
        return "—"

def latest_value(df, column="value"):
    if df is None or df.empty or column not in df:
        return None, None, None
    series = pd.to_numeric(df[column], errors="coerce").dropna()
    if series.empty:
        return None, None, None
    date = series.index[-1]
    previous = series.iloc[-2] if len(series) > 1 else None
    return float(series.iloc[-1]), date, (float(series.iloc[-1] - previous) if previous is not None else None)

@st.cache_data(ttl=1800, show_spinner=False)
def fred_series(series_id: str) -> pd.DataFrame:
    url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=" + quote(series_id)
    response = requests.get(url, timeout=15, headers={"User-Agent": "MarketPilot AI/1.0 market research"})
    response.raise_for_status()
    raw = pd.read_csv(StringIO(response.text))
    if raw.shape[1] < 2:
        return pd.DataFrame(columns=["value"])
    date_col = next((c for c in raw.columns if "date" in c.lower()), raw.columns[0])
    value_col = next((c for c in raw.columns if c != date_col), raw.columns[-1])
    raw["date"] = pd.to_datetime(raw[date_col], errors="coerce")
    raw["value"] = pd.to_numeric(raw[value_col], errors="coerce")
    out = raw.dropna(subset=["date", "value"])[["date", "value"]].sort_values("date")
    return out.set_index("date")

@st.cache_data(ttl=300, show_spinner=False)
def yahoo_history(symbol: str, range_value: str = "1y", interval: str = "1d") -> pd.DataFrame:
    period2 = int(datetime.now(timezone.utc).timestamp())
    days = {"1mo": 35, "3mo": 100, "6mo": 195, "1y": 400, "5y": 1850}.get(range_value, 400)
    period1 = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp())
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + quote(symbol, safe="^=.-")
        + f"?period1={period1}&period2={period2}&interval={quote(interval)}"
    )
    response = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0 MarketPilot AI/1.0"})
    response.raise_for_status()
    payload = response.json()
    result = (payload.get("chart", {}).get("result") or [None])[0]
    if not result or not result.get("timestamp"):
        raise ValueError("Provider returned no observations")
    quotes = (result.get("indicators", {}).get("quote") or [{}])[0]
    data = {}
    for name in ("open", "high", "low", "close", "volume"):
        arr = quotes.get(name) or []
        data[name] = arr + [None] * max(0, len(result["timestamp"]) - len(arr))
    index = pd.to_datetime(result["timestamp"], unit="s", utc=True).tz_convert(None)
    df = pd.DataFrame(data, index=index).apply(pd.to_numeric, errors="coerce")
    df.index.name = "date"
    return df.dropna(subset=["close"]).sort_index()

@st.cache_data(ttl=300, show_spinner=False)
def fetch_news(query: str = "US inflation Federal Reserve Treasury yields dollar stock market") -> list:
    q = (query or "").strip()
    if len(q) < 3:
        q = "US inflation Federal Reserve Treasury yields dollar stock market"
    url = "https://news.google.com/rss/search?q=" + quote(q[:180]) + "&hl=en-US&gl=US&ceid=US:en"
    response = requests.get(url, timeout=12, headers={"User-Agent": "Mozilla/5.0 MarketPilot AI/1.0"})
    response.raise_for_status()
    root = ET.fromstring(response.content)
    rows = []
    for item in root.findall(".//item")[:10]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        published = (item.findtext("pubDate") or "").strip()
        source_node = item.find("source")
        publisher = (source_node.text or "").strip() if source_node is not None else "Publisher in headline"
        if title and link.startswith("http"):
            rows.append({"title": title, "url": link, "published": published, "publisher": publisher})
    return rows

def load_market_data():
    data = {}
    fred_map = {
        "cpi": "CPIAUCSL",
        "ppi": "PPIACO",
        "yield": "DGS10",
    }
    symbol_map = {
        "dxy": "DX-Y.NYB",
        "vix": "^VIX",
        "sp500": "^GSPC",
        "gold": "GC=F",
        "bitcoin": "BTC-USD",
    }
    jobs = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for key, series_id in fred_map.items():
            jobs[pool.submit(fred_series, series_id)] = (key, "fred")
        for key, symbol in symbol_map.items():
            jobs[pool.submit(yahoo_history, symbol, "1y", "1d")] = (key, "yahoo")
        for future in as_completed(jobs):
            key, kind = jobs[future]
            try:
                frame = future.result()
                data[key] = frame if frame is not None and not frame.empty else pd.DataFrame(columns=["value"])
            except Exception:
                columns = ["value"] if kind == "fred" else ["open", "high", "low", "close", "volume"]
                data[key] = pd.DataFrame(columns=columns)
    data["cpi_yoy"] = data["cpi"][["value"]].pct_change(12, fill_method=None).mul(100).dropna() if not data["cpi"].empty else pd.DataFrame(columns=["value"])
    data["ppi_yoy"] = data["ppi"][["value"]].pct_change(12, fill_method=None).mul(100).dropna() if not data["ppi"].empty else pd.DataFrame(columns=["value"])
    return data

def metric_card(label, value, delta=None, source_date=None, positive_is_good=True):
    delta_html = ""
    if delta is not None and pd.notna(delta):
        color = "#68c8f4" if (delta >= 0) == positive_is_good else "#ff6477"
        sign = "+" if delta > 0 else ""
        delta_html = f'<div style="font-size:.76rem;color:{color};margin-top:5px">{sign}{fmt_num(delta)}</div>'
    date_text = source_date.strftime("%d %b %Y") if hasattr(source_date, "strftime") else "Observation unavailable"
    st.markdown(
        f"""
        <div style="height:103px;background:#101722;border:1px solid #202b3a;border-radius:13px;padding:13px 14px;">
          <div style="font-size:.77rem;color:#92a2b8;font-weight:650">{html.escape(label)}</div>
          <div style="font-size:1.38rem;letter-spacing:-.035em;font-weight:780;color:#f0f5fc;margin-top:6px">{html.escape(value)}</div>
          {delta_html}
          <div style="font-size:.66rem;color:#687991;margin-top:4px">{html.escape(date_text)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

def chart_base(title: str, subtitle: str = ""):
    st.markdown(f'<div class="chart-heading">{html.escape(title)}</div>', unsafe_allow_html=True)
    if subtitle:
        st.markdown(f'<div class="chart-caption">{html.escape(subtitle)}</div>', unsafe_allow_html=True)

def finish_chart(fig, height=300):
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font={"family": "Inter, system-ui, sans-serif", "color": "#a9b8cc", "size": 11},
        margin={"l": 8, "r": 8, "t": 10, "b": 10},
        height=height,
        showlegend=False,
        hoverlabel={"bgcolor": "#172337", "bordercolor": "#34465e", "font": {"color": "#f4f7fb"}},
        xaxis={"showgrid": False, "zeroline": False, "showline": False, "rangeslider": {"visible": False}},
        yaxis={"gridcolor": "#212c3b", "zeroline": False, "showline": False, "ticksuffix": ""},
    )
    return fig

def show_fig(fig, height=300):
    finish_chart(fig, height=height)
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False, "scrollZoom": False})

def line_area_chart(df, title, color, suffix="", reference=None):
    chart_base(title)
    if df is None or df.empty:
        st.info("Provider se historical observations nahin milin. Is chart mein sample data use nahin kiya gaya.")
        return
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df.index, y=df["value"], mode="lines",
        line={"color": color, "width": 2.4, "shape": "spline"},
        fill="tozeroy", fillcolor=color.replace(")", ",0.13)").replace("rgb", "rgba") if color.startswith("rgb") else "rgba(88,151,255,0.12)",
        hovertemplate="%{x|%d %b %Y}<br>%{y:.2f}" + suffix + "<extra></extra>",
    ))
    if reference is not None:
        fig.add_hline(y=reference, line_dash="dot", line_color="#71839c", annotation_text=f"Reference {reference:g}{suffix}")
    fig.update_yaxes(tickformat=".1f")
    show_fig(fig, 286)

def inflation_chart(df, title):
    chart_base(title, "Monthly CPI inflation · bars show each published YoY reading · purple curve is the 3-month average")
    if df is None or df.empty:
        st.info("CPI inflation history is unavailable from FRED. No illustrative data is shown.")
        return
    recent = df.tail(60).copy()
    recent["average_3m"] = recent["value"].rolling(3, min_periods=2).mean()
    values = recent["value"].astype(float).tolist()
    bar_colors = []
    for idx, value in enumerate(values):
        prior = values[idx - 1] if idx else value
        bar_colors.append("#ff8197" if value > prior + 0.015 else ("#68c8f4" if value < prior - 0.015 else "#9e9fca"))
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=recent.index, y=recent["value"], name="CPI YoY",
        marker_color=bar_colors, marker_line_width=0, opacity=0.86,
        hovertemplate="%{x|%b %Y}<br>CPI inflation: %{y:.2f}%<extra></extra>",
    ))
    fig.add_trace(go.Scatter(
        x=recent.index, y=recent["average_3m"], name="3-month average",
        mode="lines+markers",
        line={"color": "#c4a5ff", "width": 3, "shape": "spline"},
        marker={"size": 4, "color": "#e0d2ff"},
        hovertemplate="%{x|%b %Y}<br>3-month average: %{y:.2f}%<extra></extra>",
    ))
    fig.add_hline(y=2.0, line_dash="dot", line_color="#71839c", annotation_text="Fed 2% reference")
    fig.update_yaxes(tickformat=".1f", ticksuffix="%", rangemode="tozero")
    fig.update_layout(legend={"orientation": "h", "y": 1.12, "x": 0})
    show_fig(fig, 310)

def bar_chart(df, title, subtitle, value_name="VIX"):
    chart_base(title, subtitle)
    if df is None or df.empty:
        st.info("Fear index historical data abhi provider se available nahin hai.")
        return
    recent = df.tail(60)
    colors = [
        "#68c8f4" if value < 15 else ("#f4bd60" if value < 25 else "#ff6477")
        for value in recent["close"].astype(float)
    ]
    fig = go.Figure(go.Bar(
        x=recent.index, y=recent["close"], marker_color=colors,
        marker_line_width=0,
        hovertemplate="%{x|%d %b %Y}<br>" + value_name + ": %{y:.2f}<extra></extra>",
    ))
    fig.add_hline(y=20, line_dash="dot", line_color="#7e8ba0", annotation_text="20 · elevated fear")
    fig.update_yaxes(tickformat=".1f", rangemode="tozero")
    show_fig(fig, 286)

def candle_chart(df, title, subtitle):
    chart_base(title, subtitle)
    if df is None or df.empty:
        st.info("Historical candles provider se available nahin huay. Chart retry par automatically refresh ho sakta hai.")
        return
    recent = df.tail(125)
    fig = go.Figure(go.Candlestick(
        x=recent.index,
        open=recent["open"], high=recent["high"], low=recent["low"], close=recent["close"],
        increasing={"line": {"color": "#68c8f4", "width": 1}, "fillcolor": "#68c8f4"},
        decreasing={"line": {"color": "#ff6477", "width": 1}, "fillcolor": "#ff6477"},
        whiskerwidth=.4,
        hovertemplate="%{x|%d %b %Y}<br>O %{open:.2f}<br>H %{high:.2f}<br>L %{low:.2f}<br>C %{close:.2f}<extra></extra>",
    ))
    show_fig(fig, 286)

def current_context(data, news=None):
    def pack(df, title, column="value", unit=""):
        value, date, delta = latest_value(df, column)
        if value is None:
            return {"name": title, "value": None, "date": None, "change": None, "unit": unit}
        return {"name": title, "value": round(value, 4), "date": str(date.date()) if hasattr(date, "date") else str(date), "change": round(delta, 4) if delta is not None else None, "unit": unit}
    rows = [
        pack(data.get("cpi_yoy"), "US CPI inflation year-over-year", unit="%"),
        pack(data.get("ppi_yoy"), "US PPI inflation year-over-year", unit="%"),
        pack(data.get("yield"), "US 10-Year Treasury yield", unit="%"),
        pack(data.get("dxy"), "US Dollar Index DXY", "close", "index"),
        pack(data.get("vix"), "VIX volatility / fear index", "close", "index"),
        pack(data.get("sp500"), "S&P 500", "close", "index"),
        pack(data.get("gold"), "Gold futures", "close", "USD/oz"),
        pack(data.get("bitcoin"), "Bitcoin", "close", "USD"),
    ]
    return {
        "as_of_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "data": rows,
        "news": (news or [])[:8],
        "data_note": "Economic series are releases with their own observation dates. Exchange quotes can be delayed and are not guaranteed real-time."
    }

def ai_answer(prompt: str) -> tuple[str, str]:
    """Call the selected server-side AI provider with one bounded request."""
    provider = ai_provider()
    api_key = ai_api_key(provider)
    if not api_key:
        key_name = "GEMINI_API_KEY" if provider == "gemini" else "XAI_API_KEY"
        raise RuntimeError(f"{key_name} is not connected. Add it in Streamlit Settings → Secrets.")

    consume_session_ai_request()
    model = ai_model()
    if provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{quote(model, safe='')}:generateContent"
        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": prompt[:12000]}]}],
            "generationConfig": {"temperature": 0.25, "maxOutputTokens": 1200},
        }
        headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
    else:
        url = "https://api.x.ai/v1/responses"
        payload = {
            "model": model,
            "input": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt[:12000]},
            ],
            "max_output_tokens": 1200,
            "temperature": 0.25,
            "store": False,
        }
        headers = {"Authorization": "Bearer " + api_key, "Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
    except requests.RequestException as exc:
        raise RuntimeError(f"{provider.upper()} API network request failed. Please retry shortly.") from exc

    try:
        result = response.json()
    except ValueError:
        result = {}

    if not response.ok:
        detail = result.get("error", {})
        if isinstance(detail, dict):
            detail = detail.get("message") or detail.get("code") or "request rejected"
        if response.status_code == 429:
            raise RuntimeError(
                "The provider's free-tier quota or rate limit has been reached. "
                "Wait for its own reset window; it may differ from the app's UTC counter."
            )
        raise RuntimeError(f"{provider.upper()} API HTTP {response.status_code}: {str(detail)[:220]}")

    if provider == "gemini":
        candidates = result.get("candidates", []) or []
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        answer = "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
        used_model = result.get("modelVersion") or model
    else:
        parts = []
        for item in result.get("output", []) or []:
            for part in item.get("content", []) or []:
                if part.get("type") == "output_text" and part.get("text"):
                    parts.append(part["text"])
        answer = "\n".join(parts).strip()
        used_model = result.get("model") or model

    if not answer:
        raise RuntimeError(f"{provider.upper()} API returned no readable text.")
    return answer, str(used_model)


def build_prompt(question: str, data: dict, news: list, history: list) -> str:
    context = current_context(data, news)
    recent_chat = [{"role": item["role"], "content": item["content"]} for item in history[-8:]]
    return (
        f"CURRENT MARKET CONTEXT (JSON):\n{json.dumps(context, ensure_ascii=False, default=str)}\n\n"
        f"RECENT CONVERSATION (JSON):\n{json.dumps(recent_chat, ensure_ascii=False, default=str)}\n\n"
        "USER QUESTION:\n" + question.strip()[:1600] +
        "\n\nAnswer in the user's language when clear. If the user writes Roman Urdu, use simple Roman Urdu. "
        "For market calls, give: direct takeaway; facts available; interpretation and transmission; two-sided scenarios; "
        "what to watch next. Explain that no available data is not the same as a confirmed zero. Cite the supplied article URL "
        "next to any claim based on a headline. Don't pretend the listed headlines establish causality."
    )

def news_query_for_question(question: str) -> str:
    cleaned = (question or "").strip()
    if len(cleaned) < 4:
        return "US inflation Federal Reserve Treasury yields dollar stock market"
    return cleaned[:130] + " financial markets"

# ----- Header and navigation -----
if st.session_state.pop("jump_to_ai", False):
    st.session_state["main_nav"] = "AI Analyst"

header_left, header_right = st.columns([4, 1.35], vertical_alignment="center")
with header_left:
    st.markdown(
        """
        <div class="brand-row">
          <div class="brand-mark">
            <svg viewBox="0 0 48 48" width="39" height="39" aria-label="Candlestick market logo">
              <rect x="5" y="8" width="38" height="32" rx="9" fill="#111b28" stroke="#29384b"/>
              <path d="M14 12V34" stroke="#68c8f4" stroke-width="2" stroke-linecap="round"/>
              <rect x="10" y="18" width="8" height="11" rx="1.5" fill="#68c8f4"/>
              <path d="M25 8V35" stroke="#ff6477" stroke-width="2" stroke-linecap="round"/>
              <rect x="21" y="13" width="8" height="14" rx="1.5" fill="#ff6477"/>
              <path d="M36 11V36" stroke="#68c8f4" stroke-width="2" stroke-linecap="round"/>
              <rect x="32" y="23" width="8" height="8" rx="1.5" fill="#68c8f4"/>
            </svg>
          </div>
          <div>
            <div class="brand-name">MarketPilot AI</div>
            <div class="brand-sub">Market intelligence, without the noise</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
st.markdown(
    '<section class="inspiration-banner"><span class="inspiration-badge">SH</span><div class="inspiration-copy"><strong>Inspired by Saad Hashmani</strong> — the person who first introduced me to the world of markets. That spark of curiosity became the starting point for MarketPilot AI.<small>Built independently for learning, market research and disciplined analysis.</small></div></section>',
    unsafe_allow_html=True,
)

pages = ["Markets", "AI Analyst", "Daily Brief", "Your Journal", "Historical Patterns", "Profile"]
if st.session_state.get("main_nav") not in pages:
    st.session_state["main_nav"] = "Markets"
with header_right:
    with st.popover("⋮ Menu", use_container_width=True):
        st.radio("Workspace sections", pages, horizontal=False, label_visibility="collapsed", key="main_nav")
page = st.session_state.get("main_nav", "Markets")

# ----- Data load only on views that need it -----
data = {}
if page in ("Markets", "Daily Brief", "AI Analyst", "Historical Patterns"):
    with st.spinner("Loading public market and economic observations…"):
        data = load_market_data()

# ----- MARKETS -----
if page == "Markets":
    st.markdown('<div class="eyebrow">Macro + cross-asset dashboard</div>', unsafe_allow_html=True)
    st.title("Read the market before the move.")
    st.markdown('<div class="section-note">Inflation, rates, dollar strength and risk appetite in one view.</div>', unsafe_allow_html=True)

    cpi_v, cpi_d, cpi_delta = latest_value(data.get("cpi_yoy"))
    ppi_v, ppi_d, ppi_delta = latest_value(data.get("ppi_yoy"))
    y10_v, y10_d, y10_delta = latest_value(data.get("yield"))
    dxy_v, dxy_d, dxy_delta = latest_value(data.get("dxy"), "close")
    vix_v, vix_d, vix_delta = latest_value(data.get("vix"), "close")
    sp_v, sp_d, sp_delta = latest_value(data.get("sp500"), "close")

    cols = st.columns(6, gap="small")
    metrics = [
        ("CPI inflation YoY", fmt_num(cpi_v, 2, "%"), cpi_delta, cpi_d, False),
        ("PPI inflation YoY", fmt_num(ppi_v, 2, "%"), ppi_delta, ppi_d, False),
        ("US 10Y yield", fmt_num(y10_v, 2, "%"), y10_delta, y10_d, False),
        ("DXY dollar index", fmt_num(dxy_v, 2), dxy_delta, dxy_d, False),
        ("VIX fear index", fmt_num(vix_v, 2), vix_delta, vix_d, False),
        ("S&P 500", fmt_num(sp_v, 2), sp_delta, sp_d, True),
    ]
    for column, (label, value, delta, date, positive_good) in zip(cols, metrics):
        with column:
            metric_card(label, value, delta, date, positive_is_good=positive_good)

    st.markdown(" ")
    st.markdown("### Macro charts")
    first_left, first_right = st.columns(2, gap="medium")
    with first_left:
        cpi_data = data.get("cpi_yoy")
        if cpi_data is not None and not cpi_data.empty:
            cpi_data = cpi_data.tail(120)
        inflation_chart(cpi_data, "US CPI · year-over-year")
    with first_right:
        bar_chart(data.get("vix"), "VIX · fear & volatility", "Daily bars · under 15 calm, 15–25 watch, above 25 elevated", "VIX")

    second_left, second_right = st.columns(2, gap="medium")
    with second_left:
        candle_chart(data.get("dxy"), "US Dollar Index · DXY", "Daily candlesticks · 125 latest sessions · Yahoo Finance")
    with second_right:
        y10 = data.get("yield")
        if y10 is not None and not y10.empty:
            y10 = y10.tail(150)
        line_area_chart(y10, "US Treasury · 10-year yield", "rgb(173,132,255)", "%")

    st.markdown("### Inflation & risk appetite")
    third_left, third_right = st.columns(2, gap="medium")
    with third_left:
        ppi_data = data.get("ppi_yoy")
        chart_base("US PPI · year-over-year", "Producer-price trend · monthly observations")
        if ppi_data is None or ppi_data.empty:
            st.info("PPI observation history unavailable from FRED.")
        else:
            ppi_data = ppi_data.tail(48)
            bar_colors = ["#68c8f4" if x >= 0 else "#ff6477" for x in ppi_data["value"].astype(float)]
            fig = go.Figure(go.Bar(
                x=ppi_data.index, y=ppi_data["value"], marker_color=bar_colors, marker_line_width=0,
                hovertemplate="%{x|%b %Y}<br>PPI YoY: %{y:.2f}%<extra></extra>",
            ))
            fig.add_hline(y=0, line_color="#64758b", line_width=1)
            fig.update_yaxes(tickformat=".1f", ticksuffix="%")
            show_fig(fig, 286)
    with third_right:
        candle_chart(data.get("sp500"), "S&P 500 · market structure", "Daily candlesticks · broad US equity benchmark")

    fourth_left, fourth_right = st.columns(2, gap="medium")
    with fourth_left:
        candle_chart(data.get("gold"), "Gold futures", "USD per ounce · daily candles")
    with fourth_right:
        candle_chart(data.get("bitcoin"), "Bitcoin · BTC/USD", "Crypto risk appetite · daily candles")

    st.markdown(
        '<div class="insight-box"><div class="insight-title">How to read this dashboard</div>'
        '<div class="insight-copy">Inflation surprises can shift rate expectations; yields can affect the dollar and equity valuations; VIX reflects expected equity volatility. These are relationships to test against current evidence, not automatic trading rules. CPI/PPI release dates differ from quote timestamps.</div></div>',
        unsafe_allow_html=True,
    )
    if st.button("Open Atlas for a market read  ↗", type="primary"):
        st.session_state["jump_to_ai"] = True
        st.rerun()
    st.markdown('<div class="source-line">Sources: FRED economic series; Yahoo Finance chart data. Quotes may be delayed. Values are shown with observation dates where available.</div>', unsafe_allow_html=True)

# ----- RESEARCH -----
elif page == "Daily Brief":
    st.markdown('<div class="eyebrow">Headlines and context</div>', unsafe_allow_html=True)
    st.title("Daily market brief")
    st.markdown('<div class="section-note">Headline discovery first; AI summary uses the selected server-side model when configured.</div>', unsafe_allow_html=True)

    query = st.text_input("News topic", value="US inflation Federal Reserve Treasury yields dollar stocks", max_chars=180)
    try:
        with st.spinner("Searching publisher headlines…"):
            news_items = fetch_news(query)
    except Exception as exc:
        news_items = []
        st.warning("News feed did not respond. The rest of the dashboard can still work. Details: " + str(exc)[:160])

    if news_items:
        for item in news_items[:8]:
            with st.container(border=True):
                st.markdown(f"**[{item['title']}]({item['url']})**")
                st.markdown(f'<div class="source-line">{html.escape(item["publisher"])} · {html.escape(item["published"])}</div>', unsafe_allow_html=True)
        st.markdown(" ")
        if st.button("Generate plain-English market brief", type="primary"):
            with st.spinner("Preparing research brief…"):
                try:
                    prompt = build_prompt(
                        "Create a concise market brief from the supplied observations and current headlines. Organize it into: key developments, macro transmission, affected assets, bull case, bear case, and what to watch. Cite headline links. Label any interpretation as interpretation.",
                        data, news_items, [],
                    )
                    answer, model = ai_answer(prompt)
                    st.session_state["last_brief"] = answer
                    st.session_state["last_brief_model"] = model
                except Exception as exc:
                    st.error(str(exc))
    else:
        st.info("No usable headlines came back from the RSS feed. No headlines will be invented.")
    if st.session_state.get("last_brief"):
        st.markdown("### Market brief")
        st.markdown(st.session_state["last_brief"])
        st.caption("Generated with " + str(st.session_state.get("last_brief_model", ai_model())))

# ----- PIP AI -----
elif page == "AI Analyst":
    left, right = st.columns([3, 1], vertical_alignment="center")
    with left:
        st.markdown('<div class="eyebrow">Conversational market research</div>', unsafe_allow_html=True)
        st.title("Atlas")
        st.markdown('<div class="section-note">A practical market analyst. Ask about the why, not only the what.</div>', unsafe_allow_html=True)
    with right:
        if os.path.exists("assets/saad-hashmani-avatar.webp"):
            st.image("assets/saad-hashmani-avatar.webp", width=74)
        if st.button("Clear chat", use_container_width=True):
            st.session_state["pip_messages"] = []
            st.rerun()

    if "pip_messages" not in st.session_state:
        st.session_state["pip_messages"] = []

    api_ready = bool(ai_api_key(ai_provider()))
    if api_ready:
        st.markdown('<span class="status-pill"><span class="status-dot"></span>AI API connected · selected provider and model are shown below</span>', unsafe_allow_html=True)
    else:
        st.info("Dashboard mode is ready. Add GEMINI_API_KEY to Streamlit Cloud → Settings → Secrets for the default Gemini provider. The key stays server-side.")

    with st.container(border=True):
        st.markdown("**Try a question**")
        quick_cols = st.columns(3)
        quick_prompts = [
            "Explain how CPI, Treasury yields and DXY can affect stocks.",
            "What would make the current market setup bullish or bearish?",
            "Explain the VIX in simple words with an example.",
        ]
        for idx, prompt in enumerate(quick_prompts):
            with quick_cols[idx]:
                if st.button(prompt, key=f"quick_prompt_{idx}", use_container_width=True):
                    st.session_state["pending_pip_prompt"] = prompt
                    st.rerun()

    for item in st.session_state["pip_messages"]:
        with st.chat_message(item["role"], avatar="assets/saad-hashmani-avatar.webp" if item["role"] == "assistant" and os.path.exists("assets/saad-hashmani-avatar.webp") else None):
            st.markdown(item["content"])

    pending = st.session_state.pop("pending_pip_prompt", None)
    user_prompt = st.chat_input("Ask Atlas about markets, macro, risk or a trading concept…")
    user_prompt = user_prompt or pending
    if user_prompt:
        st.session_state["pip_messages"].append({"role": "user", "content": user_prompt})
        with st.chat_message("user"):
            st.markdown(user_prompt)

        if not ai_api_key(ai_provider()):
            required_key = "GEMINI_API_KEY" if ai_provider() == "gemini" else "XAI_API_KEY"
            answer = f"Atlas ka dashboard aur charts ready hain, lekin AI response ke liye {required_key} abhi connect nahin hui. Streamlit Cloud ke Settings → Secrets mein server-side key add karein. API key ko chat, HTML ya GitHub code mein paste na karein."
            model_used = "not connected"
        else:
            try:
                with st.spinner("Atlas is checking the available data and headlines…"):
                    try:
                        headlines = fetch_news(news_query_for_question(user_prompt))
                    except Exception:
                        headlines = []
                    prompt = build_prompt(user_prompt, data, headlines, st.session_state["pip_messages"][:-1])
                    answer, model_used = ai_answer(prompt)
            except Exception as exc:
                answer = (
                    "AI request complete nahin ho saki. Agar 429 aaye to free-tier request limit khatam ho sakti hai; "
                    "503 temporary service load ho sakta hai. API key ko code mein na daalein.\n\n"
                    "Technical detail: " + str(exc)[:260]
                )
                model_used = ai_provider().upper() + " unavailable"

        st.session_state["pip_messages"].append({"role": "assistant", "content": answer})
        st.session_state["pip_model_used"] = model_used
        with st.chat_message("assistant", avatar="assets/saad-hashmani-avatar.webp" if os.path.exists("assets/saad-hashmani-avatar.webp") else None):
            st.markdown(answer)
        st.rerun()

    if st.session_state.get("pip_model_used"):
        st.caption("Model: " + str(st.session_state["pip_model_used"]) + " · AI calls are limited to 15 per session per UTC day by default; provider quotas are separate.")
    st.markdown('<div class="source-line">Atlas uses available public market observations and headline links. If a provider is unavailable, it should say so rather than fabricate a price or headline.</div>', unsafe_allow_html=True)

# ----- JOURNAL -----
elif page == "Your Journal":
    st.markdown('<div class="eyebrow">Private learning log</div>', unsafe_allow_html=True)
    st.title("Trading journal")
    st.markdown('<div class="section-note">Record your thesis, then compare it with what the market actually did.</div>', unsafe_allow_html=True)
    st.warning("This prototype stores journal entries in the current app session only. Export CSV to keep a backup; entries are not yet synced to a permanent private database.")

    if "journal_entries" not in st.session_state:
        st.session_state["journal_entries"] = []

    with st.form("journal_entry_form", clear_on_submit=True):
        c1, c2 = st.columns(2)
        with c1:
            entry_date = st.date_input("Date", value=datetime.now().date())
            market = st.selectbox("Market / asset", ["S&P 500", "Nasdaq", "DXY", "US 10Y Yield", "Gold", "Bitcoin", "Forex", "Other"])
        with c2:
            bias = st.selectbox("My bias", ["Neutral", "Bullish", "Bearish", "Uncertain"])
            horizon = st.selectbox("Time horizon", ["Intraday", "1–5 days", "1–4 weeks", "Macro / long-term"])
        thesis = st.text_area("What do I expect, and why?", height=105, placeholder="Write the key evidence—not just the prediction.")
        outcome = st.text_area("What did the market actually do?", height=90, placeholder="Record the move and the catalyst, if known.")
        lesson = st.text_area("Lesson / what would change my mind?", height=80, placeholder="What did I learn? What did I miss?")
        submitted = st.form_submit_button("Save journal entry", type="primary", use_container_width=True)
        if submitted:
            if not thesis.strip() and not outcome.strip() and not lesson.strip():
                st.error("At least one note is required.")
            else:
                st.session_state["journal_entries"].insert(0, {
                    "date": str(entry_date), "market": market, "bias": bias, "horizon": horizon,
                    "thesis": thesis.strip(), "outcome": outcome.strip(), "lesson": lesson.strip(),
                })
                st.success("Entry saved to this session.")

    entries = st.session_state["journal_entries"]
    if entries:
        st.markdown("### Your entries")
        df_entries = pd.DataFrame(entries)
        st.download_button(
            "Export journal as CSV",
            df_entries.to_csv(index=False).encode("utf-8"),
            file_name="marketpilot-journal.csv",
            mime="text/csv",
            use_container_width=True,
        )
        for idx, entry in enumerate(entries):
            with st.container(border=True):
                top_a, top_b, top_c = st.columns([2, 1.4, .7])
                top_a.markdown(f"**{html.escape(entry['market'])}** · {html.escape(entry['date'])}")
                top_b.caption(f"{entry['bias']} · {entry['horizon']}")
                if top_c.button("Delete", key=f"delete_entry_{idx}"):
                    st.session_state["journal_entries"].pop(idx)
                    st.rerun()
                if entry["thesis"]:
                    st.markdown("**Thesis**")
                    st.write(entry["thesis"])
                if entry["outcome"]:
                    st.markdown("**Market outcome**")
                    st.write(entry["outcome"])
                if entry["lesson"]:
                    st.markdown("**Lesson**")
                    st.write(entry["lesson"])
    else:
        st.info("No entries in this session yet. Save a first entry above.")

# ----- HISTORICAL PATTERNS -----
elif page == "Historical Patterns":
    st.markdown('<div class="eyebrow">Compare behaviour over time</div>', unsafe_allow_html=True)
    st.title("Historical patterns")
    st.markdown('<div class="section-note">Return relationships can change. Correlation is not causation and does not predict the next move.</div>', unsafe_allow_html=True)

    series_map = {
        "DXY": data.get("dxy"),
        "VIX": data.get("vix"),
        "S&P 500": data.get("sp500"),
        "Gold": data.get("gold"),
        "Bitcoin": data.get("bitcoin"),
    }
    close_series = []
    for label, df in series_map.items():
        if df is not None and not df.empty and "close" in df:
            s = df["close"].rename(label)
            close_series.append(s)
    if len(close_series) >= 2:
        # Calculate each instrument on its own trading calendar; never forward-fill
        # weekend or market-holiday prices just to manufacture synchronized returns.
        return_series = [series.pct_change(fill_method=None).rename(series.name) for series in close_series]
        returns = pd.concat(return_series, axis=1).sort_index()
        corr = returns.tail(120).corr(min_periods=30)
        if corr.notna().sum().sum() > 0:
            fig = go.Figure(go.Heatmap(
                z=corr.values,
                x=list(corr.columns), y=list(corr.index),
                zmin=-1, zmax=1, zmid=0,
                colorscale=[
                    [0.0, "#ff6477"], [0.25, "#6b3747"], [0.5, "#162131"],
                    [0.75, "#364d76"], [1.0, "#68c8f4"],
                ],
                colorbar={"title": "Corr.", "tickformat": ".1f"},
                hovertemplate="%{y} vs %{x}<br>Correlation: %{z:.2f}<extra></extra>",
            ))
            fig.update_layout(
                template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                margin={"l": 12, "r": 12, "t": 15, "b": 12}, height=410,
                font={"family": "Inter, system-ui", "color": "#afbed1", "size": 12},
            )
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})
            st.caption("Pearson correlation of each instrument's own daily percentage returns across up to 120 recent dates. Pairwise complete observations are used; missing sessions are never forward-filled. Correlation is not causation.")
        else:
            st.info("Enough overlapping history has not arrived from the data providers.")
    else:
        st.info("At least two market histories must load before a correlation map can be calculated. No placeholder data is used.")
    st.markdown(
        '<div class="insight-box"><div class="insight-title">How to interpret correlation</div>'
        '<div class="insight-copy">A value near +1 means two series often moved in the same direction in this sample; near −1 means they often moved in opposite directions; near 0 means there was little linear co-movement. The relationship can reverse across regimes and does not establish a causal mechanism.</div></div>',
        unsafe_allow_html=True,
    )

elif page == "Profile":
    st.markdown('<div class="eyebrow">Workspace preferences</div>', unsafe_allow_html=True)
    st.title("Profile & preferences")
    st.markdown('<div class="section-note">These settings are stored only for the current Streamlit session in this prototype.</div>', unsafe_allow_html=True)
    display_name = st.text_input("Display name", value=st.session_state.get("profile_display_name", ""), max_chars=60)
    focus = st.multiselect("Markets you follow", ["US equities", "Treasury yields", "US dollar", "Inflation", "Gold", "Forex", "Crypto", "Volatility"], default=st.session_state.get("profile_focus", ["Inflation", "Treasury yields", "US dollar"]))
    if st.button("Save preferences", type="primary"):
        st.session_state["profile_display_name"] = display_name.strip()
        st.session_state["profile_focus"] = focus
        st.success("Preferences saved for this session.")
    st.markdown("**Data & privacy**")
    st.write("The selected AI API key belongs in Streamlit Cloud App settings → Secrets (GEMINI_API_KEY by default; XAI_API_KEY only when AI_PROVIDER=xai). Never paste keys into this page, a chat, or a public source file.")
    st.warning("Gemini API free-tier content may be used by Google to improve its products. Do not send confidential journal notes, passwords, account details or sensitive personal information through a free-tier key.")
    st.write("Market observations come from public FRED and Yahoo Finance endpoints. They may be delayed or unavailable. Your legacy GitHub Pages journal remains separate and is not altered by this app.")

st.markdown(
    '<div class="footer-note">MarketPilot AI is an educational research workspace, not an execution platform or financial adviser. Public feeds may be delayed, incomplete or unavailable. Never treat an AI response or a chart pattern as a guaranteed trading signal.</div>',
    unsafe_allow_html=True,
)
