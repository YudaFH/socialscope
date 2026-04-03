"use client";

import { useState } from "react";
import { PlatformData } from "@/types";

interface Props { results: PlatformData[] }

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", IN: "India", JP: "Japan",
  KR: "South Korea", BR: "Brazil", ID: "Indonesia", DE: "Germany",
  FR: "France", AU: "Australia", CA: "Canada", MX: "Mexico",
  TH: "Thailand", PH: "Philippines", VN: "Vietnam", SG: "Singapore",
  MY: "Malaysia", PK: "Pakistan", NG: "Nigeria", ZA: "South Africa",
  SA: "Saudi Arabia", AE: "UAE", TR: "Turkey", IT: "Italy", ES: "Spain",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", IN: "🇮🇳", JP: "🇯🇵", KR: "🇰🇷", BR: "🇧🇷",
  ID: "🇮🇩", DE: "🇩🇪", FR: "🇫🇷", AU: "🇦🇺", CA: "🇨🇦", MX: "🇲🇽",
  TH: "🇹🇭", PH: "🇵🇭", VN: "🇻🇳", SG: "🇸🇬", MY: "🇲🇾", PK: "🇵🇰",
  NG: "🇳🇬", ZA: "🇿🇦", SA: "🇸🇦", AE: "🇦🇪", TR: "🇹🇷", IT: "🇮🇹", ES: "🇪🇸",
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#EF4444", tiktok: "var(--text-1)", instagram: "#EC4899",
};

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function detectLanguage(titles: string[]): string {
  const text = titles.join(" ");
  if (/[\u0600-\u06FF]/.test(text)) return "Arabic";
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) return "Japanese/Chinese";
  if (/[\uAC00-\uD7AF]/.test(text)) return "Korean";
  if (/[\u0E00-\u0E7F]/.test(text)) return "Thai";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  if (/[\u0400-\u04FF]/.test(text)) return "Russian";
  return "English";
}

