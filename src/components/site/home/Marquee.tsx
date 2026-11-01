"use client";

import { useDB } from "@/store/db";

function Row({ words, reverse, speed }: { words: string[]; reverse?: boolean; speed: string }) {
  const list = [...words, ...words];
  return (
    <div className="flex overflow-hidden">
      <div className="animate-marquee flex shrink-0 items-center" style={{ animationDirection: reverse ? "reverse" : "normal", ["--marquee-speed" as string]: speed }}>
        {[...list, ...list].map((w, i) => (
          <span key={i} className="flex items-center">
            <span className="display whitespace-nowrap px-6 text-5xl uppercase sm:text-7xl">{w}</span>
            <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-accent sm:size-8" aria-hidden>
              <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  const words = useDB((s) => s.settings.marquee);
  if (!words.length) return null;
  return (
    <section aria-label="Highlights" className="space-y-2 overflow-hidden border-y border-line py-8 sm:py-10">
      <Row words={words} speed="45s" />
      <div className="text-muted/60 opacity-40">
        <Row words={[...words].reverse()} reverse speed="55s" />
      </div>
    </section>
  );
}
