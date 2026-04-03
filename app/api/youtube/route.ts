import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) return Response.json({ error: "Query is required" }, { status: 400 });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return Response.json({ error: "YouTube API key not configured" }, { status: 500 });

  try {
    // Step 1: Find the channel by keyword (search type=channel)
    const channelSearchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${apiKey}`
    );
    const channelSearchData = await channelSearchRes.json();

    if (channelSearchData.error) return Response.json({ error: channelSearchData.error.message }, { status: 400 });

    const channelId: string | undefined = channelSearchData.items?.[0]?.id?.channelId;

    if (!channelId) {
      return Response.json({ platform: "youtube", username: query, accountName: query, profilePicture: "", totalViews: 0, videos: [], error: "Channel tidak ditemukan" });
    }

    // Step 2: Fetch channel stats + uploads playlist in parallel
    // Uploads playlist ID = channel ID with "UC" replaced by "UU"
    const uploadsPlaylistId = "UU" + channelId.slice(2);

    const [channelRes, playlistRes] = await Promise.all([
      fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`),
      fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`),
    ]);

    const [channelData, playlistData] = await Promise.all([channelRes.json(), playlistRes.json()]);

    const channel = channelData?.items?.[0];

    // Step 3: Get video stats for the channel's own videos
    const playlistItems: Array<{ snippet: { resourceId: { videoId: string }; title: string; thumbnails: { medium?: { url: string }; default?: { url: string } } } }> = playlistData?.items || [];

    const videoIds = playlistItems.map((i) => i.snippet.resourceId.videoId).filter(Boolean).join(",");

    let videos: Array<{ id: string; title: string; views: number; thumbnail: string; url: string; likes: number; comments: number }> = [];

    if (videoIds) {
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
      );
      const statsData = await statsRes.json();

      const statsMap: Record<string, { viewCount?: string; likeCount?: string; commentCount?: string }> = {};
      (statsData.items || []).forEach((item: { id: string; statistics: Record<string, string> }) => {
        statsMap[item.id] = item.statistics;
      });

      videos = playlistItems.map((item) => {
        const vid = item.snippet.resourceId.videoId;
        const stats = statsMap[vid] || {};
        return {
          id: vid,
          title: item.snippet.title,
          views: parseInt(stats.viewCount || "0"),
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
          url: `https://youtube.com/watch?v=${vid}`,
          likes: parseInt(stats.likeCount || "0"),
          comments: parseInt(stats.commentCount || "0"),
        };
      });
    }

    // totalChannelViews = actual lifetime views from channel stats (authoritative)
    const totalChannelViews = parseInt(channel?.statistics?.viewCount || "0") || 0;
    // totalViews for display: prefer lifetime channel views, fall back to sum of fetched videos
    const videoSumViews = videos.reduce((s, v) => s + v.views, 0);

    return Response.json({
      fetchedAt: Date.now(),
      platform: "youtube",
      username: query,
      accountName: channel?.snippet?.title || query,
      profilePicture: channel?.snippet?.thumbnails?.medium?.url || channel?.snippet?.thumbnails?.default?.url || "",
      totalViews: totalChannelViews || videoSumViews,
      totalChannelViews: totalChannelViews || undefined,
      followers: parseInt(channel?.statistics?.subscriberCount || "0") || undefined,
      totalPosts: parseInt(channel?.statistics?.videoCount || "0") || undefined,
      country: channel?.snippet?.country || undefined,
      bio: channel?.snippet?.description?.slice(0, 300) || undefined,
      isVerified: false,
      videos,
    });
  } catch {
    return Response.json({ error: "Failed to fetch YouTube data" }, { status: 500 });
  }
}
