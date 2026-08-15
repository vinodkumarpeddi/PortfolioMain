import { notes } from "@/data/notes";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/Icons";

export function Notes() {
  return (
    <div className="mt-24" aria-labelledby="notes-title">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-fg-3">Field notes</p>
          <h3 id="notes-title" className="text-h2 mt-3 text-fg-1">
            Short lessons from building.
          </h3>
        </div>
        <p className="max-w-[44ch] text-sm leading-relaxed text-fg-2">
          Design decisions written down after they were made — each one links to the repository where it lives.
        </p>
      </Reveal>
      <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line-1 bg-line-1 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((n, i) => (
          <RevealItem key={n.id} className="group relative flex flex-col bg-bg-1 p-6 transition-colors duration-[var(--duration-slow)] hover:bg-bg-2">
            <div className="label flex items-center justify-between text-fg-3">
              <span>{n.topic}</span>
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h4 className="text-h3 mt-4 text-fg-1">{n.title}</h4>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-2">{n.body}</p>
            <a
              href={n.source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-fg-2 transition-colors hover:text-fg-1"
              data-cursor="GitHub ↗"
            >
              <span className="link-underline">{n.source.label}</span>
              <ArrowUpRight />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
