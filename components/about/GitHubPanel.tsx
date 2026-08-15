import { getGitHubSummary } from "@/lib/github";
import { profile } from "@/data/profile";
import { ArrowUpRight, GitHub } from "@/components/ui/Icons";
import { Counter } from "@/components/ui/Counter";

export async function GitHubPanel() {
  const gh = await getGitHubSummary();
  const top = gh.languages.slice(0, 5);
  const shareTotal = top.reduce((a, l) => a + l.share, 0) || 1;
  return (
    <div className="h-full rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-fg-1">
          <GitHub className="text-lg" />
          <span className="text-sm font-medium">github.com/{profile.githubUser}</span>
        </div>
        <span className="label text-fg-3">{gh.live ? `synced ${gh.fetchedAt}` : `snapshot ${gh.fetchedAt}`}</span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4">
        <div>
          <dt className="label text-fg-3"><span className="sm:hidden">Repos</span><span className="hidden sm:inline">Public repos</span></dt>
          <dd className="mt-2 text-h2 tabular-nums text-fg-1"><Counter value={gh.publicRepos} /></dd>
        </div>
        <div>
          <dt className="label text-fg-3">Original</dt>
          <dd className="mt-2 text-h2 tabular-nums text-fg-1"><Counter value={gh.ownRepos} /></dd>
        </div>
        <div>
          <dt className="label text-fg-3">Since</dt>
          <dd className="mt-2 text-h2 tabular-nums text-fg-1">{gh.since.slice(0, 4)}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="label flex justify-between text-fg-3">
          <span>Languages by repository</span>
        </div>
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-fg-1/[0.06]" aria-hidden>
          {top.map((l, i) => (
            <span
              key={l.name}
              className="h-full"
              style={{ width: `${(l.share / shareTotal) * 100}%`, background: `color-mix(in oklab, var(--color-accent) ${100 - i * 20}%, var(--color-fg-3))` }}
            />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {top.map((l, i) => (
            <li key={l.name} className="label flex items-center gap-1.5 text-fg-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: `color-mix(in oklab, var(--color-accent) ${100 - i * 20}%, var(--color-fg-3))` }} />
              {l.name} <span className="text-fg-3">{Math.round((l.share / shareTotal) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="label text-fg-3">Recently pushed</p>
        <ul className="mt-2 divide-y divide-line-1">
          {gh.recent.slice(0, 5).map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="group -mx-2 flex min-h-12 items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors active:bg-fg-1/[0.05]">
                <span className="truncate text-fg-1">{r.name}</span>
                <span className="label flex shrink-0 items-center gap-3 text-fg-3">
                  {r.language && <span>{r.language}</span>}
                  <span>{r.pushedAt}</span>
                  <ArrowUpRight className="text-fg-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-fg-1" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
