import { profile } from "@/data/profile";
import { GitHub, LinkedIn, XLogo, Mail } from "@/components/ui/Icons";
import { LocalTime } from "@/components/ui/LocalTime";

const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  GitHub,
  LinkedIn,
  X: XLogo,
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="gutter relative border-t border-line-1 bg-bg-0 py-8 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] lg:pb-8 text-fg-2 sm:py-10">
      <div className="mx-auto flex max-w-[100rem] flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
        <div>
          <p className="text-[15px] font-semibold text-fg-1">{profile.name}</p>
          <p className="label mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-3">
            <span>Software Engineer · {profile.location}</span>
            <span className="hidden h-3 w-px bg-line-2 sm:block" aria-hidden />
            <span>Local time <LocalTime className="tabular-nums text-fg-2" /> IST</span>
          </p>
        </div>
        <ul className="flex items-center gap-2" aria-label="Social links">
          {profile.socials.map((s) => {
            const Icon = icons[s.label];
            return (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  data-cursor={s.label === "GitHub" ? "GitHub ↗" : undefined}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line-1 text-fg-2 transition-[colors,transform] hover:border-line-2 hover:text-fg-1 active:scale-95"
                >
                  {Icon ? <Icon width={16} height={16} /> : s.label}
                </a>
              </li>
            );
          })}
          <li>
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              data-cursor="Contact"
              className="grid h-11 w-11 place-items-center rounded-full border border-line-1 text-fg-2 transition-[colors,transform] hover:border-line-2 hover:text-fg-1 active:scale-95"
            >
              <Mail width={16} height={16} />
            </a>
          </li>
        </ul>
        <div className="label flex flex-col gap-2 text-fg-3 md:items-end">
          <span>© {year} {profile.name}</span>
          <span>Built with Next.js · deployed on Vercel</span>
        </div>
      </div>
    </footer>
  );
}
