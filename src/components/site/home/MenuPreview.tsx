"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Reveal } from "../../motion/Reveal";
import { MenuRow } from "../ProductCard";

export function MenuPreview() {
  const allCats = useDB((s) => s.categories);
  const cats = allCats.filter((c) => c.type === "menu").sort((a, b) => a.order - b.order);
  const products = useDB((s) => s.products);
  const [active, setActive] = useState<string | null>(null);
  const current = active ?? cats[0]?.id;
  const items = products.filter((p) => p.active && p.categoryId === current).slice(0, 6);

  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow text-accent">On the menu today</p>
            <h2 className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">
              Order ahead, <em>skip the line.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-muted">Pick up in 8 minutes, or have it delivered warm within 6 km. Everything’s made the moment you order.</p>
          </Reveal>
        </div>

        <div className="-mx-5 mt-10 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-full bg-bg p-1 ring-1 ring-line">
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn("relative whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:px-5", current === c.id ? "text-bg" : "text-muted hover:text-ink")}
              >
                {current === c.id && <motion.span layoutId="menu-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-8 grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <MenuRow key={p.id} p={p} />
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link href="/menu" className="rounded-full bg-ink px-7 py-4 text-sm font-medium text-bg transition hover:bg-accent">
            Explore the full menu
          </Link>
        </div>
      </div>
    </section>
  );
}
