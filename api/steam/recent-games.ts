/**
 * Vercel Serverless Function: GET /api/steam/recent-games?count=12
 * Env vars required: STEAM_WEB_API_KEY, STEAM_USER_ID_64
 */
interface Req {
  query?: Record<string, string | string[] | undefined>;
}

interface Res {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

export default async function handler(req: Req, res: Res) {
  const key = process.env.STEAM_WEB_API_KEY;
  const steamid = process.env.STEAM_USER_ID_64;

  if (!key || !steamid) {
    res.status(400).json({ error: "STEAM_WEB_API_KEY or STEAM_USER_ID_64 is not configured" });
    return;
  }

  const rawCount = Array.isArray(req.query?.count) ? req.query?.count[0] : req.query?.count;
  const fallback = Number(process.env.STEAM_RECENT_GAMES_COUNT || 12);
  const parsed = rawCount ? parseInt(rawCount, 10) : fallback;
  const count = Number.isNaN(parsed) ? 12 : Math.min(100, Math.max(1, parsed));

  try {
    const url = new URL("https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/");
    url.searchParams.set("key", key);
    url.searchParams.set("steamid", steamid);
    url.searchParams.set("count", String(count));
    url.searchParams.set("format", "json");

    const upstream = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Steam API failed: ${upstream.status}` });
      return;
    }

    const data = (await upstream.json()) as {
      response?: { total_count?: number; games?: unknown[] };
    };
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({
      total_count: data.response?.total_count ?? 0,
      games: data.response?.games ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Steam API request failed";
    res.status(500).json({ error: message });
  }
}
