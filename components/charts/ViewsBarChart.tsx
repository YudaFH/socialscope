"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { VideoItem } from "@/types";

interface Props {
  videos: VideoItem[];
  color: string;
}

function fmtShort(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

function truncate(s: string, max = 18) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullTitle: string; views: number; likes: number; comments: number }; value: number }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white shadow-lg p-3 text-xs font-display" style={{ border: "1px solid #E2E8F0", borderRadius: "4px", maxWidth: "200px" }}>
      <p className="font-700 text-[#0D1117] mb-1 leading-snug">{d.fullTitle}</p>
      <p className="font-800 text-lg" style={{ color: payload[0].value > 0 ? "#3B82F6" : "#94A3B8" }}>{fmtShort(d.views)} <span className="text-[10px] font-600 text-[#94A3B8]">views</span></p>
      <p className="text-[#22C55E] font-700">{fmtShort(d.likes)} likes</p>
      <p className="text-[#F59E0B] font-700">{fmtShort(d.comments)} comments</p>
    </div>
  );
};

export default function ViewsBarChart({ videos, color }: Props) {
  const data = videos.map((v, i) => ({
    name: truncate(v.title),
    fullTitle: v.title,
    views: v.views,
    likes: v.likes || 0,
    comments: v.comments || 0,
    index: i,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fontFamily: "var(--font-jakarta)", fontWeight: 700, fill: "#64748B" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtShort}
          tick={{ fontSize: 10, fontFamily: "var(--font-jakarta)", fontWeight: 700, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
        <Bar dataKey="views" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell
              key={entry.index}
              fill={entry.index === 0 ? color : `${color}80`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
