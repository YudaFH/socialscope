"use client";

import { useState } from "react";
import { PlatformData } from "@/types";
import { ActiveTab } from "@/app/page";
import { VideoFilter, FILTER_OPTIONS, applyVideoFilter } from "@/lib/videoFilter";
import PlatformCard from "./PlatformCard";
import PlatformCompareChart from "./charts/PlatformCompareChart";
import FollowerCompareChart from "./charts/FollowerCompareChart";
import InsightPanel from "./InsightPanel";
import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  results: PlatformData[];
  query: string;
  onTabChange: (tab: ActiveTab) => void;
  onExportCSV: () => void;
  onReset: () => void;
  onRefresh: () => void;
  videoFilter: VideoFilter;
  onFilterChange: (f: VideoFilter) => void;
  onPlatformSearch: (platform: "youtube" | "tiktok" | "instagram", username: string) => void;
  platformSearching: string | null;
}

type SortKey = "platform" | "followers" | "views" | "likes" | "comments" | "eng" | "videos";
type SortDir = "asc" | "desc";

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtTime(ts?: number) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const PLATFORM_META: Record<string, { label: string; color: string; tab: ActiveTab }> = {
  youtube:   { label: "YouTube",   color: "#EF4444", tab: "youtube" },
  tiktok:    { label: "TikTok",    color: "var(--text-1)", tab: "tiktok" },
  instagram: { label: "Instagram", color: "#EC4899", tab: "instagram" },
};

// ─── Animated metric card ────────────────────────────────────────────────────
function MetricCard({ label, value, sub, dot }: { label: string; value: number | string; sub: string; dot: string }) {
  const numVal = typeof value === "number" ? value : 0;
  const animated = useCountUp(numVal);
  const display  = typeof value === "number" ? fmt(animated) : value;
  return (
    <div className="p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
        <p className="text-[10px] font-700 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
      <p className="text-2xl font-800 count-up" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>{display}</p>
      <p className="text-[10px] font-500 mt-0.5" style={{ color: "var(--text-4)" }}>{sub}</p>
    </div>
  );
}

