"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PlatformData } from "@/types";

interface Props { results: PlatformData[] }

function fmtShort(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

const COLORS: Record<string, string> = { youtube: "#EF4444", tiktok: "#06B6D4", instagram: "#EC4899" };
const LABELS: Record<string, string> = { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram" };

export default function FollowerCompareChart({ results }: Props) {
  const data = results
    .filter((r) => (r.followers || 0) > 0)
    .map((r) => ({ platform: LABELS[r.platform], followers: r.followers || 0, key: r.platform }));

  if (!data.length) return (
    <div className="flex items-center justify-center h-[120px]">
      <p className="text-xs font-600 text-[#94A3B8]">Follower data unavailable</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 50, left: 0, bottom: 4 }}>
        <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fontFamily: "var(--font-jakarta)", fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="platform" tick={{ fontSize: 11, fontFamily: "var(--font-jakarta)", fontWeight: 800, fill: "#334155" }} axisLine={false} tickLine={false} width={72} />
        <Tooltip
          cursor={{ fill: "#F8FAFC" }}
          formatter={(v) => [fmtShort(Number(v)) + " followers", ""]}
          contentStyle={{ fontSize: "11px", fontFamily: "var(--font-jakarta)", fontWeight: 700, borderRadius: "4px", border: "1px solid #e5e5e5" }}
        />
        <Bar dataKey="followers" radius={[0, 3, 3, 0]} maxBarSize={24}>
          {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
