import { useQuery } from "@tanstack/react-query";
import { SITE_CONFIG } from "@/config/site.config";

interface GitHubRepoApi {
  full_name: string;
  stargazers_count: number;
  language: string | null;
}

async function fetchUserRepos(username: string): Promise<Record<string, GitHubRepoApi>> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`,
    { headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const list = (await res.json()) as GitHubRepoApi[];
  const map: Record<string, GitHubRepoApi> = {};
  for (const repo of list) {
    map[repo.full_name.toLowerCase()] = repo;
  }
  return map;
}

/**
 * Fetches live star counts & languages for MoYoez's repos via TanStack Query.
 * Falls back cleanly to curated numbers if offline or rate-limited.
 */
export function useLiveRepoMap(): Record<string, GitHubRepoApi> {
  const username = SITE_CONFIG.githubUsername.trim();
  const { data } = useQuery({
    queryKey: ["github-repos", username],
    queryFn: () => fetchUserRepos(username),
    enabled: username.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return data ?? {};
}
