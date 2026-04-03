"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import OverviewPanel from "@/components/OverviewPanel";
import PlatformDetail from "@/components/PlatformDetail";
import { PlatformData } from "@/types";
import { searchCreators, getPlatformQueries } from "@/lib/creators";
import { VideoFilter } from "@/lib/videoFilter";

export type ActiveTab = "overview" | "youtube" | "tiktok" | "instagram";

const HISTORY_KEY = "socialscope_history";
const CACHE_TTL   = 5 * 60 * 1000; // 5 minutes

// ─── helpers ─────────────────────────────────────────────────────────────────

function cacheKey(platform: string, q: string) {
  return `ss_${platform}_${q.toLowerCase().trim()}`;
}

function readCache(platform: string, q: string): PlatformData | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(platform, q));
    if (!raw) return null;
    const parsed: PlatformData = JSON.parse(raw);
    if (parsed.fetchedAt && Date.now() - parsed.fetchedAt < CACHE_TTL) return parsed;
    sessionStorage.removeItem(cacheKey(platform, q));
  } catch { /* ignore */ }
  return null;
}

function writeCache(platform: string, q: string, data: PlatformData) {
  try { sessionStorage.setItem(cacheKey(platform, q), JSON.stringify(data)); } catch { /* ignore */ }
}

function loadingPlatform(platform: PlatformData["platform"]): PlatformData {
  return { platform, username: "", accountName: "", profilePicture: "", totalViews: 0, videos: [], loading: true };
}

function skippedPlatform(platform: PlatformData["platform"]): PlatformData {
  return { platform, username: "", accountName: "", profilePicture: "", totalViews: 0, videos: [], skipped: true };
}

function errorPlatform(platform: PlatformData["platform"], username: string): PlatformData {
  return { platform, username, accountName: "", profilePicture: "", totalViews: 0, videos: [], error: "Gagal memuat data" };
}