// ─── Sort header cell ─────────────────────────────────────────────────────────
function SortTh({ label, col, sortKey, sortDir, onSort }: { label: string; col: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (c: SortKey) => void }) {
  const active = sortKey === col;
  return (
    <th className="text-left px-3 py-3 cursor-pointer select-none group" onClick={() => onSort(col)}
      style={{ background: "var(--inner)", borderBottom: "1.5px solid var(--border)" }}>
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-700 uppercase tracking-wider transition-colors" style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}>{label}</span>
        <svg viewBox="0 0 24 24" className="w-3 h-3 transition-opacity" style={{ color: "var(--text-3)", opacity: active ? 1 : 0.3 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {active && sortDir === "desc" ? <path d="m6 9 6 6 6-6"/> : <path d="m18 15-6-6-6 6"/>}
        </svg>
      </div>
    </th>
  );
}

export default function OverviewPanel({
  results, query, onTabChange, onExportCSV, onReset, onRefresh, videoFilter, onFilterChange,
  onPlatformSearch, platformSearching,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const activeResults   = results.filter((r) => !r.skipped && !r.loading);
  const filteredResults = results.map((r) => ({ ...r, videos: r.skipped || r.loading ? [] : applyVideoFilter(r.videos, videoFilter) }));

  const totalViews     = activeResults.reduce((s, r) => s + r.totalViews, 0);
  const totalLikes     = filteredResults.reduce((s, r) => s + r.videos.reduce((a, v) => a + (v.likes || 0), 0), 0);
  const totalComments  = filteredResults.reduce((s, r) => s + r.videos.reduce((a, v) => a + (v.comments || 0), 0), 0);
  const totalFollowers = activeResults.reduce((s, r) => s + (r.followers || 0), 0);
  const avgEngRate     = totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) : "0.0";
  const lastFetched    = activeResults.find((r) => r.fetchedAt)?.fetchedAt;
  const loadingCount   = results.filter((r) => r.loading).length;

  // Sort table
  const handleSort = (col: SortKey) => {
    if (sortKey === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortKey(col); setSortDir("desc"); }
  };

  const sortedResults = [...filteredResults].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    const av = a.videos.reduce((s, v) => s + v.views, 0);
    const bv = b.videos.reduce((s, v) => s + v.views, 0);
    const al = a.videos.reduce((s, v) => s + (v.likes || 0), 0);
    const bl = b.videos.reduce((s, v) => s + (v.likes || 0), 0);
    const ac = a.videos.reduce((s, v) => s + (v.comments || 0), 0);
    const bc = b.videos.reduce((s, v) => s + (v.comments || 0), 0);
    const ae = av > 0 ? ((al + ac) / av) * 100 : 0;
    const be = bv > 0 ? ((bl + bc) / bv) * 100 : 0;
    switch (sortKey) {
      case "platform":  return mul * a.platform.localeCompare(b.platform);
      case "followers": return mul * ((a.followers || 0) - (b.followers || 0));
      case "views":     return mul * (av - bv);
      case "likes":     return mul * (al - bl);
      case "comments":  return mul * (ac - bc);
      case "eng":       return mul * (ae - be);
      case "videos":    return mul * (a.videos.length - b.videos.length);
      default:          return 0;
    }
  });

  const METRICS = [
    { label: "Total Views",     value: totalViews,     sub: "gabungan semua platform",  dot: "#3B82F6" },
    { label: "Total Likes",     value: totalLikes,     sub: "gabungan",           dot: "#22C55E" },
    { label: "Total Comments",  value: totalComments,  sub: "gabungan",           dot: "#F59E0B" },
    { label: "Total Followers", value: totalFollowers, sub: "semua platform",     dot: "#A855F7" },
    { label: "Avg Engagement",  value: avgEngRate + "%", sub: "(likes+cmnt)/views", dot: "#EF4444" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs font-600 mb-2 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Beranda
          </button>
          <h1 className="text-2xl md:text-3xl font-800" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>Overview</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm font-500" style={{ color: "var(--text-2)" }}>
              Hasil pencarian <span className="font-700" style={{ color: "var(--text-1)" }}>&ldquo;{query}&rdquo;</span>
            </p>
            {lastFetched && <span className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>Diperbarui {fmtTime(lastFetched)}</span>}
            {loadingCount > 0 && (
              <span className="text-[11px] font-600 flex items-center gap-1" style={{ color: "#3B82F6" }}>
                <svg viewBox="0 0 24 24" className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Memuat {loadingCount} platform...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-xs font-700 transition-all"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)", color: "var(--text-1)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--accent-fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text-1)"; }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
          <button onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-700 transition-all"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)", color: "var(--text-1)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--accent-fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text-1)"; }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
          <span className="text-xs font-700 px-3 py-2" style={{ background: "var(--accent)", color: "var(--accent-fg)", borderRadius: "8px", border: "1.5px solid var(--border)" }}>
            {activeResults.length}/3 Platform
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[11px] font-700 uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Filter Video</p>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onFilterChange(opt.value)}
              className="px-3 py-1.5 text-xs font-700 transition-all"
              style={{ borderRadius: "8px", border: "1.5px solid var(--border)", background: videoFilter === opt.value ? "var(--accent)" : "var(--card)", color: videoFilter === opt.value ? "var(--accent-fg)" : "var(--text-1)", boxShadow: videoFilter === opt.value ? "var(--shadow-sm)" : "var(--shadow-sm)" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Metrik Gabungan</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {METRICS.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} sub={m.sub} dot={m.dot} />
          ))}
        </div>
      </div>

      {/* Charts */}
      {activeResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <p className="text-[11px] font-700 uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>Perbandingan Platform</p>
            <PlatformCompareChart results={filteredResults.filter((r) => !r.skipped && !r.loading)} />
          </div>
          <div className="p-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <p className="text-[11px] font-700 uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>Follower / Subscriber</p>
            <FollowerCompareChart results={activeResults} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {results.map((r) => (
                <div key={r.platform} className="text-center p-2" style={{ background: "var(--inner)", borderRadius: "8px", border: "1px solid var(--border-lighter)" }}>
                  <p className="text-sm font-800" style={{ color: "var(--text-1)" }}>{r.loading ? "…" : r.skipped ? "—" : r.followers ? fmt(r.followers) : "—"}</p>
                  <p className="text-[9px] font-600 mt-0.5 capitalize" style={{ color: "var(--text-3)" }}>{r.platform}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Platform cards */}
      <div>
        <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Per Platform</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredResults.map((data) => (
            <PlatformCard key={data.platform} data={data}
              onClick={() => onTabChange(PLATFORM_META[data.platform].tab)}
              onSearchPlatform={(u) => onPlatformSearch(data.platform as "youtube" | "tiktok" | "instagram", u)}
              searching={platformSearching === data.platform}
            />
          ))}
        </div>
      </div>

      {/* Insights + sortable table */}
      {activeResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Insights</p>
            <InsightPanel results={activeResults} />
          </div>
          <div className="lg:col-span-2">
            <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Tabel Perbandingan</p>
            <div className="overflow-hidden" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <SortTh label="Platform"  col="platform"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Followers" col="followers" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Views"     col="views"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Likes"     col="likes"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Comments"  col="comments"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Eng."      col="eng"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Video"     col="videos"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r) => {
                    const meta     = PLATFORM_META[r.platform];
                    const fViews   = r.videos.reduce((s, v) => s + v.views, 0);
                    const fLikes   = r.videos.reduce((s, v) => s + (v.likes || 0), 0);
                    const fComments= r.videos.reduce((s, v) => s + (v.comments || 0), 0);
                    const engRate  = fViews > 0 ? (((fLikes + fComments) / fViews) * 100).toFixed(1) : null;
                    return (
                      <tr key={r.platform} className="cursor-pointer transition-colors"
                        style={{ borderBottom: `1px solid var(--divider)` }}
                        onClick={() => !r.loading && !r.skipped && onTabChange(meta.tab)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--inner)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                            <span className="text-xs font-700" style={{ color: "var(--text-1)" }}>{meta.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-700" style={{ color: "#A855F7" }}>
                          {r.loading ? "…" : r.skipped ? "—" : r.followers ? fmt(r.followers) : "—"}
                        </td>
                        <td className="px-3 py-3 text-sm font-800" style={{ color: "var(--text-1)" }}>
                          {r.loading ? "…" : r.skipped ? "—" : fmt(fViews)}
                        </td>
                        <td className="px-3 py-3 text-xs font-700" style={{ color: "#22C55E" }}>
                          {r.loading ? "…" : r.skipped ? "—" : fmt(fLikes)}
                        </td>
                        <td className="px-3 py-3 text-xs font-700" style={{ color: "#F59E0B" }}>
                          {r.loading ? "…" : r.skipped ? "—" : fmt(fComments)}
                        </td>
                        <td className="px-3 py-3">
                          {r.loading ? <span style={{ color: "var(--text-4)" }}>…</span>
                           : r.skipped ? <span style={{ color: "var(--text-4)" }}>—</span>
                           : engRate ? (
                            <span className="text-xs font-700 px-2 py-0.5" style={{ borderRadius: "5px", background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>{engRate}%</span>
                          ) : <span style={{ color: "var(--text-4)" }}>—</span>}
                        </td>
                        <td className="px-3 py-3 text-xs font-600" style={{ color: "var(--text-2)" }}>
                          {r.loading ? "…" : r.skipped ? "—" : r.videos.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {activeResults.some((r) => r.totalPosts) && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {results.filter((r) => !r.skipped).map((r) => (
                  <div key={r.platform} className="p-3 flex items-center justify-between"
                    style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow-sm)" }}>
                    <div>
                      <p className="text-[9px] font-700 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Total Post</p>
                      <p className="text-[10px] font-600 capitalize" style={{ color: PLATFORM_META[r.platform].color }}>{r.platform}</p>
                    </div>
                    <p className="text-lg font-800" style={{ color: "var(--text-1)" }}>
                      {r.loading ? "…" : r.totalPosts ? fmt(r.totalPosts) : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
