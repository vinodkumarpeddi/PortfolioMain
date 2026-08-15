import fallback from "@/data/github-fallback.json";
import { profile } from "@/data/profile";

export type GitHubSummary = {
  fetchedAt: string;
  publicRepos: number;
  ownRepos: number;
  forks: number;
  since: string;
  languages: { name: string; count: number; share: number }[];
  recent: { name: string; url: string; language: string | null; pushedAt: string; description: string }[];
  live: boolean;
};

type Repo = {
  name: string;
  html_url: string;
  language: string | null;
  pushed_at: string;
  description: string | null;
  fork: boolean;
};

export async function getGitHubSummary(): Promise<GitHubSummary> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "vinodkumarpeddi-portfolio" },
        next: { revalidate: 60 * 60 * 24 },
      },
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const repos = (await res.json()) as Repo[];
    const own = repos.filter((r) => !r.fork);
    const counts = new Map<string, number>();
    for (const r of own) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
    const languages = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, share: Math.round((count / total) * 1000) / 1000 }));
    return {
      fetchedAt: new Date().toISOString().slice(0, 10),
      publicRepos: repos.length,
      ownRepos: own.length,
      forks: repos.length - own.length,
      since: fallback.since,
      languages,
      recent: own.slice(0, 6).map((r) => ({
        name: r.name,
        url: r.html_url,
        language: r.language,
        pushedAt: r.pushed_at.slice(0, 10),
        description: r.description ?? "",
      })),
      live: true,
    };
  } catch {
    return { ...fallback, recent: fallback.recent.slice(0, 6), live: false };
  }
}
