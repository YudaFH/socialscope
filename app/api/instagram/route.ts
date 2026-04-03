import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("q") || "";

  if (!username.trim()) return Response.json({ error: "Username is required" }, { status: 400 });

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) return Response.json({ error: "RapidAPI key not configured" }, { status: 500 });

  const host = "instagram-looter2.p.rapidapi.com";
  const headers = { "x-rapidapi-host": host, "x-rapidapi-key": rapidApiKey };

  try {
    const profileRes = await fetch(`https://${host}/profile?username=${encodeURIComponent(username)}`, { headers });
    const profileData = await profileRes.json();

    if (profileData.message?.includes("not subscribed")) {
      return Response.json({ platform: "instagram", username, accountName: username, profilePicture: "", totalViews: 0, videos: [], error: "Belum subscribe Instagram Looter API di RapidAPI" });
    }
    if (!profileData.status || !profileData.id) {
      return Response.json({ platform: "instagram", username, accountName: username, profilePicture: "", totalViews: 0, videos: [], error: profileData.errorMessage || "User not found" });
    }

    const reelsRes = await fetch(`https://${host}/reels?id=${profileData.id}`, { headers });
    const reelsData = await reelsRes.json();

    const rawItems: Array<{
      media?: {
        id?: string; code?: string;
        caption?: { text?: string };
        play_count?: number; like_count?: number; comment_count?: number;
        image_versions2?: { candidates?: Array<{ url: string }> };
      };
    }> = reelsData?.items || [];

    const videos = rawItems.slice(0, 30).map((item) => {
      const m = item.media || {};
      return {
        id: m.id || "",
        title: m.caption?.text?.slice(0, 120) || "No caption",
        views: m.play_count || 0,
        thumbnail: m.image_versions2?.candidates?.[0]?.url || "",
        url: `https://www.instagram.com/p/${m.code}/`,
        likes: m.like_count || 0,
        comments: m.comment_count || 0,
      };
    });

    const totalViews = videos.reduce((s, p) => s + p.views, 0);

    return Response.json({
      platform: "instagram",
      username,
      accountName: profileData.full_name || profileData.username || username,
      profilePicture: profileData.profile_pic_url || "",
      totalViews,
      followers: profileData.follower_count ?? profileData.edge_followed_by?.count ?? undefined,
      following: profileData.following_count ?? profileData.edge_follow?.count ?? undefined,
      totalPosts: profileData.media_count ?? undefined,
      isVerified: profileData.is_verified ?? false,
      bio: profileData.biography?.slice(0, 300) || undefined,
      category: profileData.category_name || undefined,
      videos,
      fetchedAt: Date.now(),
    });
  } catch {
    return Response.json({ error: "Failed to fetch Instagram data" }, { status: 500 });
  }
}