function exportCSV(results: PlatformData[], query: string) {
  const rows: string[][] = [["Platform", "Account", "Username", "Followers", "Total Views", "Likes", "Comments", "Engagement Rate", "Total Posts", "Country"]];
  results.filter((r) => !r.skipped).forEach((r) => {
    const likes    = r.videos.reduce((s, v) => s + (v.likes    || 0), 0);
    const comments = r.videos.reduce((s, v) => s + (v.comments || 0), 0);
    const eng = r.totalViews > 0 ? (((likes + comments) / r.totalViews) * 100).toFixed(2) + "%" : "0%";
    rows.push([r.platform, r.accountName || "", r.username, String(r.followers || ""), String(r.totalViews), String(likes), String(comments), eng, String(r.totalPosts || ""), r.country || ""]);
  });
  rows.push([]);
  rows.push(["Platform", "Title", "Views", "Likes", "Comments", "Eng. Rate", "URL"]);
  results.filter((r) => !r.skipped).forEach((r) => {
    r.videos.forEach((v) => {
      const vEng = v.views > 0 ? (((v.likes || 0) + (v.comments || 0)) / v.views * 100).toFixed(2) + "%" : "0%";
      rows.push([r.platform, `"${v.title.replace(/"/g, '""')}"`, String(v.views), String(v.likes || 0), String(v.comments || 0), vEng, v.url]);
    });
  });
  const csv  = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `socialscope_${query}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const PLATFORM_META = {
  youtube:   { label: "YouTube",   color: "#EF4444", placeholder: "Nama channel (contoh: mrbeast)" },
  tiktok:    { label: "TikTok",    color: "var(--text-1)", placeholder: "@username (contoh: mrbeast)" },
  instagram: { label: "Instagram", color: "#EC4899", placeholder: "@username (contoh: mrbeast)" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [results,           setResults]           = useState<PlatformData[]>([]);
  const [searched,          setSearched]          = useState(false);
  const [lastQuery,         setLastQuery]         = useState("");
  const [activeTab,         setActiveTab]         = useState<ActiveTab>("overview");
  const [history,           setHistory]           = useState<string[]>([]);
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [mobileSidebar,     setMobileSidebar]     = useState(false);
  const [videoFilter,       setVideoFilter]       = useState<VideoFilter>("all");
  const [platformSearching, setPlatformSearching] = useState<string | null>(null);
  const [isDark,            setIsDark]            = useState(false);

  // 3-field inputs
  const [ytInput, setYtInput] = useState("");
  const [ttInput, setTtInput] = useState("");
  const [igInput, setIgInput] = useState("");

  // autocomplete
  const [centerInput,   setCenterInput]   = useState("");
  const [centerSuggest, setCenterSuggest] = useState<ReturnType<typeof searchCreators>>([]);
  const [showCSuggest,  setShowCSuggest]  = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);

  // ── init: dark mode + history + URL state ──────────────────────────────────
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    try { const s = localStorage.getItem(HISTORY_KEY); if (s) setHistory(JSON.parse(s)); } catch { /* ignore */ }

    // Restore search from URL
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) handleSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setCenterSuggest(searchCreators(centerInput)); }, [centerInput]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (centerRef.current && !centerRef.current.contains(e.target as Node)) setShowCSuggest(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── dark mode toggle ───────────────────────────────────────────────────────
  const toggleDark = () => {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    html.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
    setIsDark(next);
  };

  // ── history util ──────────────────────────────────────────────────────────
  const pushHistory = (q: string) => {
    setHistory((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 8);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // ── streaming fetch ───────────────────────────────────────────────────────
  const streamPlatforms = useCallback(
    async (yt: string, tt: string, ig: string, label: string, useCache = true) => {
      const platforms: Array<{ p: PlatformData["platform"]; q: string }> = [
        { p: "youtube",   q: yt },
        { p: "tiktok",    q: tt },
        { p: "instagram", q: ig },
      ];

      // Initialise with loading / skipped placeholders
      setResults(platforms.map(({ p, q }) => q ? loadingPlatform(p) : skippedPlatform(p)));
      setSearched(true);
      setLastQuery(label);
      setActiveTab("overview");
      pushHistory(label);
      window.history.pushState({}, "", `?q=${encodeURIComponent(label)}`);

      // Fetch each platform independently
      platforms.forEach(async ({ p, q }) => {
        if (!q) return;
        const cached = useCache ? readCache(p, q) : null;
        if (cached) {
          setResults((prev) => prev.map((r) => r.platform === p ? cached : r));
          return;
        }
        try {
          const data: PlatformData = await fetch(`/api/${p}?q=${encodeURIComponent(q)}`).then((r) => r.json());
          const stamped = { ...data, fetchedAt: data.fetchedAt ?? Date.now() };
          writeCache(p, q, stamped);
          setResults((prev) => prev.map((r) => r.platform === p ? stamped : r));
        } catch {
          setResults((prev) => prev.map((r) => r.platform === p ? errorPlatform(p, q) : r));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── search via creator DB ─────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setMobileSidebar(false);
    const pq = getPlatformQueries(query);
    streamPlatforms(pq.youtube, pq.tiktok, pq.instagram, query);
  };

  // ── search via 3 separate fields ─────────────────────────────────────────
  const handleSearchDirect = () => {
    if (!ytInput.trim() && !ttInput.trim() && !igInput.trim()) return;
    setMobileSidebar(false);
    const label = ytInput.trim() || ttInput.trim() || igInput.trim();
    streamPlatforms(ytInput.trim(), ttInput.trim(), igInput.trim(), label);
  };

  // ── refresh (bypass cache) ────────────────────────────────────────────────
  const handleRefresh = () => {
    if (!lastQuery || searched === false) return;
    const pq = getPlatformQueries(lastQuery);
    streamPlatforms(pq.youtube, pq.tiktok, pq.instagram, lastQuery, false);
  };

  // ── per-platform re-search ────────────────────────────────────────────────
  const handlePlatformSearch = async (platform: "youtube" | "tiktok" | "instagram", username: string) => {
    if (platformSearching) return;
    setPlatformSearching(platform);
    setResults((prev) => prev.map((r) => r.platform === platform ? { ...loadingPlatform(platform), username } : r));
    try {
      const data: PlatformData = await fetch(`/api/${platform}?q=${encodeURIComponent(username)}`).then((r) => r.json());
      const stamped = { ...data, fetchedAt: data.fetchedAt ?? Date.now() };
      writeCache(platform, username, stamped);
      setResults((prev) => prev.map((r) => r.platform === platform ? stamped : r));
    } catch {
      setResults((prev) => prev.map((r) => r.platform === platform ? errorPlatform(platform, username) : r));
    }
    setPlatformSearching(null);
  };

  const handleReset = () => {
    setSearched(false); setResults([]); setLastQuery(""); setActiveTab("overview");
    setCenterInput(""); setVideoFilter("all");
    window.history.pushState({}, "", window.location.pathname);
  };

  const anyLoading = results.some((r) => r.loading);
  const activeData = results.find((r) => r.platform === activeTab);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

      {mobileSidebar && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileSidebar(false)} />
      )}

      <Sidebar
        onSearch={handleSearch}
        loading={anyLoading && !searched}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        results={results}
        searched={searched}
        lastQuery={lastQuery}
        history={history}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        mobileSidebar={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
        onReset={handleReset}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{ background: "var(--card)", borderBottom: "1.5px solid var(--border)" }}>
          <button onClick={() => setMobileSidebar(true)}
            className="w-9 h-9 flex items-center justify-center"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: "var(--accent)", borderRadius: "7px" }}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" style={{ fill: "var(--accent-fg)" }}><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            </div>
            <span className="text-sm font-800" style={{ color: "var(--text-1)" }}>SocialScope</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleDark}
              className="w-8 h-8 flex items-center justify-center"
              style={{ border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--inner)", color: "var(--text-3)" }}>
              {isDark
                ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            {searched && (
              <button onClick={handleReset} className="text-xs font-600 flex items-center gap-1" style={{ color: "var(--text-3)" }}>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Beranda
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {!searched && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] md:h-full gap-6 px-6 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4"
                style={{ background: "var(--accent)", borderRadius: "16px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10" style={{ fill: "var(--accent-fg)" }}><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-800 mb-2" style={{ color: "var(--text-1)", letterSpacing: "-0.04em" }}>SocialScope</h1>
              <p className="text-sm font-500" style={{ color: "var(--text-2)" }}>Analisis performa kreator di YouTube, TikTok &amp; Instagram</p>
            </div>

            {/* 3-field form */}
            <div className="w-full max-w-2xl p-5 md:p-6"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "16px", boxShadow: "var(--shadow-lg)" }}>
              <p className="text-[11px] font-700 uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>Cari per platform</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {(["youtube", "tiktok", "instagram"] as const).map((p) => {
                  const meta = PLATFORM_META[p];
                  const val  = p === "youtube" ? ytInput : p === "tiktok" ? ttInput : igInput;
                  const set  = p === "youtube" ? setYtInput : p === "tiktok" ? setTtInput : setIgInput;
                  const icons = {
                    youtube:   <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                    tiktok:    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>,
                    instagram: <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
                  };
                  return (
                    <div key={p}>
                      <label className="flex items-center gap-1.5 text-[10px] font-800 uppercase tracking-widest mb-1.5" style={{ color: meta.color }}>
                        {icons[p]} {meta.label}
                      </label>
                      <input
                        type="text" value={val}
                        onChange={(e) => set(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearchDirect(); }}
                        onFocus={(e) => { e.target.style.boxShadow = `2px 2px 0px ${meta.color}`; e.target.style.borderColor = meta.color; }}
                        onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "var(--border-light)"; }}
                        placeholder={meta.placeholder}
                        className="w-full px-3 py-2.5 text-sm font-500 placeholder:text-[var(--text-4)] focus:outline-none"
                        style={{ background: "var(--inner)", border: "1.5px solid var(--border-light)", borderRadius: "8px", color: "var(--text-1)", transition: "box-shadow 0.15s, border-color 0.15s" }}
                      />
                    </div>
                  );
                })}
              </div>
              <button onClick={handleSearchDirect}
                disabled={!ytInput.trim() && !ttInput.trim() && !igInput.trim()}
                className="w-full py-3 text-sm font-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-80"
                style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: (ytInput || ttInput || igInput) ? "var(--shadow)" : "none" }}>
                Analisis Sekarang
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
              <span className="text-xs font-600" style={{ color: "var(--text-4)" }}>atau cari kreator populer</span>
              <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
            </div>

            {/* Autocomplete */}
            <div className="w-full max-w-lg relative" ref={centerRef}>
              <form onSubmit={(e) => { e.preventDefault(); if (centerInput.trim()) { handleSearch(centerInput.trim()); setShowCSuggest(false); } }} className="flex gap-2">
                <div className="relative flex-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" value={centerInput}
                    onChange={(e) => { setCenterInput(e.target.value); setShowCSuggest(true); }}
                    onFocus={(e) => { e.target.style.boxShadow = "var(--shadow)"; setShowCSuggest(true); }}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                    placeholder="Cari kreator populer... (contoh: mrbeast)"
                    className="w-full pl-11 pr-4 py-3 text-sm font-500 placeholder:text-[var(--text-4)] focus:outline-none"
                    style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "10px", color: "var(--text-1)", transition: "box-shadow 0.15s" }}
                  />
                </div>
                <button type="submit" disabled={!centerInput.trim()}
                  className="px-5 py-3 text-sm font-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-80"
                  style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: centerInput.trim() ? "var(--shadow)" : "none" }}>
                  Cari
                </button>
              </form>
              {showCSuggest && centerSuggest.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 z-50 overflow-hidden"
                  style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
                  {centerSuggest.map((c, i) => (
                    <button key={c.username} type="button"
                      onMouseDown={() => { setCenterInput(c.username); setShowCSuggest(false); handleSearch(c.username); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                      style={{ borderBottom: i < centerSuggest.length - 1 ? `1px solid var(--divider)` : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--inner)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <div>
                          <p className="text-sm font-700" style={{ color: "var(--text-1)" }}>{c.name}</p>
                          <p className="text-xs font-500" style={{ color: "var(--text-3)" }}>@{c.username}</p>
                        </div>
                      </div>
                      <span className="text-xs font-600 shrink-0 hidden sm:block" style={{ color: "var(--text-3)" }}>{c.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="p-4 md:p-6">
            {activeTab === "overview" ? (
              <OverviewPanel
                results={results}
                query={lastQuery}
                onTabChange={setActiveTab}
                onExportCSV={() => exportCSV(results, lastQuery)}
                onReset={handleReset}
                onRefresh={handleRefresh}
                videoFilter={videoFilter}
                onFilterChange={setVideoFilter}
                onPlatformSearch={handlePlatformSearch}
                platformSearching={platformSearching}
              />
            ) : (
              activeData && (
                <PlatformDetail
                  data={activeData}
                  onBack={() => setActiveTab("overview")}
                  onRefresh={handleRefresh}
                  videoFilter={videoFilter}
                  onFilterChange={setVideoFilter}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
