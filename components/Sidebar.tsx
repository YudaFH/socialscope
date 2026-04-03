"use client";

import { useState, useRef, useEffect } from "react";
import { PlatformData } from "@/types";
import { ActiveTab } from "@/app/page";
import { searchCreators } from "@/lib/creators";

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  results: PlatformData[];
  searched: boolean;
  lastQuery: string;
  history: string[];
  isOpen: boolean;
  onToggle: () => void;
  mobileSidebar: boolean;
  onCloseMobile: () => void;
  onReset: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string; color: string; icon: React.ReactNode }> = [
  { id: "overview",   label: "Overview",   color: "var(--text-1)",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id: "youtube",   label: "YouTube",   color: "#EF4444",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { id: "tiktok",    label: "TikTok",    color: "var(--text-1)",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
  { id: "instagram", label: "Instagram", color: "#EC4899",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
];

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#EF4444", tiktok: "var(--text-1)", instagram: "#EC4899",
};

function SunIcon() {
  return <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

export default function Sidebar({
  onSearch, loading, activeTab, setActiveTab, results, searched, lastQuery, history,
  isOpen, onToggle, mobileSidebar, onCloseMobile, onReset, isDark, onToggleDark,
}: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchCreators>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSuggestions(searchCreators(input)); }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) { onSearch(input.trim()); setShowSuggestions(false); }
  };

  const handleSelect = (username: string) => {
    setInput(username); setShowSuggestions(false); onSearch(username);
  };

  const totalViews     = results.filter((r) => !r.skipped && !r.loading).reduce((s, r) => s + r.totalViews, 0);
  const totalFollowers = results.filter((r) => !r.skipped && !r.loading).reduce((s, r) => s + (r.followers || 0), 0);
  const collapsed = !isOpen;

  // ── Reusable nav list ─────────────────────────────────────────────────────
  const NavList = ({ close }: { close: () => void }) => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const platformResult = results.find((r) => r.platform === item.id);
        const hasData = item.id !== "overview" && platformResult && !platformResult.error && !platformResult.loading && !platformResult.skipped;
        return (
          <button key={item.id} onClick={() => { setActiveTab(item.id); close(); }}
            className={`w-full flex items-center mb-1 text-sm font-600 transition-all ${collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"}`}
            style={{ borderRadius: "8px", color: isActive ? "var(--nav-active-fg)" : "var(--text-2)", background: isActive ? "var(--nav-active)" : "transparent", border: `1.5px solid ${isActive ? "var(--border)" : "transparent"}`, boxShadow: isActive ? "var(--shadow-sm)" : "none" }}
            title={collapsed ? item.label : undefined}>
            <span style={{ color: isActive ? "var(--nav-active-fg)" : item.color }}>{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left font-600">{item.label}</span>
                {hasData && (
                  <span className="text-[11px] font-700 px-1.5 py-0.5"
                    style={{ color: isActive ? "var(--accent-fg)" : "var(--text-1)", background: isActive ? "rgba(128,128,128,0.2)" : "var(--inner)", border: `1px solid ${isActive ? "rgba(128,128,128,0.3)" : "var(--border-lighter)"}`, borderRadius: "4px" }}>
                    {fmt(platformResult!.totalViews)}
                  </span>
                )}
                {platformResult?.loading && !isActive && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 animate-spin shrink-0" style={{ color: "#3B82F6" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                )}
                {item.id !== "overview" && platformResult?.skipped && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--border-lighter)" }} />
                )}
              </>
            )}
          </button>
        );
      })}
    </>
  );

  const sidebarContent = (
    <div className={`flex flex-col h-full transition-all duration-200 ${collapsed ? "w-14" : "w-64"}`}
      style={{ background: "var(--card)", borderRight: "1.5px solid var(--border)" }}>

      {/* Brand */}
      <div className="shrink-0 px-3 py-4 flex items-center gap-2.5" style={{ borderBottom: "1.5px solid var(--border)" }}>
        <button onClick={onReset} className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ background: "var(--accent)", borderRadius: "8px" }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: "var(--accent-fg)" }}><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </button>
        {!collapsed && (
          <button onClick={onReset} className="flex-1 min-w-0 text-left">
            <p className="text-sm font-800 truncate" style={{ color: "var(--text-1)", letterSpacing: "-0.01em" }}>SocialScope</p>
            <p className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>Analytics</p>
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="shrink-0 px-4 py-3 relative" style={{ borderBottom: "1.5px solid var(--border)" }} ref={searchRef}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="relative">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" value={input}
                onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                onFocus={(e) => { e.target.style.boxShadow = "var(--shadow-sm)"; setShowSuggestions(true); }}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
                placeholder="Cari kreator..." disabled={loading}
                className="w-full pl-9 pr-3 py-2 text-sm font-500 placeholder:text-[var(--text-4)] focus:outline-none"
                style={{ background: "var(--inner)", border: "1.5px solid var(--border)", borderRadius: "8px", color: "var(--text-1)", transition: "box-shadow 0.15s" }} />
            </div>
            <button type="submit" disabled={loading || !input.trim()}
              className="w-full py-2 text-sm font-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: loading || !input.trim() ? "none" : "var(--shadow-sm)" }}>
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 z-50 overflow-hidden"
              style={{ top: "calc(100% - 8px)", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow)" }}>
              {suggestions.map((c) => (
                <button key={c.username} type="button" onMouseDown={() => handleSelect(c.username)}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
                  style={{ borderBottom: "1px solid var(--divider)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--inner)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                  <div className="flex items-center gap-2 min-w-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span className="text-sm font-700 truncate" style={{ color: "var(--text-1)" }}>{c.name}</span>
                  </div>
                  <span className="text-[11px] font-600 shrink-0 ml-2" style={{ color: "var(--text-3)" }}>{c.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && <p className="text-[11px] font-700 uppercase tracking-widest px-2 mb-2" style={{ color: "var(--text-4)" }}>Platform</p>}
        <NavList close={onCloseMobile} />

        {/* History */}
        {!collapsed && history.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-700 uppercase tracking-widest px-2 mb-2" style={{ color: "var(--text-4)" }}>Riwayat</p>
            {history.slice(0, 6).map((q) => (
              <button key={q} onClick={() => { onSearch(q); setInput(q); onCloseMobile(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-500 transition-colors"
                style={{ borderRadius: "8px", color: "var(--text-2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--inner)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = ""; }}>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="truncate">{q}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Summary */}
      {!collapsed && searched && results.filter((r) => !r.skipped && !r.loading).length > 0 && (
        <div className="shrink-0 px-4 py-4" style={{ borderTop: "1.5px solid var(--border)", background: "var(--inner)" }}>
          <p className="text-[11px] font-700 mb-3 truncate" style={{ color: "var(--text-3)" }}>
            Hasil &ldquo;<span className="font-700" style={{ color: "var(--text-1)" }}>{lastQuery}</span>&rdquo;
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[{ label: "Views", value: fmt(totalViews) }, { label: "Followers", value: totalFollowers > 0 ? fmt(totalFollowers) : "—" }].map((s) => (
              <div key={s.label} className="p-2.5 text-center" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
                <p className="text-sm font-800" style={{ color: "var(--text-1)" }}>{s.value}</p>
                <p className="text-[11px] font-600 mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {results.filter((r) => !r.skipped).map((r) => (
              <div key={r.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PLATFORM_COLORS[r.platform] }} />
                  <span className="text-xs font-600 capitalize" style={{ color: "var(--text-2)" }}>{r.platform}</span>
                </div>
                <span className="text-xs font-700" style={{ color: "var(--text-1)" }}>
                  {r.loading ? "…" : r.error && !r.videos.length ? "—" : fmt(r.totalViews)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dark mode toggle + collapse */}
      <div className={`shrink-0 flex items-center py-3 ${collapsed ? "flex-col gap-2 px-2" : "justify-between px-4"}`}
        style={{ borderTop: "1.5px solid var(--border)" }}>
        <button onClick={onToggleDark} title={isDark ? "Mode Terang" : "Mode Gelap"}
          className="flex items-center gap-2 py-2 text-[11px] font-700 transition-all"
          style={{ color: "var(--text-2)", paddingLeft: collapsed ? undefined : 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}>
          {isDark ? <SunIcon /> : <MoonIcon />}
          {!collapsed && <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen shrink-0 relative" style={{ width: collapsed ? 56 : 256 }}>
        {sidebarContent}
        <button onClick={onToggle} title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center transition-colors"
          style={{ width: 30, height: 30, right: -15, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "50%", boxShadow: "var(--shadow-sm)", color: "var(--text-3)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent-fg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${mobileSidebar ? "translate-x-0" : "-translate-x-full"}`} style={{ width: 280 }}>
        <div className="h-full flex flex-col w-full" style={{ background: "var(--card)", borderRight: "1.5px solid var(--border)" }}>
          {/* Mobile header */}
          <div className="shrink-0 px-3 py-4 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--border)" }}>
            <button onClick={() => { onReset(); onCloseMobile(); }} className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: "var(--accent)", borderRadius: "8px" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: "var(--accent-fg)" }}><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              </div>
              <div>
                <p className="text-sm font-800" style={{ color: "var(--text-1)" }}>SocialScope</p>
                <p className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>Analytics</p>
              </div>
            </button>
            <div className="flex items-center gap-1.5">
              <button onClick={onToggleDark} className="w-7 h-7 flex items-center justify-center" style={{ color: "var(--text-3)", borderRadius: "6px" }}>
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={onCloseMobile} className="w-7 h-7 flex items-center justify-center" style={{ color: "var(--text-3)", borderRadius: "6px" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="shrink-0 px-4 py-3 relative" style={{ borderBottom: "1.5px solid var(--border)" }} ref={searchRef}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="relative">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" value={input}
                  onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                  onFocus={(e) => { e.target.style.boxShadow = "var(--shadow-sm)"; setShowSuggestions(true); }}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="Cari kreator..." disabled={loading}
                  className="w-full pl-9 pr-3 py-2 text-sm font-500 placeholder:text-[var(--text-4)] focus:outline-none"
                  style={{ background: "var(--inner)", border: "1.5px solid var(--border)", borderRadius: "8px", color: "var(--text-1)", transition: "box-shadow 0.15s" }} />
              </div>
              <button type="submit" disabled={loading || !input.trim()}
                className="w-full py-2 text-sm font-700 disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "1.5px solid var(--border)", borderRadius: "8px" }}>
                {loading ? "Mencari..." : "Cari"}
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-4 right-4 z-50 overflow-hidden"
                style={{ top: "calc(100% - 8px)", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow)" }}>
                {suggestions.map((c) => (
                  <button key={c.username} type="button" onMouseDown={() => handleSelect(c.username)}
                    className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
                    style={{ borderBottom: "1px solid var(--divider)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--inner)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <span className="text-sm font-700 truncate" style={{ color: "var(--text-1)" }}>{c.name}</span>
                    <span className="text-[11px] font-600 shrink-0 ml-2" style={{ color: "var(--text-3)" }}>{c.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Mobile nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <p className="text-[11px] font-700 uppercase tracking-widest px-2 mb-2" style={{ color: "var(--text-4)" }}>Platform</p>
            <NavList close={onCloseMobile} />
            {history.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-700 uppercase tracking-widest px-2 mb-2" style={{ color: "var(--text-4)" }}>Riwayat</p>
                {history.slice(0, 6).map((q) => (
                  <button key={q} onClick={() => { onSearch(q); setInput(q); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-500 transition-colors"
                    style={{ borderRadius: "8px", color: "var(--text-2)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--inner)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = ""; }}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>
          {searched && results.filter((r) => !r.skipped && !r.loading).length > 0 && (
            <div className="shrink-0 px-4 py-4" style={{ borderTop: "1.5px solid var(--border)", background: "var(--inner)" }}>
              <div className="grid grid-cols-2 gap-2">
                {[{ label: "Views", value: fmt(totalViews) }, { label: "Followers", value: totalFollowers > 0 ? fmt(totalFollowers) : "—" }].map((s) => (
                  <div key={s.label} className="p-2.5 text-center" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
                    <p className="text-sm font-800" style={{ color: "var(--text-1)" }}>{s.value}</p>
                    <p className="text-[11px] font-600 mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
