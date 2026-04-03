import { NextRequest } from "next/server";

const ALLOWED_HOSTS = [
  "yt3.ggpht.com",
  "yt3.googleusercontent.com",
  "i.ytimg.com",
  "tiktokcdn.com",
  "cdninstagram.com",
  "fbcdn.net",
  "instagram.com",
  "pinimg.com",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new Response("Invalid protocol", { status: 400 });
  }

  const isAllowed = ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h));
  if (!isAllowed) return new Response("Domain not allowed", { status: 403 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/",
      },
    });
    if (!res.ok) return new Response("Image fetch failed", { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Failed to proxy image", { status: 500 });
  }
}
