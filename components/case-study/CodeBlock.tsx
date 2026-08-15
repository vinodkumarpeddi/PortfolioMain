"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({ source, language, caption }: { source: string; language: string; caption?: string }) {
  const lines = source.split("\n");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <figure className="overflow-hidden rounded-2xl border border-line-1 bg-bg-0/80 [box-shadow:var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 border-b border-line-1 pl-4 pr-2">
        <span className="label truncate py-2.5 text-fg-3">{caption ?? language}</span>
        <div className="flex shrink-0 items-center gap-1">
          <span className="label hidden text-fg-3 sm:inline">{language}</span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
            className={cn(
              "label inline-flex h-9 items-center rounded-full px-3 transition-[colors,transform] active:scale-95",
              copied ? "text-success" : "text-fg-3 hover:text-fg-1",
            )}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="relative">
        <pre className="no-scrollbar overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-fg-1 sm:p-5 sm:text-[13px]">
          <code>
            {lines.map((l, i) => (
              <span key={i} className="flex gap-4">
                <span className="w-5 shrink-0 select-none text-right text-fg-3/60">{i + 1}</span>
                <span className="whitespace-pre">{l}</span>
              </span>
            ))}
          </code>
        </pre>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg-0/90 to-transparent sm:hidden" />
      </div>
    </figure>
  );
}
