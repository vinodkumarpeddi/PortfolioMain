import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <main id="main" className="gutter flex min-h-svh flex-col items-start justify-center py-32">
      <p className="label text-fg-3">
        <span className="text-accent">404</span> / Not found
      </p>
      <h1 className="text-display mt-6 uppercase text-fg-1">
        Route
        <br />
        <span className="text-fg-2">not</span>
        <br />
        found<span className="text-accent">.</span>
      </h1>
      <p className="mt-8 max-w-[40ch] text-lead text-fg-2">This page doesn&apos;t exist — or it moved. The systems that do exist are one click away.</p>
      <div className="mt-8">
        <Button href="/" icon={<ArrowLeft />}>
          Back home
        </Button>
      </div>
      <Link href="/#work" className="sr-only">
        Selected work
      </Link>
    </main>
  );
}
