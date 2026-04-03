import { VideoItem } from "@/types";

export type VideoFilter = "all" | "latest10" | "latest5" | "top10" | "top5";

export const FILTER_OPTIONS: { value: VideoFilter; label: string }[] = [
  { value: "all",      label: "Semua video" },
  { value: "latest10", label: "10 terbaru" },
  { value: "latest5",  label: "5 terbaru" },
  { value: "top10",    label: "10 views terbanyak" },
  { value: "top5",     label: "5 views terbanyak" },
];

export function applyVideoFilter(videos: VideoItem[], filter: VideoFilter): VideoItem[] {
  switch (filter) {
    case "latest10": return videos.slice(0, 10);
    case "latest5":  return videos.slice(0, 5);
    case "top10":    return [...videos].sort((a, b) => b.views - a.views).slice(0, 10);
    case "top5":     return [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
    default:         return videos;
  }
}
