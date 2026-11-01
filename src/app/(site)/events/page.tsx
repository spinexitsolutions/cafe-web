"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RollText } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { cn, money, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function EventsPage() {
  const all = useDB((s) => s.events);
  const cur = useDB((s) => s.settings.site.currency);
  const events = useMemo(() => all.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date)), [all]);
  const cats = useMemo(() => ["All", ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const [cat, setCat] = useState("All");
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 26 });
  const sy = useSpring(y, { stiffness: 260, damping: 26 });
  const list = events.filter((e) => cat === "All" || e.category === cat);
  const hovered = list.find((e) => e.id === hover);

  return (
    <>
      <PageHero eyebrow="Events & workshops" title="Come for coffee," italic="stay for the evening." intro="Latte art classes, cupping sessions, acoustic nights and home-brewing workshops. Small groups, big fun." />

      <div className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("relative pb-1.5 text-[15px] font-semibold transition-colors", cat === c ? "text-ink" : "text-muted hover:text-ink")}>
                {c}
                <sup className="ml-1 text-[10px]">{c === "All" ? events.length : events.filter((e) => e.category === c).length}</sup>
                {cat === c && <motion.span layoutId="ev-cat" className="absolute inset-x-0 -bottom-[13px] h-[3px] bg-accent" />}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">Small groups · book ahead</span>
        </div>

        <ul
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {list.map((e, i) => {
            const d = new Date(e.date);
            const left = e.seats - e.booked;
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.7 }}
                className="border-b border-ink/10"
              >
                <Link href={`/events/${e.slug}`} onPointerEnter={() => setHover(e.id)} className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-6 md:grid-cols-12 md:gap-6 md:py-8">
                  <div className="md:col-span-2">
                    <p className="display text-5xl leading-none md:text-7xl">{String(d.getDate()).padStart(2, "0")}</p>
                    <p className="mt-1 text-[12px] font-semibold uppercase text-muted">{d.toLocaleDateString("en-IN", { month: "short", weekday: "short" })}</p>
                  </div>
                  <div className="min-w-0 md:col-span-6">
                    <p className="text-[12px] font-semibold text-accent">
                      {e.category} · {to12h(e.time)}
                    </p>
                    <h2 className="display mt-1 text-2xl uppercase leading-none transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl md:text-5xl">{e.title}</h2>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.image} alt="" className="mt-4 aspect-[16/9] w-full rounded-[var(--radius)] object-cover md:hidden" />
                  </div>
                  <div className="hidden text-sm md:col-span-2 md:block">
                    <p className="font-semibold">{e.price ? money(e.price, cur) : "Free"}</p>
                    <p className={cn("text-muted", left <= 3 && left > 0 && "text-accent")}>{left > 0 ? `${left} of ${e.seats} seats left` : "Sold out"}</p>
                  </div>
                  <span className="grid size-12 place-items-center self-start rounded-full ring-1 ring-ink/15 transition duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white group-hover:ring-accent md:col-span-2 md:justify-self-end md:self-center">
                    <ArrowUpRight className="size-5" />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
        {list.length === 0 && <p className="py-24 text-center text-muted">Nothing scheduled here yet — check back soon.</p>}
        <p className="mt-10 text-sm text-muted">
          Planning something private? <Link href="/contact" className="group font-semibold text-ink"><RollText>Talk to us →</RollText></Link>
        </p>
      </div>

      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-40 hidden [@media(pointer:fine)]:block">
        <AnimatePresence>
          {hovered && (
            <motion.img
              key={hovered.id}
              src={hovered.image}
              alt=""
              initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.1 }}
              animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="-ml-40 -mt-56 h-72 w-60 rounded-[var(--radius)] object-cover shadow-2xl"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
