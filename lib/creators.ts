export interface Creator {
  username: string;   // display / search key
  name: string;
  hint: string;
  platforms: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
  };
}

export const POPULAR_CREATORS: Creator[] = [
  // ── Global mega ──────────────────────────────────────────────
  { username: "cristiano", name: "Cristiano Ronaldo", hint: "900M+ followers",
    platforms: { youtube: "cristiano", tiktok: "cristiano", instagram: "cristiano" } },
  { username: "leomessi", name: "Lionel Messi", hint: "500M+ followers",
    platforms: { youtube: "leomessi", tiktok: "leomessi", instagram: "leomessi" } },
  { username: "therock", name: "Dwayne Johnson", hint: "400M+ followers",
    platforms: { youtube: "therock", tiktok: "therock", instagram: "therock" } },
  { username: "kyliejenner", name: "Kylie Jenner", hint: "400M+ followers",
    platforms: { youtube: "kyliejenner", tiktok: "kyliejenner", instagram: "kyliejenner" } },
  { username: "selenagomez", name: "Selena Gomez", hint: "420M+ followers",
    platforms: { youtube: "selenagomez", tiktok: "selenagomez", instagram: "selenagomez" } },
  { username: "kimkardashian", name: "Kim Kardashian", hint: "360M+ followers",
    platforms: { youtube: "kimkardashian", tiktok: "kimkardashian", instagram: "kimkardashian" } },
  { username: "arianagrande", name: "Ariana Grande", hint: "380M+ followers",
    platforms: { youtube: "arianagrande", tiktok: "arianagrande", instagram: "arianagrande" } },
  { username: "beyonce", name: "Beyoncé", hint: "300M+ followers",
    platforms: { youtube: "beyonce", tiktok: "beyonce", instagram: "beyonce" } },
  { username: "taylorswift", name: "Taylor Swift", hint: "280M+ followers",
    platforms: { youtube: "taylorswiftofficial", tiktok: "taylorswift", instagram: "taylorswift" } },
  { username: "justinbieber", name: "Justin Bieber", hint: "240M+ followers",
    platforms: { youtube: "justinbieber", tiktok: "justinbieber", instagram: "justinbieber" } },
  { username: "neymarjr", name: "Neymar Jr", hint: "220M+ followers",
    platforms: { youtube: "neymarjr", tiktok: "neymarjr", instagram: "neymarjr" } },
  { username: "eminem", name: "Eminem", hint: "60M+ followers",
    platforms: { youtube: "eminem", tiktok: "eminem", instagram: "eminem" } },
  { username: "shakira", name: "Shakira", hint: "80M+ followers",
    platforms: { youtube: "shakira", tiktok: "shakira", instagram: "shakira" } },
  { username: "katyperry", name: "Katy Perry", hint: "100M+ followers",
    platforms: { youtube: "katyperry", tiktok: "katyperry", instagram: "katyperry" } },
  { username: "rihanna", name: "Rihanna", hint: "150M+ followers",
    platforms: { youtube: "rihanna", tiktok: "rihanna", instagram: "badgalriri" } },
  { username: "willsmith", name: "Will Smith", hint: "70M+ followers",
    platforms: { youtube: "willsmith", tiktok: "willsmith", instagram: "willsmith" } },
  { username: "gordonramsay", name: "Gordon Ramsay", hint: "50M+ followers",
    platforms: { youtube: "gordonramsay", tiktok: "gordonramsayofficial", instagram: "gordongram" } },
  { username: "kevinhart", name: "Kevin Hart", hint: "50M+ followers",
    platforms: { youtube: "kevinhart4real", tiktok: "kevinhart4real", instagram: "kevinhart4real" } },

  // ── YouTube giants ────────────────────────────────────────────
  { username: "mrbeast", name: "MrBeast", hint: "330M+ subscribers",
    platforms: { youtube: "mrbeast", tiktok: "mrbeast", instagram: "mrbeast" } },
  { username: "tseries", name: "T-Series", hint: "270M+ subscribers",
    platforms: { youtube: "tseries", tiktok: "tseries", instagram: "tseries" } },
  { username: "cocomelon", name: "Cocomelon", hint: "175M+ subscribers",
    platforms: { youtube: "cocomelon", tiktok: "cocomelon", instagram: "cocomelon" } },
  { username: "pewdiepie", name: "PewDiePie", hint: "111M subscribers",
    platforms: { youtube: "pewdiepie", tiktok: "pewdiepie", instagram: "pewdiepie" } },
  { username: "markiplier", name: "Markiplier", hint: "37M subscribers",
    platforms: { youtube: "markiplier", tiktok: "markiplier", instagram: "markiplier" } },
  { username: "mkbhd", name: "MKBHD", hint: "18M subscribers",
    platforms: { youtube: "mkbhd", tiktok: "mkbhd", instagram: "mkbhd" } },
  { username: "veritasium", name: "Veritasium", hint: "15M subscribers",
    platforms: { youtube: "veritasium", tiktok: "veritasium", instagram: "veritasium" } },
  { username: "linustechtips", name: "Linus Tech Tips", hint: "15M subscribers",
    platforms: { youtube: "linustechtips", tiktok: "linustechtips", instagram: "linustechtips" } },
  { username: "dude perfect", name: "Dude Perfect", hint: "60M subscribers",
    platforms: { youtube: "DudePerfect", tiktok: "dudeperfect", instagram: "dudeperfect" } },
  { username: "vsauce", name: "Vsauce", hint: "18M subscribers",
    platforms: { youtube: "vsauce", tiktok: "vsauce", instagram: "vsaucethree" } },
  { username: "kurzgesagt", name: "Kurzgesagt", hint: "22M subscribers",
    platforms: { youtube: "kurzgesagt", tiktok: "kurzgesagt", instagram: "kurzgesagt" } },

  // ── TikTok stars ─────────────────────────────────────────────
  { username: "khaby.lame", name: "Khaby Lame", hint: "162M TikTok followers",
    platforms: { youtube: "khabylame", tiktok: "khaby.lame", instagram: "khaby00" } },
  { username: "charlidamelio", name: "Charli D'Amelio", hint: "150M+ followers",
    platforms: { youtube: "charlidamelio", tiktok: "charlidamelio", instagram: "charlidamelio" } },
  { username: "addisonraee", name: "Addison Rae", hint: "88M+ followers",
    platforms: { youtube: "addisonraee", tiktok: "addisonre", instagram: "addisonraee" } },
  { username: "belladelphine", name: "Belle Delphine", hint: "30M+ followers",
    platforms: { youtube: "belledelphine", tiktok: "belledelphine", instagram: "belle.delphine" } },

  // ── Media & brands ───────────────────────────────────────────
  { username: "nasa", name: "NASA", hint: "100M+ followers",
    platforms: { youtube: "nasa", tiktok: "nasa", instagram: "nasa" } },
  { username: "natgeo", name: "National Geographic", hint: "50M+ followers",
    platforms: { youtube: "NatGeo", tiktok: "natgeo", instagram: "natgeo" } },
  { username: "bbcnews", name: "BBC News", hint: "20M+ followers",
    platforms: { youtube: "BBCNews", tiktok: "bbcnews", instagram: "bbcnews" } },
  { username: "cnn", name: "CNN", hint: "15M+ followers",
    platforms: { youtube: "CNN", tiktok: "cnn", instagram: "cnn" } },
  { username: "nba", name: "NBA", hint: "80M+ followers",
    platforms: { youtube: "NBA", tiktok: "nba", instagram: "nba" } },
  { username: "realmadrid", name: "Real Madrid CF", hint: "300M+ followers",
    platforms: { youtube: "realmadrid", tiktok: "realmadrid", instagram: "realmadrid" } },
  { username: "fcbarcelona", name: "FC Barcelona", hint: "280M+ followers",
    platforms: { youtube: "fcbarcelona", tiktok: "fcbarcelona", instagram: "fcbarcelona" } },
  { username: "nike", name: "Nike", hint: "300M+ followers",
    platforms: { youtube: "nike", tiktok: "nike", instagram: "nike" } },
  { username: "red bull", name: "Red Bull", hint: "20M+ followers",
    platforms: { youtube: "redbull", tiktok: "redbull", instagram: "redbull" } },

  // ── Indonesian creators ──────────────────────────────────────
  { username: "radityadika", name: "Raditya Dika", hint: "25M+ followers",
    platforms: { youtube: "radityadika", tiktok: "radityadika", instagram: "radityadika" } },
  { username: "rans", name: "RANS Entertainment", hint: "30M+ subscribers",
    platforms: { youtube: "RANSEntertainment", tiktok: "ransentertainment", instagram: "rans_entertainment" } },
  { username: "deddycorbuzier", name: "Deddy Corbuzier", hint: "20M+ followers",
    platforms: { youtube: "deddycorbuzier", tiktok: "deddy_corbuzier", instagram: "deddycorbuzier" } },
  { username: "ricis", name: "Ria Ricis", hint: "30M+ followers",
    platforms: { youtube: "RiaRicisOfficial", tiktok: "ricis", instagram: "ricis" } },
  { username: "baim", name: "Baim Wong", hint: "20M+ followers",
    platforms: { youtube: "baimwong", tiktok: "baimwong", instagram: "baimwong" } },
  { username: "atta", name: "Atta Halilintar", hint: "25M+ followers",
    platforms: { youtube: "attahalilintar", tiktok: "attahalilintar", instagram: "attahalilintar" } },
  { username: "awkarin", name: "Awkarin", hint: "10M+ followers",
    platforms: { youtube: "awkarin", tiktok: "awkarin", instagram: "awkarin" } },
  { username: "nagita slavina", name: "Nagita Slavina", hint: "15M+ followers",
    platforms: { youtube: "nagitaslavinaofficial", tiktok: "nagitaslavina", instagram: "nagitaslavina" } },
  { username: "fuji", name: "Fuji", hint: "10M+ followers",
    platforms: { youtube: "fujian", tiktok: "fuji_an", instagram: "fujian" } },
  { username: "marshelvino", name: "Marshel Widianto", hint: "5M+ followers",
    platforms: { youtube: "marshelvino", tiktok: "marshelvino", instagram: "marshelvino" } },
  { username: "windah basudara", name: "Windah Basudara", hint: "8M+ followers",
    platforms: { youtube: "WindahBasudara", tiktok: "windahbasudara", instagram: "windahbasudara" } },
  { username: "davistea", name: "Davis Tea", hint: "6M+ followers",
    platforms: { youtube: "davistea", tiktok: "davistea", instagram: "davistea" } },
  { username: "fiki naki", name: "Fiki Naki", hint: "5M+ followers",
    platforms: { youtube: "fikinaki", tiktok: "fikinaki", instagram: "fikinaki" } },
  { username: "rachel vennya", name: "Rachel Vennya", hint: "8M+ followers",
    platforms: { youtube: "rachelvennya", tiktok: "rachelvennya", instagram: "rachelvennya" } },
  { username: "ria yunita", name: "Ria Yunita", hint: "5M+ followers",
    platforms: { youtube: "riayunita", tiktok: "riayunita", instagram: "riayunita" } },
  { username: "arief muhammad", name: "Arief Muhammad", hint: "12M+ followers",
    platforms: { youtube: "ariefmuhammad", tiktok: "ariefmuhammad", instagram: "ariefmuhammad" } },
  { username: "ria ricis", name: "Ria Ricis", hint: "30M+ followers",
    platforms: { youtube: "RiaRicisOfficial", tiktok: "ricis", instagram: "ricis" } },
  { username: "dian sastro", name: "Dian Sastrowardoyo", hint: "8M+ followers",
    platforms: { youtube: "diansastrowardoyo", tiktok: "diansastro", instagram: "therealdisastr" } },
  { username: "raffinagita", name: "Raffi & Nagita", hint: "30M+ followers",
    platforms: { youtube: "RANSEntertainment", tiktok: "ransentertainment", instagram: "raffinagita" } },
  { username: "luna maya", name: "Luna Maya", hint: "8M+ followers",
    platforms: { youtube: "lunamaya", tiktok: "lunamaya", instagram: "lunamaya" } },
  { username: "titi kamal", name: "Titi Kamal", hint: "5M+ followers",
    platforms: { youtube: "titikamal", tiktok: "titi.kamal", instagram: "titi_kamal" } },
  { username: "boy william", name: "Boy William", hint: "6M+ followers",
    platforms: { youtube: "boywilliam", tiktok: "boywilliam", instagram: "boywilliam" } },
  { username: "ria sw", name: "Ria SW", hint: "4M+ followers",
    platforms: { youtube: "riasw", tiktok: "riasw", instagram: "riasw" } },
  { username: "awkarin karin", name: "Karin (Awkarin)", hint: "10M+ followers",
    platforms: { youtube: "awkarin", tiktok: "awkarin", instagram: "awkarin" } },
  { username: "maell lee", name: "Maell Lee", hint: "5M+ followers",
    platforms: { youtube: "maelllee", tiktok: "maelllee", instagram: "maelllee" } },
  { username: "timothy ronald", name: "Timothy Ronald", hint: "Investor & YouTuber",
    platforms: { youtube: "TimothyRonald", tiktok: "timothyronald", instagram: "timothyronald" } },
  { username: "felicya angelista", name: "Felicya Angelista", hint: "5M+ followers",
    platforms: { youtube: "felicyaangelista", tiktok: "felicyaangelista", instagram: "felicyaangelista" } },
  { username: "kaesang", name: "Kaesang Pangarep", hint: "6M+ followers",
    platforms: { youtube: "KaesangPangarep", tiktok: "kaesangp", instagram: "kaesangp" } },
  { username: "gibran", name: "Gibran Rakabuming", hint: "Walikota Solo",
    platforms: { youtube: "gibranrakabuming", tiktok: "gibranrakabuming", instagram: "gibran_rakabuming" } },
  { username: "jokowi", name: "Joko Widodo", hint: "Presiden RI ke-7",
    platforms: { youtube: "jokowi", tiktok: "jokowi", instagram: "jokowi" } },
  { username: "suliantoindriaputra", name: "Sulianto Indria Putra", hint: "305K YT · 1.3M IG",
    platforms: { youtube: "suliantoindriaputra", tiktok: "suliantoindriaputra", instagram: "suliantoindriaputra" } },
  { username: "suli", name: "Sulianto (Suli)", hint: "305K YT · 1.3M IG",
    platforms: { youtube: "suliantoindriaputra", tiktok: "suliantoindriaputra", instagram: "suliantoindriaputra" } },
];

export function searchCreators(query: string, limit = 6): Creator[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // Deduplicate by name
  const seen = new Set<string>();
  const results: Creator[] = [];

  for (const c of POPULAR_CREATORS) {
    const key = c.name.toLowerCase();
    if (seen.has(key)) continue;
    if (
      c.username.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      Object.values(c.platforms).some((u) => u?.toLowerCase().includes(q))
    ) {
      seen.add(key);
      results.push(c);
    }
    if (results.length >= limit) break;
  }
  return results;
}

export function getPlatformQueries(query: string): { youtube: string; tiktok: string; instagram: string } {
  const q = query.trim().toLowerCase();
  const match = POPULAR_CREATORS.find(
    (c) =>
      c.username.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      Object.values(c.platforms).some((u) => u?.toLowerCase() === q)
  );
  if (match) {
    return {
      youtube: match.platforms.youtube || query,
      tiktok: match.platforms.tiktok || query,
      instagram: match.platforms.instagram || query,
    };
  }
  return { youtube: query, tiktok: query, instagram: query };
}
