import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // 501 tells the client to fall back to opening a pre-filled Gmail compose window
  if (!host || !user || !pass) return NextResponse.json({ ok: false, configured: false }, { status: 501 });

  const port = Number(process.env.SMTP_PORT ?? 587);
  const to = process.env.CONTACT_TO ?? profile.email;
  const from = process.env.CONTACT_FROM ?? user;

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transport.sendMail({
      from: `${profile.shortName} portfolio <${from}>`,
      to,
      replyTo: `${name} <${email}>`,
      subject: `Portfolio · message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    console.error("smtp send failed", err);
    return NextResponse.json({ ok: false, error: "Could not send right now." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
