import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("q") || "";

  if (!username.trim()) return Response.json({ error: "Username is required" }, { status: 400 });

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) return Response.json({ error: "RapidAPI key not configured" }, { status: 500 });

  const host = "tiktok-scraper7.p.rapidapi.com";
  const headers = { "x-rapidapi-host": host, "x-rapidapi-key": rapidApiKey };

  try {
    const [userRes, postsRes] = await Promise.all([
      fetch(`https://${host}/user/info?unique_id=${encodeURIComponent(username)}`, { headers }),
      fetch(`https://${host}/user/posts?unique_id=${encodeURIComponent(username)}&count=30`, { headers }),
    ]);
    const [userData, postsData] = await Promise.all([userRes.json(), postsRes.json()]);

    if (userData.message === "You are not subscribed to this API." || postsData.message === "You are not subscribed to this API.") {
      return Response.json({ platform: "tiktok", username, accountName: username, profilePicture: "", totalViews: 0, videos: [], error: "Belum subscribe TikTok API di RapidAPI" });
    }

    if (postsData.code !== 0 || !postsData.data) {
      return Response.json({ platform: "tiktok", username, accountName: username, profilePicture: "", totalViews: 0, videos: [], error: postsData.msg || "User not found" });
    }

    const rawVideos: Array<{
      video_id?: string; aweme_id?: string;
      title?: string; content_desc?: string;
      play_count?: number; digg_count?: number; comment_count?: number;
      origin_cover?: string; cover?: string;
    }> = postsData.data.videos || [];

    const videos = rawVideos.slice(0, 30).map((v) => ({
      id: v.video_id || v.aweme_id || "",
      title: v.title || v.content_desc || "No caption",
      views: v.play_count || 0,
      thumbnail: v.origin_cover || v.cover || "",
      url: `https://www.tiktok.com/@${username}/video/${v.video_id || v.aweme_id}`,
      likes: v.digg_count || 0,
      comments: v.comment_count || 0,
    }));

    const totalViews = videos.reduce((s, v) => s + v.views, 0);
    const user = userData.data?.user || {};
    const stats = userData.data?.stats || {};

    return Response.json({
      platform: "tiktok",
      username,
      accountName: user.nickname || user.uniqueId || username,
      profilePicture: user.avatarThumb || user.avatarMedium || "",
      totalViews,
      followers: stats.followerCount ?? user.follower_count ?? undefined,
      following: stats.followingCount ?? user.following_count ?? undefined,
      totalPosts: stats.videoCount ?? user.aweme_count ?? undefined,
      isVerified: user.verified ?? false,
      bio: user.signature || undefined,
      country: user.region || undefined,
      videos,
      fetchedAt: Date.now(),
    });
  } catch {
    return Response.json({ error: "Failed to fetch TikTok data" }, { status: 500 });
  }
}
