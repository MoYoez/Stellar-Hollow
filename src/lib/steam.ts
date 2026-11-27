import { useQuery } from "@tanstack/react-query";

export interface SteamRecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url?: string;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  playtime_deck_forever?: number;
}

export interface SteamRecentGamesResult {
  total_count: number;
  games: SteamRecentGame[];
}

export function getSteamImageUrl(appId: number, hash: string): string {
  if (!hash) return "";
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

export function formatPlayTime(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分` : `${h} 小时`;
}

export function useSteamRecentGames(apiUrl: string, count = 12) {
  return useQuery<SteamRecentGamesResult>({
    queryKey: ["steam-recent-games", apiUrl, count],
    enabled: Boolean(apiUrl),
    staleTime: 1000 * 60 * 5,
    retry: false,
    queryFn: async () => {
      const sep = apiUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${apiUrl}${sep}count=${count}`);
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || !contentType.includes("application/json")) {
        throw new Error(`Steam API unavailable (${res.status})`);
      }
      const data = (await res.json()) as SteamRecentGamesResult & { error?: string };
      if (data.error || !Array.isArray(data.games)) {
        throw new Error(data.error ?? "Invalid Steam response");
      }
      return data;
    },
  });
}
