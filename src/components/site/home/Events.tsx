"use client";

import { MoreLink, SectionHead } from "../../motion/Kit";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Reveal } from "../../motion/Reveal";

export function Events() {
  const all = useDB((s) => s.events);
  const events = all.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const cur = useDB((s) => s.settings.site.currency);
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 25 });
  const sy = useSpring(y, { stiffness: 250, damping: 25 });
  const hovered = events.find((e) => e.id === hover);

  return (
    <section className="bg-ink py-24 text-bg sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead dark label="Happening at Aura" title="Workshops &" accent="evenings" aside={<MoreLink dark href="/events">All events</MoreLink>} />

        <ul
          className="relative mt-12 border-t border-bg/15"
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {events.map((e, i) => {
            const d = new Date(e.date);
            const left = e.seats - e.booked;
            return (
              <Reveal as="li" key={e.id} delay={i * 0.05} className="border-b border-bg/15">
                <Link href={`/events/${e.slug}`} onPointerEnter={() => setHover(e.id)} className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-6 sm:gap-10 sm:py-8">
                  <div className="w-16 text-center sm:w-20">
                    <p className="display text-5xl leading-none sm:text-6xl">{d.getDate()}</p>
                    <p className="eyebrow mt-1 text-bg/50">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow text-bg/50">
                      {e.category} · {e.time}
                    </p>
                    <h3 className="display mt-1 text-3xl transition duration-500 group-hover:translate-x-2 group-hover:text-accent sm:text-5xl">{e.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="font-medium">{e.price ? money(e.price, cur) : "Free"}</p>
                      <p className="text-xs text-bg/50">{left > 0 ? `${left} seats left` : "Sold out"}</p>
                    </div>
                    <span className="grid size-12 place-items-center rounded-full ring-1 ring-bg/20 transition duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:ring-accent">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* Cursor-following preview (fine pointers only) */}
      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-30 hidden [@media(pointer:fine)]:block">
        <AnimatePresence>
          {hovered && (
            <motion.img
              key={hovered.id}
              src={hovered.image}
              alt=""
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="-ml-36 -mt-48 h-64 w-56 rounded-3xl object-cover shadow-2xl"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
