import { NextResponse } from "next/server";
import { profile } from "@/data/profile";

export const runtime = "nodejs";

type Payload = { name?: string; email?: string; message?: string; company?: string };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // honeypot
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
    return NextResponse.json({ ok: false, error: "Please fill in your name, a valid email and a message." }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, configured: false }, { status: 501 });

  const to = process.env.CONTACT_TO ?? profile.email;
  const from = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Portfolio · message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("resend failed", res.status, detail);
    return NextResponse.json({ ok: false, error: "Could not send right now." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
