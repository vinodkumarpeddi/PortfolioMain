export function CodeBlock({ source, language, caption }: { source: string; language: string; caption?: string }) {
  const lines = source.split("\n");
  return (
    <figure className="overflow-hidden rounded-2xl border border-line-1 bg-bg-0/80 [box-shadow:var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-2.5">
        <span className="label text-fg-3">{caption ?? language}</span>
        <span className="label text-fg-3">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-fg-1 sm:p-5 sm:text-[13px]">
        <code>
          {lines.map((l, i) => (
            <span key={i} className="flex gap-4">
              <span className="w-5 shrink-0 select-none text-right text-fg-3/60">{i + 1}</span>
              <span className="whitespace-pre">{l}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
