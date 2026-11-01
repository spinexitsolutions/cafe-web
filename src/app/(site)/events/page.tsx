"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Img } from "@/components/motion/Img";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { money } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function EventsPage() {
  const all = useDB((s) => s.events);
  const cur = useDB((s) => s.settings.site.currency);
  const events = useMemo(() => all.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date)), [all]);
  return (
    <>
      <PageHero eyebrow="Events & workshops" title="Come for coffee," italic="stay for the evening." intro="Latte art classes, cupping sessions, acoustic nights and home-brewing workshops. Small groups, big fun." />
      <div className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 sm:px-8 md:grid-cols-2">
        {events.map((e, i) => {
          const d = new Date(e.date);
          const left = e.seats - e.booked;
          return (
            <Reveal key={e.id} delay={(i % 2) * 0.08}>
              <Link href={`/events/${e.slug}`} className="group block overflow-hidden rounded-card bg-surface ring-1 ring-line">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Img src={e.image} alt={e.title} className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-2xl bg-bg px-3 py-2 text-center">
                    <p className="display text-3xl leading-none">{d.getDate()}</p>
                    <p className="eyebrow text-muted">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs text-bg backdrop-blur">{e.category}</span>
                </div>
                <div className="flex items-end justify-between gap-4 p-6">
                  <div>
                    <h2 className="display text-4xl transition group-hover:text-accent">{e.title}</h2>
                    <p className="mt-2 text-sm text-muted">{d.toLocaleDateString("en-IN", { weekday: "long" })} · {e.time} · {e.price ? money(e.price, cur) : "Free"} · {left > 0 ? `${left} seats left` : "Sold out"}</p>
                  </div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full ring-1 ring-line transition duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-bg">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
