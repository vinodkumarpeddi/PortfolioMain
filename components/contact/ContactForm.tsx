"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";
import { ArrowUpRight } from "@/components/ui/Icons";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

function gmailCompose(name: string, email: string, message: string) {
  const su = encodeURIComponent(`Hello Vinod — ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${su}&body=${body}`;
}

export function ContactForm({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({ name: "", email: "", message: "", company: "" });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      if (res.status === 501) {
        window.open(gmailCompose(values.name, values.email, values.message), "_blank", "noopener,noreferrer");
        setStatus("fallback");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
    } catch {
      setError("Network error — try the Gmail button below.");
      setStatus("error");
    }
  };

  const field = "w-full rounded-xl border border-line-2 bg-bg-1/70 px-4 py-3 text-[15px] text-fg-1 outline-none transition-colors placeholder:text-fg-3 focus:border-accent/70 focus:bg-bg-1";

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          key="form"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { duration: 0.6, ease: ease.outExpo } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.35, ease: ease.inOut } }}
          className="overflow-hidden"
        >
          <form onSubmit={submit} className="relative border-t border-line-1 p-6 sm:p-8 lg:p-10" aria-label="Send a message" noValidate>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="label text-fg-3">Write a message</p>
                <p className="mt-2 text-h3 text-fg-1">Tell me what you&apos;re building.</p>
              </div>
              <button type="button" onClick={onClose} className="label rounded-full border border-line-2 px-3 py-2 text-fg-3 transition-colors hover:text-fg-1" data-cursor="Close">
                Close
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-8 rounded-2xl border border-success/40 bg-success/10 p-6">
                <p className="text-h3 text-fg-1">Sent — thank you.</p>
                <p className="mt-2 text-[15px] text-fg-2">I read everything and reply within a day or two.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="label text-fg-3">Name</span>
                    <input required autoComplete="name" value={values.name} onChange={set("name")} className={cn(field, "mt-2")} placeholder="Your name" />
                  </label>
                  <label className="block">
                    <span className="label text-fg-3">Email</span>
                    <input required type="email" autoComplete="email" value={values.email} onChange={set("email")} className={cn(field, "mt-2")} placeholder="you@company.com" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="label text-fg-3">Message</span>
                    <textarea required rows={5} value={values.message} onChange={set("message")} className={cn(field, "mt-2 resize-y")} placeholder="A role, a project, a system you're wrestling with…" />
                  </label>
                  <input tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")} className="hidden" aria-hidden name="company" />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-fg-1 px-6 text-sm font-medium text-accent-ink transition-colors hover:bg-white disabled:opacity-60"
                    data-cursor="Send"
                  >
                    {status === "sending" ? "Sending…" : "Send message"} <ArrowUpRight />
                  </button>
                  <a
                    href={gmailCompose(values.name || "", values.email || "", values.message || "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-fg-1 transition-colors hover:border-fg-1/60"
                    data-cursor="Gmail ↗"
                  >
                    Send via Gmail instead
                  </a>
                  {status === "fallback" && <p className="basis-full text-sm text-fg-2">Opened Gmail with your message pre-filled — hit send there.</p>}
                  {status === "error" && error && <p className="basis-full text-sm text-error">{error}</p>}
                </div>
              </>
            )}
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