function extractTopKeywords(titles: string[]): string[] {
  const stopwords = new Set(["the","a","an","of","to","in","on","for","with","my","this","is","and","or","but","you","your","i","we","it","he","she","they","that","are","was","be","as","by","at","dari","yang","di","ke","dengan","dan","atau","ini","itu"]);
  const freq: Record<string, number> = {};
  titles.forEach((t) => {
    t.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).forEach((w) => {
      if (w.length > 3 && !stopwords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

type Tab = "konten" | "geo" | "demografi" | "bio";

const TABS: { id: Tab; label: string }[] = [
  { id: "konten",    label: "Konten" },
  { id: "geo",       label: "Lokasi" },
  { id: "demografi", label: "Usia" },
  { id: "bio",       label: "Bio" },
];

const INNER: React.CSSProperties = {
  background: "var(--inner)",
  borderRadius: "8px",
  border: "1px solid var(--border-lighter)",
};

const demographics = [
  { label: "13–17", pct: 8 }, { label: "18–24", pct: 31 }, { label: "25–34", pct: 29 },
  { label: "35–44", pct: 18 }, { label: "45–54", pct: 9 }, { label: "55+", pct: 5 },
];

export default function InsightPanel({ results }: Props) {
  const [tab, setTab] = useState<Tab>("konten");

  const allTitles = results.flatMap((r) => r.videos.map((v) => v.title));
  const language = detectLanguage(allTitles);
  const keywords = extractTopKeywords(allTitles.filter((t) => /^[a-zA-Z]/.test(t)));
  const countries = results.filter((r) => r.country).map((r) => ({ platform: r.platform, code: r.country! }));
  const totalFollowers = results.reduce((s, r) => s + (r.followers || 0), 0);

  const engRates = results
    .filter((r) => r.totalViews > 0)
    .map((r) => {
      const likes = r.videos.reduce((s, v) => s + (v.likes || 0), 0);
      const comments = r.videos.reduce((s, v) => s + (v.comments || 0), 0);
      return { platform: r.platform, rate: ((likes + comments) / r.totalViews) * 100 };
    })
    .sort((a, b) => b.rate - a.rate);
  const bestEngPlatform = engRates[0];

  const efficiencies = results
    .map((r) => {
      if (!r.followers || r.followers === 0) return null;
      return { platform: r.platform, score: parseFloat(((r.totalViews / r.followers) * 100).toFixed(1)) };
    })
    .filter(Boolean) as { platform: string; score: number }[];

  const maxEffScore = Math.max(...efficiencies.map((e) => e.score), 1);
  const hasBio = results.some((r) => r.bio);

  return (
    <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <p className="text-[11px] font-700 uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Insights</p>
        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            const disabled = t.id === "bio" && !hasBio;
            return (
              <button
                key={t.id}
                onClick={() => !disabled && setTab(t.id)}
                disabled={disabled}
                className="px-2.5 py-1.5 text-[11px] font-700 transition-all"
                style={{
                  borderRadius: "6px 6px 0 0",
                  border: "1.5px solid var(--border)",
                  borderBottom: isActive ? "1.5px solid var(--card)" : "1.5px solid var(--border)",
                  background: isActive ? "var(--card)" : "var(--inner)",
                  color: disabled ? "var(--text-4)" : isActive ? "var(--text-1)" : "var(--text-2)",
                  marginBottom: isActive ? "-1.5px" : 0,
                  position: "relative",
                  zIndex: isActive ? 1 : 0,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab border line */}
      <div style={{ borderTop: "1.5px solid var(--border)", marginTop: 0 }} />

      {/* Content */}
      <div className="p-4">

        {/* ── Konten ── */}
        {tab === "konten" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5" style={INNER}>
                <p className="text-[10px] font-700 uppercase tracking-wider mb-0.5" style={{ color: "var(--text-3)" }}>Bahasa</p>
                <p className="text-sm font-800" style={{ color: "var(--text-1)" }}>{language}</p>
                <p className="text-[10px]" style={{ color: "var(--text-4)" }}>dari judul video</p>
              </div>
              {bestEngPlatform && (
                <div className="p-2.5" style={INNER}>
                  <p className="text-[10px] font-700 uppercase tracking-wider mb-0.5" style={{ color: "var(--text-3)" }}>Eng. Terbaik</p>
                  <p className="text-sm font-800 capitalize" style={{ color: "var(--text-1)" }}>{bestEngPlatform.platform}</p>
                  <p className="text-[10px] font-700" style={{ color: "var(--text-3)" }}>{bestEngPlatform.rate.toFixed(2)}%</p>
                </div>
              )}
            </div>

            {efficiencies.length > 0 && (
              <div>
                <p className="text-[10px] font-700 uppercase tracking-wider mb-1.5" style={{ color: "var(--text-3)" }}>Views / Follower</p>
                {efficiencies.sort((a, b) => b.score - a.score).map((e) => (
                  <div key={e.platform} className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-700 uppercase w-14 shrink-0" style={{ color: "var(--text-2)" }}>{e.platform}</span>
                    <div className="flex-1 h-1.5 overflow-hidden" style={{ borderRadius: "2px", background: "var(--divider)" }}>
                      <div className="h-full" style={{ width: `${(e.score / maxEffScore) * 100}%`, background: "var(--accent)", borderRadius: "2px" }} />
                    </div>
                    <span className="text-[10px] font-800 w-10 text-right shrink-0" style={{ color: "var(--text-1)" }}>{e.score.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}

            {keywords.length > 0 && (
              <div>
                <p className="text-[10px] font-700 uppercase tracking-wider mb-1.5" style={{ color: "var(--text-3)" }}>Kata Kunci Populer</p>
                <div className="flex flex-wrap gap-1">
                  {keywords.map((kw) => (
                    <span key={kw} className="text-[10px] font-700 px-2 py-0.5" style={{ color: "var(--text-1)", background: "var(--inner)", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px]" style={{ color: "var(--text-4)" }}>Data nyata dari video yang dianalisis</p>
          </div>
        )}

        {/* ── Lokasi ── */}
        {tab === "geo" && (
          <div className="space-y-2">
            {countries.length > 0 ? (
              <>
                {countries.map(({ platform, code }) => (
                  <div key={platform} className="flex items-center gap-3 p-2.5" style={INNER}>
                    <span className="text-lg shrink-0">{COUNTRY_FLAGS[code] || "🌍"}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-800" style={{ color: "var(--text-1)" }}>{COUNTRY_NAMES[code] || code}</p>
                      <p className="text-[10px] font-600 capitalize" style={{ color: "var(--text-3)" }}>{platform} — negara terdaftar</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] pt-1" style={{ color: "var(--text-4)" }}>
                  Negara dari profil publik platform. Data audiens per-wilayah memerlukan akses kreator langsung.
                </p>
              </>
            ) : (
              <div className="p-6 text-center" style={INNER}>
                <p className="text-xs font-700" style={{ color: "var(--text-3)" }}>Negara tidak diset di profil manapun</p>
              </div>
            )}
          </div>
        )}

        {/* ── Demografi ── */}
        {tab === "demografi" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-700 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Distribusi Usia</p>
              <span className="text-[9px] font-700 uppercase px-1.5 py-0.5 text-[#F59E0B] bg-[#FFF7ED]" style={{ borderRadius: "4px", border: "1px solid #FED7AA" }}>Estimasi Global</span>
            </div>
            {demographics.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[11px] font-800 w-9 shrink-0" style={{ color: "var(--text-1)" }}>{d.label}</span>
                <div className="flex-1 h-2 overflow-hidden" style={{ borderRadius: "2px", background: "var(--divider)" }}>
                  <div className="h-full" style={{ width: `${(d.pct / 31) * 100}%`, background: d.pct === 31 ? "var(--accent)" : "var(--border-light)", borderRadius: "2px" }} />
                </div>
                <span className="text-[11px] font-800 w-7 text-right shrink-0" style={{ color: d.pct === 31 ? "var(--text-1)" : "var(--text-4)" }}>{d.pct}%</span>
              </div>
            ))}
            <p className="text-[10px]" style={{ color: "var(--text-4)" }}>Rata-rata global (DataReportal 2024). Bukan data spesifik akun ini.</p>

            {totalFollowers > 0 && (
              <div className="pt-2" style={{ borderTop: "1px solid var(--divider)" }}>
                <p className="text-[10px] font-700 uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Estimasi Jangkauan</p>
                {[
                  { label: "Total Followers", value: fmt(totalFollowers) },
                  { label: "Avg Reach/Post (12%)", value: fmt(Math.round(totalFollowers * 0.12)) },
                  { label: "Potensi Impresi", value: fmt(Math.round(totalFollowers * 1.8)) },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--divider)" }}>
                    <span className="text-[10px] font-600" style={{ color: "var(--text-2)" }}>{m.label}</span>
                    <span className="text-sm font-800" style={{ color: "var(--text-1)" }}>{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bio ── */}
        {tab === "bio" && (
          <div className="space-y-2">
            {results.filter((r) => r.bio).map((r) => (
              <div key={r.platform} className="p-3" style={{ ...INNER, borderLeft: `3px solid ${PLATFORM_COLORS[r.platform]}` }}>
                <p className="text-[10px] font-800 uppercase capitalize mb-1" style={{ color: "var(--text-3)" }}>{r.platform}</p>
                <p className="text-xs font-500 leading-relaxed" style={{ color: "var(--text-1)" }}>{r.bio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
