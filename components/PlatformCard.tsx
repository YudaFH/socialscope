"use client";

import { useState } from "react";
import { PlatformData } from "@/types";

interface Props {
  data: PlatformData;
  onClick?: () => void;
  onSearchPlatform?: (username: string) => void;
  searching?: boolean;
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
  youtube:   { label: "YouTube",   color: "#EF4444", icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  tiktok:    { label: "TikTok",    color: "var(--text-1)", icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
  instagram: { label: "Instagram", color: "#EC4899", icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
} as const;

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}
      style={{ background: "var(--inner)", borderRadius: "6px" }} />
  );
}

export default function PlatformCard({ data, onClick, onSearchPlatform, searching }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");

  const cfg = PLATFORM_CONFIG[data.platform];
  const tiktokColor = cfg.color;

  const totalLikes    = data.videos.reduce((s, v) => s + (v.likes    || 0), 0);
  const totalComments = data.videos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalViews    = data.videos.reduce((s, v) => s + v.views, 0);
  const engRate       = totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) : null;
  const hasData       = !data.error && !data.loading && !data.skipped;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (input.trim() && onSearchPlatform) { onSearchPlatform(input.trim()); setShowSearch(false); setInput(""); }
  };

  return (
    <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--border)" }}>
        <div className="flex items-center gap-2" style={{ color: data.platform === "tiktok" ? "var(--text-1)" : cfg.color }}>
          {cfg.icon}
          <span className="text-sm font-700" style={{ color: "var(--text-1)" }}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {onSearchPlatform && !data.skipped && (
            <button onClick={(e) => { e.stopPropagation(); setShowSearch((v) => !v); setInput(""); }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-700 transition-colors"
              style={{ color: "var(--text-3)", border: "1px solid var(--border-light)", borderRadius: "6px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--inner)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = ""; }}>
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Ganti
            </button>
          )}
          {!data.skipped && !data.loading && (
            <div onClick={onClick} className="cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Inline search */}
      {showSearch && (
        <div className="px-4 py-3" style={{ borderBottom: "1.5px solid var(--border)", background: "var(--surface-alt)" }}>
          <p className="text-[10px] font-700 uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Ganti username {cfg.label}</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={`Username ${cfg.label}...`} autoFocus onClick={(e) => e.stopPropagation()}
              className="flex-1 px-3 py-1.5 text-sm font-500 focus:outline-none"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "7px", color: "var(--text-1)" }} />
            <button type="submit" disabled={!input.trim() || searching} onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-xs font-700 disabled:opacity-40 transition-all"
              style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "1.5px solid var(--border)", borderRadius: "7px", boxShadow: "var(--shadow-sm)" }}>
              {searching ? "..." : "Cari"}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowSearch(false); }}
              className="px-3 py-1.5 text-xs font-700 transition-all"
              style={{ color: "var(--text-2)", border: "1.5px solid var(--border-light)", borderRadius: "7px" }}>
              Batal
            </button>
          </form>
        </div>
      )}

      <div className="p-4" onClick={!data.loading && !data.skipped ? onClick : undefined}
        style={{ cursor: onClick && !data.loading && !data.skipped ? "pointer" : "default" }}>

        {/* Loading skeleton */}
        {data.loading && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 !rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14" /><Skeleton className="h-14" />
            </div>
            <Skeleton className="h-2.5 w-full" />
            <div className="space-y-2.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="w-4 h-3" />
                  <Skeleton className="w-11 h-7 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-full" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skipped state */}
        {data.skipped && (
          <div className="py-10 text-center">
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full"
              style={{ background: "var(--inner)", border: "1.5px solid var(--border-light)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: "var(--text-4)" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
            <p className="text-xs font-700 mb-1" style={{ color: "var(--text-3)" }}>Platform tidak diisi</p>
            <p className="text-[11px]" style={{ color: "var(--text-4)" }}>Input {cfg.label} dikosongkan</p>
            {onSearchPlatform && (
              <button onClick={(e) => { e.stopPropagation(); setShowSearch(true); }}
                className="mt-3 text-xs font-700 underline underline-offset-2 transition-colors"
                style={{ color: "var(--text-2)" }}>
                Cari sekarang →
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {!data.loading && !data.skipped && !hasData && (
          <div className="py-8 text-center">
            <p className="text-xs font-500" style={{ color: "var(--text-4)" }}>{data.error}</p>
            {onSearchPlatform && (
              <button onClick={(e) => { e.stopPropagation(); setShowSearch(true); }}
                className="mt-3 text-xs font-700 underline underline-offset-2"
                style={{ color: "var(--text-2)" }}>
                Cari username lain →
              </button>
            )}
          </div>
        )}

        {/* Data */}
        {hasData && (
          <>
            {/* Account */}
            <div className="flex items-center gap-3 mb-4">
              {data.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proxied(data.profilePicture)} alt={data.accountName} className="w-10 h-10 object-cover shrink-0"
                  style={{ borderRadius: "50%", border: "1.5px solid var(--border)" }} />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center font-800 text-sm shrink-0"
                  style={{ background: "var(--inner)", color: "var(--text-1)", borderRadius: "50%", border: "1.5px solid var(--border)" }}>
                  {(data.accountName || data.username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-700 truncate" style={{ color: "var(--text-1)" }}>{data.accountName || data.username}</p>
                  {data.isVerified && <span className="text-[10px] font-700 px-1.5 py-0.5" style={{ color: "var(--accent-fg)", background: "var(--accent)", borderRadius: "4px" }}>✓</span>}
                </div>
                <p className="text-[11px] font-500" style={{ color: "var(--text-3)" }}>@{data.username}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-3 text-center" style={{ background: "var(--inner)", borderRadius: "8px", border: "1px solid var(--border-lighter)" }}>
                <p className="text-xl font-800" style={{ color: "var(--text-1)" }}>{fmt(data.totalViews)}</p>
                <p className="text-[10px] font-600 mt-0.5" style={{ color: "var(--text-3)" }}>
                  {data.platform === "youtube" && data.totalChannelViews ? "Lifetime Views" : `Views (${data.videos.length} post)`}
                </p>
              </div>
              <div className="p-3 text-center" style={{ background: "var(--inner)", borderRadius: "8px", border: "1px solid var(--border-lighter)" }}>
                <p className="text-xl font-800" style={{ color: "var(--text-1)" }}>{fmt(totalLikes)}</p>
                <p className="text-[10px] font-600 mt-0.5" style={{ color: "var(--text-3)" }}>Likes</p>
              </div>
            </div>

            {data.followers && (
              <div className="flex items-center justify-between mb-3 px-0.5">
                <span className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>Followers</span>
                <span className="text-[11px] font-800" style={{ color: "var(--text-1)" }}>{fmt(data.followers)}</span>
              </div>
            )}

            {engRate && (
              <div className="flex items-center justify-between mb-4 px-0.5">
                <span className="text-[11px] font-600" style={{ color: "var(--text-3)" }}>Engagement rate</span>
                <span className="text-xs font-700 px-2 py-0.5" style={{ borderRadius: "5px", background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>{engRate}%</span>
              </div>
            )}

            {/* Top videos */}
            <div className="space-y-2.5">
              {data.videos.slice(0, 3).map((v, i) => (
                <div key={v.id || i} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-800 w-4 text-center shrink-0" style={{ color: "var(--text-4)" }}>{i + 1}</span>
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proxied(v.thumbnail)} alt="" className="w-11 h-7 object-cover shrink-0"
                      style={{ borderRadius: "4px", border: "1px solid var(--border-lighter)" }} />
                  ) : (
                    <div className="w-11 h-7 shrink-0" style={{ background: "var(--inner)", borderRadius: "4px", border: "1px solid var(--border-lighter)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-500 truncate" style={{ color: "var(--text-2)" }}>{v.title}</p>
                    <p className="text-[10px] font-700" style={{ color: "var(--text-1)" }}>{fmt(v.views)} views</p>
                  </div>
                </div>
              ))}
            </div>

            {data.videos.length > 0 && (
              <button className="w-full mt-4 py-2 text-[11px] font-700 transition-all"
                style={{ border: "1.5px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-sm)", color: "var(--text-1)", background: "var(--card)" }}
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--accent-fg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text-1)"; }}>
                Lihat semua {data.videos.length} video →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
