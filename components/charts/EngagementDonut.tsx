"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  likes: number;
  comments: number;
  views: number;
  color: string;
}

function fmtShort(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percent: number } }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg px-3 py-2 text-xs font-display" style={{ border: "1px solid #E2E8F0", borderRadius: "4px" }}>
      <p className="font-800 text-[#0D1117]">{payload[0].name}</p>
      <p className="font-700 text-[#64748B]">{fmtShort(payload[0].value)} ({(payload[0].payload.percent * 100).toFixed(1)}%)</p>
    </div>
  );
};

export default function EngagementDonut({ likes, comments, views, color }: Props) {
  const nonEngaged = Math.max(0, views - likes - comments);
  const data = [
    { name: "Likes", value: likes },
    { name: "Comments", value: comments },
    { name: "Views only", value: nonEngaged },
  ].filter((d) => d.value > 0);

  if (!data.length || views === 0) return (
    <div className="flex items-center justify-center h-[160px]">
      <p className="text-xs font-600 text-[#94A3B8]">No engagement data</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={2}>
          <Cell fill={color} />
          <Cell fill="#F59E0B" />
          <Cell fill="#E2E8F0" />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
