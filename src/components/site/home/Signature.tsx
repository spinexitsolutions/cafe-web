"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Img } from "../../motion/Img";
import { useQuickAdd } from "../ProductSheet";

function Card({ p, i, cur }: { p: Product; i: number; cur: string }) {
  const quickAdd = useQuickAdd();
  return (
    <article className="group relative h-[68vh] max-h-[640px] w-[82vw] shrink-0 snap-center overflow-hidden rounded-card bg-ink text-bg sm:w-[420px] lg:h-[72vh] lg:w-[460px]">
      <Link href={`/product/${p.slug}`} className="absolute inset-0" aria-label={p.name}>
        <Img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-[1.4s] group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      </Link>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <span className="display text-7xl text-white/90">{String(i + 1).padStart(2, "0")}</span>
        <span className="eyebrow rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur">{p.tags.includes("seasonal") ? "Seasonal" : "Signature"}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        {p.notes && <p className="eyebrow text-white/60">{p.notes}</p>}
        <h3 className="display mt-2 text-4xl sm:text-5xl">{p.name}</h3>
        <p className="mt-2 max-w-xs text-sm text-white/75">{p.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-lg font-medium">{money(p.price, cur)}</span>
          <button
            onClick={() => quickAdd(p)}
            className="relative flex h-12 items-center gap-2 rounded-full bg-white pl-4 pr-5 text-sm font-medium text-ink transition hover:bg-accent hover:text-white"
          >
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

export function Signature() {
  const products = useDB((s) => s.products);
  const cur = useDB((s) => s.settings.site.currency);
  const list = products.filter((p) => p.active && p.type === "menu" && (p.featured || p.tags.includes("signature"))).slice(0, 7);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [list.length]);

  const Header = (
    <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-5 sm:px-8">
      <div>
        <p className="eyebrow text-accent">The signatures</p>
        <h2 className="display mt-3 text-[clamp(2.8rem,8vw,6.5rem)]">
          House <em>favourites</em>
        </h2>
      </div>
      <Link href="/menu" className="mb-3 hidden shrink-0 rounded-full px-5 py-3 text-sm font-medium ring-1 ring-line transition hover:bg-ink hover:text-bg sm:block">
        Full menu
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile / tablet: native swipe with snap */}
      <section className="py-20 lg:hidden">
        {Header}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 no-scrollbar sm:px-8" data-lenis-prevent-wheel>
          {list.map((p, i) => (
            <Card key={p.id} p={p} i={i} cur={cur} />
          ))}
        </div>
      </section>

      {/* Desktop: pinned horizontal scroll */}
      <section ref={section} className="relative hidden lg:block" style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          {Header}
          <motion.div ref={track} style={{ x }} className="mt-12 flex gap-6 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-8">
            {list.map((p, i) => (
              <Card key={p.id} p={p} i={i} cur={cur} />
            ))}
            <Link href="/menu" className="group flex h-[72vh] max-h-[640px] w-[320px] shrink-0 flex-col items-center justify-center rounded-card ring-1 ring-line transition hover:bg-ink hover:text-bg">
              <span className="display text-5xl">See it all</span>
              <span className="mt-3 text-sm text-muted group-hover:text-bg/60">{products.filter((p) => p.type === "menu").length} items on the menu →</span>
            </Link>
          </motion.div>
          <div className="mx-auto mt-10 h-px w-full max-w-7xl bg-line px-8">
            <motion.div style={{ width: progress }} className="h-px bg-ink" />
          </div>
        </div>
      </section>
    </>
  );
}
