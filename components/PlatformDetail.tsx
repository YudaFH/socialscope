"use client";

import { useState } from "react";
import { PlatformData } from "@/types";
import { VideoFilter, FILTER_OPTIONS, applyVideoFilter } from "@/lib/videoFilter";
import { useCountUp } from "@/hooks/useCountUp";
import ViewsBarChart from "./charts/ViewsBarChart";
import EngagementDonut from "./charts/EngagementDonut";

interface Props {
  data: PlatformData;
  onBack: () => void;
  onRefresh: () => void;
  videoFilter: VideoFilter;
  onFilterChange: (f: VideoFilter) => void;
}

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function proxied(url: string) {
  if (!url) return "";
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

const PLATFORM_CONFIG = {
  youtube:   { label: "YouTube",   color: "#EF4444", icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  tiktok:    { label: "TikTok",    color: "#111111", icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
  instagram: { label: "Instagram", color: "#EC4899", icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
} as const;

type SortKey = "views" | "likes" | "comments" | "engagement";

// ─── Animated metric ──────────────────────────────────────────────────────────
function Metric({ label, value, dot }: { label: string; value: number; dot: string }) {
  const animated = useCountUp(value);
  return (
    <div className="p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
        <p className="text-[10px] font-700 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
      <p className="text-2xl font-800 count-up" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>{fmt(animated)}</p>
    </div>
  );
}

export default function PlatformDetail({ data, onBack, onRefresh, videoFilter, onFilterChange }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("views");
  const cfg = PLATFORM_CONFIG[data.platform];
  const chartColor = cfg.color === "#111111" ? "var(--text-1)" : cfg.color;

  const filteredVideos = applyVideoFilter(data.videos, videoFilter);
  const totalLikes     = filteredVideos.reduce((s, v) => s + (v.likes    || 0), 0);
  const totalComments  = filteredVideos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalViews     = filteredVideos.reduce((s, v) => s + v.views, 0);
  const engRate        = totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) : "0.0";
  const avgViews       = filteredVideos.length > 0 ? Math.round(totalViews / filteredVideos.length) : 0;
  const maxViews       = Math.max(...filteredVideos.map((v) => v.views), 1);

  const displayViews = data.platform === "youtube" && data.totalChannelViews ? data.totalChannelViews : totalViews;
  const viewsLabel   = data.platform === "youtube" && data.totalChannelViews ? "Lifetime Views" : `Total Views (${filteredVideos.length} video)`;

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "views")      return b.views - a.views;
    if (sortBy === "likes")      return (b.likes || 0) - (a.likes || 0);
    if (sortBy === "comments")   return (b.comments || 0) - (a.comments || 0);
    const engA = a.views > 0 ? ((a.likes || 0) + (a.comments || 0)) / a.views : 0;
    const engB = b.views > 0 ? ((b.likes || 0) + (b.comments || 0)) / b.views : 0;
    return engB - engA;
  });

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-600 mb-2 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Overview
          </button>
          <div className="flex items-center gap-2.5">
            <span style={{ color: data.platform === "tiktok" ? "var(--text-1)" : cfg.color }}>{cfg.icon}</span>
            <h1 className="text-2xl md:text-3xl font-800" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>{cfg.label}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {data.error && !data.videos.length && (
            <span className="text-xs font-600 px-3 py-1.5" style={{ borderRadius: "8px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>{data.error}</span>
          )}
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
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[11px] font-700 uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Filter Video</p>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onFilterChange(opt.value)}
              className="px-3 py-1.5 text-xs font-700 transition-all"
              style={{ borderRadius: "8px", border: "1.5px solid var(--border)", background: videoFilter === opt.value ? "var(--accent)" : "var(--card)", color: videoFilter === opt.value ? "var(--accent-fg)" : "var(--text-1)", boxShadow: "var(--shadow-sm)" }}>
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>{filteredVideos.length} video</span>
      </div>

      {/* Account */}
      {(data.accountName || data.username) && (
        <div className="p-5 flex items-center gap-4 flex-wrap"
          style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
          {data.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proxied(data.profilePicture)} alt={data.accountName} loading="lazy"
              className="w-14 h-14 object-cover shrink-0" style={{ borderRadius: "50%", border: "2px solid var(--border)" }} />
          ) : (
            <div className="w-14 h-14 flex items-center justify-center font-800 text-xl shrink-0"
              style={{ background: "var(--inner)", color: "var(--text-1)", borderRadius: "50%", border: "2px solid var(--border)" }}>
              {(data.accountName || data.username)[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-800" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>{data.accountName || data.username}</p>
              {data.isVerified && <span className="text-[10px] font-700 px-2 py-0.5" style={{ color: "var(--accent-fg)", background: "var(--accent)", borderRadius: "5px" }}>Verified</span>}
              {data.country && <span className="text-[11px] font-600 px-2 py-0.5" style={{ color: "var(--text-2)", background: "var(--inner)", borderRadius: "5px", border: "1px solid var(--border-light)" }}>{data.country}</span>}
            </div>
            <p className="text-sm font-500" style={{ color: "var(--text-3)" }}>@{data.username}</p>
            {data.bio && <p className="text-xs font-500 mt-1.5 line-clamp-2 max-w-lg leading-relaxed" style={{ color: "var(--text-2)" }}>{data.bio}</p>}
            {data.category && <p className="text-[10px] font-700 uppercase tracking-wide mt-1" style={{ color: "var(--text-3)" }}>{data.category}</p>}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div>
        <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Metrik Performa</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <Metric label={viewsLabel}      value={displayViews}  dot={cfg.color === "#111111" ? "var(--text-1)" : cfg.color} />
          <Metric label="Total Likes"     value={totalLikes}    dot="#22C55E" />
          <Metric label="Total Comments"  value={totalComments} dot="#F59E0B" />
          <Metric label="Engagement"      value={parseFloat(engRate)} dot="#A855F7" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Avg Views/Video", value: fmt(avgViews) },
            { label: "Video Dianalisis", value: String(filteredVideos.length) },
            { label: "Followers",        value: data.followers ? fmt(data.followers) : "N/A" },
            { label: "Total Post",       value: data.totalPosts ? fmt(data.totalPosts) : "N/A" },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between px-4 py-3"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow-sm)" }}>
              <span className="text-[10px] font-700 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{m.label}</span>
              <span className="text-lg font-800" style={{ color: "var(--text-1)" }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      {filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <p className="text-[11px] font-700 uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>Views Per Video</p>
            <ViewsBarChart videos={filteredVideos} color={cfg.color === "#111111" ? "#555" : cfg.color} />
          </div>
          <div className="p-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <p className="text-[11px] font-700 uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>Engagement Split</p>
            <EngagementDonut likes={totalLikes} comments={totalComments} views={totalViews} color={cfg.color === "#111111" ? "#555" : cfg.color} />
            <div className="mt-2 space-y-1.5">
              {[
                { label: "Likes",      value: fmt(totalLikes),     color: cfg.color === "#111111" ? "#555" : cfg.color },
                { label: "Comments",   value: fmt(totalComments),  color: "#F59E0B" },
                { label: "Views only", value: fmt(Math.max(0, totalViews - totalLikes - totalComments)), color: "var(--text-4)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[10px] font-600" style={{ color: "var(--text-2)" }}>{item.label}</span>
                  </div>
                  <span className="text-[11px] font-800" style={{ color: "var(--text-1)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-700 uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Konten Terbaik</p>
          <div className="flex gap-1">
            {(["views", "likes", "comments", "engagement"] as SortKey[]).map((key) => (
              <button key={key} onClick={() => setSortBy(key)}
                className="text-[10px] font-700 px-2.5 py-1.5 transition-all capitalize"
                style={{ borderRadius: "6px", border: "1.5px solid var(--border)", background: sortBy === key ? "var(--accent)" : "var(--card)", color: sortBy === key ? "var(--accent-fg)" : "var(--text-2)", boxShadow: sortBy === key ? "none" : "1px 1px 0px var(--border)" }}>
                {key}
              </button>
            ))}
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-14 text-center" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <p className="text-sm font-500" style={{ color: "var(--text-3)" }}>Tidak ada konten ditemukan</p>
          </div>
        ) : (
          <div className="overflow-hidden" style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            {sortedVideos.map((video, index) => {
              const relativeWidth = Math.round((video.views / maxViews) * 100);
              const vEngRate = video.views > 0 ? ((((video.likes || 0) + (video.comments || 0)) / video.views) * 100).toFixed(2) : "0";
              return (
                <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
                  style={{ borderBottom: `1px solid var(--divider)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--inner)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                  <span className="text-sm font-800 w-5 text-center shrink-0" style={{ color: "var(--text-4)" }}>{index + 1}</span>
                  {video.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proxied(video.thumbnail)} alt="" loading="lazy" className="w-20 h-12 object-cover shrink-0" style={{ borderRadius: "6px", border: "1px solid var(--border-lighter)" }} />
                  ) : (
                    <div className="w-20 h-12 shrink-0" style={{ background: "var(--inner)", borderRadius: "6px", border: "1px solid var(--border-lighter)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 line-clamp-1 transition-colors" style={{ color: "var(--text-1)" }}>{video.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "var(--inner)", borderRadius: "2px" }}>
                        <div className="h-full" style={{ width: `${relativeWidth}%`, background: "var(--text-1)", borderRadius: "2px" }} />
                      </div>
                      <span className="text-[10px] font-600 shrink-0" style={{ color: "var(--text-4)" }}>{relativeWidth}%</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-800" style={{ color: "var(--text-1)" }}>{fmt(video.views)}</p>
                    <p className="text-[9px] font-600 uppercase" style={{ color: "var(--text-4)" }}>views</p>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-base font-800 text-[#22C55E]">{fmt(video.likes || 0)}</p>
                    <p className="text-[9px] font-600 uppercase" style={{ color: "var(--text-4)" }}>likes</p>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-base font-800 text-[#F59E0B]">{fmt(video.comments || 0)}</p>
                    <p className="text-[9px] font-600 uppercase" style={{ color: "var(--text-4)" }}>comments</p>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-base font-800 text-[#A855F7]">{vEngRate}%</p>
                    <p className="text-[9px] font-600 uppercase" style={{ color: "var(--text-4)" }}>eng. rate</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
