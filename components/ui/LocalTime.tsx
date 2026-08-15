"use client";

import { useEffect, useState } from "react";

/** Live local time for a given IANA zone; renders a stable placeholder on the server. */
export function LocalTime({ zone = "Asia/Kolkata", className }: { zone?: string; className?: string }) {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: zone });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [zone]);
  return (
    <time className={className} suppressHydrationWarning>
      {now}
    </time>
  );
}
