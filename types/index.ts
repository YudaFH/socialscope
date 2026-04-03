export interface VideoItem {
  id: string;
  title: string;
  views: number;
  thumbnail: string;
  url: string;
  likes?: number;
  comments?: number;
}

export interface PlatformData {
  platform: "youtube" | "tiktok" | "instagram";
  username: string;
  accountName: string;
  profilePicture: string;
  totalViews: number;
  totalChannelViews?: number; // all-time channel views (YouTube)
  followers?: number;
  following?: number;
  totalPosts?: number;
  isVerified?: boolean;
  bio?: string;
  country?: string;        // ISO country code e.g. "US"
  category?: string;       // Instagram business category
  videos: VideoItem[];
  error?: string;
  fetchedAt?: number; // unix ms timestamp
  loading?: boolean;  // true while streaming fetch is in progress
  skipped?: boolean;  // true when platform input was left empty
}
