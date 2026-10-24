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

APP_NAME = "CandleDesk"
ASSISTANT_NAME = "Pip"
GROK_DEFAULT_MODEL = "grok-4.7"

st.set_page_config(
    page_title="CandleDesk | Market Intelligence",
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
    .status-dot { width:7px; height:7px; display:inline-block; border-radius:100%; background:#5dd39e; }
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
You are Pip, a disciplined cross-asset financial markets analyst and teacher.
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
    response = requests.get(url, timeout=15, headers={"User-Agent": "CandleDesk/1.0 market research"})
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
    response = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0 CandleDesk/1.0"})
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
    response = requests.get(url, timeout=12, headers={"User-Agent": "Mozilla/5.0 CandleDesk/1.0"})
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
    series_map = {
        "cpi": ("CPIAUCSL", "CPI index"),
        "ppi": ("PPIACO", "PPI index"),
        "yield": ("DGS10", "US 10-Year Treasury yield"),
    }
    for key, (series_id, _) in series_map.items():
        try:
            df = fred_series(series_id)
            data[key] = df if not df.empty else pd.DataFrame(columns=["value"])
        except Exception:
            data[key] = pd.DataFrame(columns=["value"])

    symbol_map = {
        "dxy": "DX-Y.NYB",
        "vix": "^VIX",
        "sp500": "^GSPC",
        "gold": "GC=F",
        "bitcoin": "BTC-USD",
    }
    for key, symbol in symbol_map.items():
        try:
            data[key] = yahoo_history(symbol, "1y", "1d")
        except Exception:
            data[key] = pd.DataFrame(columns=["open", "high", "low", "close", "volume"])
    data["cpi_yoy"] = data["cpi"][["value"]].pct_change(12).mul(100).dropna() if not data["cpi"].empty else pd.DataFrame(columns=["value"])
    data["ppi_yoy"] = data["ppi"][["value"]].pct_change(12).mul(100).dropna() if not data["ppi"].empty else pd.DataFrame(columns=["value"])
    return data

def metric_card(label, value, delta=None, source_date=None, positive_is_good=True):
    delta_html = ""
    if delta is not None and pd.notna(delta):
        color = "#57d69b" if (delta >= 0) == positive_is_good else "#ff6477"
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

def bar_chart(df, title, subtitle, value_name="VIX"):
    chart_base(title, subtitle)
    if df is None or df.empty:
        st.info("Fear index historical data abhi provider se available nahin hai.")
        return
    recent = df.tail(60)
    colors = [
        "#50d39a" if value < 15 else ("#f4bd60" if value < 25 else "#ff6477")
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
        increasing={"line": {"color": "#50d39a", "width": 1}, "fillcolor": "#50d39a"},
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

def grok_answer(prompt: str) -> tuple[str, str]:
    """Call xAI's Responses API without exposing the API key to the browser or logs."""
    api_key = get_secret("XAI_API_KEY")
    if not api_key:
        raise RuntimeError("Grok API key is not connected. Add XAI_API_KEY in Streamlit Settings → Secrets.")

    model = get_secret("GROK_MODEL") or GROK_DEFAULT_MODEL
    url = "https://api.x.ai/v1/responses"
    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "reasoning": {"effort": "medium"},
        "max_output_tokens": 1700,
        "temperature": 0.7,
        "top_p": 0.95,
        "store": False,
    }
    try:
        response = requests.post(
            url,
            headers={
                "Authorization": "Bearer " + api_key,
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=120,
        )
    except requests.RequestException as exc:
        raise RuntimeError("Grok API network request failed. Please retry in a moment.") from exc

    try:
        result = response.json()
    except ValueError:
        result = {}

    if not response.ok:
        detail = result.get("error", {})
        if isinstance(detail, dict):
            detail = detail.get("message") or detail.get("code") or "request rejected"
        raise RuntimeError(f"Grok API HTTP {response.status_code}: {str(detail)[:220]}")

    parts = []
    for item in result.get("output", []) or []:
        for part in item.get("content", []) or []:
            if part.get("type") == "output_text" and part.get("text"):
                parts.append(part["text"])
    answer = "\n".join(parts).strip()
    if not answer:
        raise RuntimeError("Grok API returned no readable text.")
    return answer, str(result.get("model") or model)

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
    st.session_state["main_nav"] = "Pip AI"

header_left, header_right = st.columns([4, 1.35], vertical_alignment="center")
with header_left:
    st.markdown(
        """
        <div class="brand-row">
          <div class="brand-mark">
            <svg viewBox="0 0 48 48" width="39" height="39" aria-label="Candlestick market logo">
              <rect x="5" y="8" width="38" height="32" rx="9" fill="#111b28" stroke="#29384b"/>
              <path d="M14 12V34" stroke="#50d39a" stroke-width="2" stroke-linecap="round"/>
              <rect x="10" y="18" width="8" height="11" rx="1.5" fill="#50d39a"/>
              <path d="M25 8V35" stroke="#ff6477" stroke-width="2" stroke-linecap="round"/>
              <rect x="21" y="13" width="8" height="14" rx="1.5" fill="#ff6477"/>
              <path d="M36 11V36" stroke="#50d39a" stroke-width="2" stroke-linecap="round"/>
              <rect x="32" y="23" width="8" height="8" rx="1.5" fill="#50d39a"/>
            </svg>
          </div>
          <div>
            <div class="brand-name">CandleDesk</div>
            <div class="brand-sub">Market intelligence, without the noise</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
with header_right:
    st.markdown('<div style="text-align:right;padding-top:.3rem"><span class="status-pill"><span class="status-dot"></span>Research workspace</span></div>', unsafe_allow_html=True)

pages = ["Markets", "Research", "Pip AI", "Journal", "Historical Patterns"]
page = st.radio("Main navigation", pages, horizontal=True, label_visibility="collapsed", key="main_nav")

# ----- Data load only on views that need it -----
data = {}
if page in ("Markets", "Research", "Pip AI", "Historical Patterns"):
    with st.spinner("Loading public market and economic observations…"):
        data = load_market_data()

# ----- MARKETS -----
if page == "Markets":
    title_col, action_col = st.columns([4, 1.25], vertical_alignment="center")
    with title_col:
        st.markdown('<div class="eyebrow">Macro + cross-asset dashboard</div>', unsafe_allow_html=True)
        st.title("Read the market before the move.")
        st.markdown('<div class="section-note">Inflation, rates, dollar strength and risk appetite in one view.</div>', unsafe_allow_html=True)
    with action_col:
        if st.button("Ask Pip  ↗", type="primary", use_container_width=True):
            st.session_state["jump_to_ai"] = True
            st.rerun()

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
        line_area_chart(cpi_data, "US CPI · year-over-year", "rgb(94,155,255)", "%", reference=2.0)
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
            bar_colors = ["#50d39a" if x >= 0 else "#ff6477" for x in ppi_data["value"].astype(float)]
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
    if st.button("Open Pip for a market read  ↗", type="primary"):
        st.session_state["jump_to_ai"] = True
        st.rerun()
    st.markdown('<div class="source-line">Sources: FRED economic series; Yahoo Finance chart data. Quotes may be delayed. Values are shown with observation dates where available.</div>', unsafe_allow_html=True)

# ----- RESEARCH -----
elif page == "Research":
    st.markdown('<div class="eyebrow">Headlines and context</div>', unsafe_allow_html=True)
    st.title("Research brief")
    st.markdown('<div class="section-note">Headline discovery first; AI summary only when Grok API is configured.</div>', unsafe_allow_html=True)

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
                    answer, model = grok_answer(prompt)
                    st.session_state["last_brief"] = answer
                    st.session_state["last_brief_model"] = model
                except Exception as exc:
                    st.error(str(exc))
    else:
        st.info("No usable headlines came back from the RSS feed. No headlines will be invented.")
    if st.session_state.get("last_brief"):
        st.markdown("### Market brief")
        st.markdown(st.session_state["last_brief"])
        st.caption("Generated with " + str(st.session_state.get("last_brief_model", GROK_DEFAULT_MODEL)))

# ----- PIP AI -----
elif page == "Pip AI":
    left, right = st.columns([3, 1], vertical_alignment="center")
    with left:
        st.markdown('<div class="eyebrow">Conversational market research</div>', unsafe_allow_html=True)
        st.title("Pip")
        st.markdown('<div class="section-note">A practical market analyst. Ask about the why, not only the what.</div>', unsafe_allow_html=True)
    with right:
        if os.path.exists("assets/pip-avatar.webp"):
            st.image("assets/pip-avatar.webp", width=74)
        if st.button("Clear chat", use_container_width=True):
            st.session_state["pip_messages"] = []
            st.rerun()

    if "pip_messages" not in st.session_state:
        st.session_state["pip_messages"] = []

    api_ready = bool(get_secret("XAI_API_KEY"))
    if api_ready:
        st.markdown('<span class="status-pill"><span class="status-dot"></span>Grok connected · free tier may be rate-limited</span>', unsafe_allow_html=True)
    else:
        st.info("Dashboard mode is ready. Pip's AI replies activate after XAI_API_KEY is added in Streamlit Cloud → Settings → Secrets. The key will not be stored in source code.")

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
        with st.chat_message(item["role"], avatar="assets/pip-avatar.webp" if item["role"] == "assistant" and os.path.exists("assets/pip-avatar.webp") else None):
            st.markdown(item["content"])

    pending = st.session_state.pop("pending_pip_prompt", None)
    user_prompt = st.chat_input("Ask Pip about markets, macro, risk or a trading concept…")
    user_prompt = user_prompt or pending
    if user_prompt:
        st.session_state["pip_messages"].append({"role": "user", "content": user_prompt})
        with st.chat_message("user"):
            st.markdown(user_prompt)

        if not get_secret("XAI_API_KEY"):
            answer = "Pip ka dashboard aur charts setup ho raha hai, lekin AI response ke liye Grok API key abhi connect nahin hui. Deployment ke baad Streamlit Cloud ke Settings → Secrets mein XAI_API_KEY add karni hogi. API key ko chat, HTML ya GitHub code mein paste na karein."
            model_used = "not connected"
        else:
            try:
                with st.spinner("Pip is checking the available data and headlines…"):
                    try:
                        headlines = fetch_news(news_query_for_question(user_prompt))
                    except Exception:
                        headlines = []
                    prompt = build_prompt(user_prompt, data, headlines, st.session_state["pip_messages"][:-1])
                    answer, model_used = grok_answer(prompt)
            except Exception as exc:
                answer = (
                    "AI request complete nahin ho saki. Agar 429 aaye to free-tier request limit khatam ho sakti hai; "
                    "503 temporary service load ho sakta hai. API key ko code mein na daalein.\n\n"
                    "Technical detail: " + str(exc)[:260]
                )
                model_used = "Grok unavailable"

        st.session_state["pip_messages"].append({"role": "assistant", "content": answer})
        st.session_state["pip_model_used"] = model_used
        with st.chat_message("assistant", avatar="assets/pip-avatar.webp" if os.path.exists("assets/pip-avatar.webp") else None):
            st.markdown(answer)
        st.rerun()

    if st.session_state.get("pip_model_used"):
        st.caption("Model: " + str(st.session_state["pip_model_used"]) + " · A model label does not guarantee response accuracy.")
    st.markdown('<div class="source-line">Pip uses available public market observations and headline links. If a provider is unavailable, it should say so rather than fabricate a price or headline.</div>', unsafe_allow_html=True)

# ----- JOURNAL -----
elif page == "Journal":
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
            file_name="candledesk-journal.csv",
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
        prices = pd.concat(close_series, axis=1).sort_index()
        returns = prices.pct_change().dropna(how="all")
        corr = returns.tail(120).corr(min_periods=30)
        if corr.notna().sum().sum() > 0:
            fig = go.Figure(go.Heatmap(
                z=corr.values,
                x=list(corr.columns), y=list(corr.index),
                zmin=-1, zmax=1, zmid=0,
                colorscale=[
                    [0.0, "#ff6477"], [0.25, "#6b3747"], [0.5, "#162131"],
                    [0.75, "#245b58"], [1.0, "#50d39a"],
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
            st.caption("Pearson correlation of daily percentage returns, latest 120 calendar-day observations where available. Pairwise observations are limited by each provider's history.")
        else:
            st.info("Enough overlapping history has not arrived from the data providers.")
    else:
        st.info("At least two market histories must load before a correlation map can be calculated. No placeholder data is used.")
    st.markdown(
        '<div class="insight-box"><div class="insight-title">How to interpret correlation</div>'
        '<div class="insight-copy">A value near +1 means two series often moved in the same direction in this sample; near −1 means they often moved in opposite directions; near 0 means there was little linear co-movement. The relationship can reverse across regimes and does not establish a causal mechanism.</div></div>',
        unsafe_allow_html=True,
    )

st.markdown(
    '<div class="footer-note">CandleDesk is an educational research workspace, not an execution platform or financial adviser. Public feeds may be delayed, incomplete or unavailable. Never treat an AI response or a chart pattern as a guaranteed trading signal.</div>',
    unsafe_allow_html=True,
)
