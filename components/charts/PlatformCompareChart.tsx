"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { PlatformData } from "@/types";

interface Props {
  results: PlatformData[];
}

function fmtShort(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

const COLORS = { youtube: "#EF4444", tiktok: "#06B6D4", instagram: "#EC4899" };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg p-3 text-xs font-display" style={{ border: "1px solid #E2E8F0", borderRadius: "4px" }}>
      <p className="font-800 text-[#0D1117] mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-700" style={{ color: p.color }}>{fmtShort(p.value)} {p.name}</p>
      ))}
    </div>
  );
};

export default function PlatformCompareChart({ results }: Props) {
  const data = [
    {
      metric: "Views",
      ...Object.fromEntries(results.map((r) => [r.platform, r.totalViews])),
    },
    {
      metric: "Likes",
      ...Object.fromEntries(results.map((r) => [r.platform, r.videos.reduce((s, v) => s + (v.likes || 0), 0)])),
    },
    {
      metric: "Comments",
      ...Object.fromEntries(results.map((r) => [r.platform, r.videos.reduce((s, v) => s + (v.comments || 0), 0)])),
    },
    {
      metric: "Followers",
      ...Object.fromEntries(results.map((r) => [r.platform, r.followers || 0])),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="metric"
          tick={{ fontSize: 10, fontFamily: "var(--font-jakarta)", fontWeight: 800, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtShort}
          tick={{ fontSize: 10, fontFamily: "var(--font-jakarta)", fontWeight: 700, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
        <Legend
          wrapperStyle={{ fontSize: "10px", fontFamily: "var(--font-jakarta)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
        />
        {results.map((r) => (
          <Bar key={r.platform} dataKey={r.platform} name={r.platform.charAt(0).toUpperCase() + r.platform.slice(1)} fill={COLORS[r.platform]} radius={[3, 3, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
