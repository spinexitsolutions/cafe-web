"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Bike, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, money, openStatus } from "@/lib/utils";
import { useDB } from "@/store/db";
import { useQuickAdd } from "../ProductSheet";

const EASE = [0.22, 1, 0.36, 1] as const;
const SWAP = [0.76, 0, 0.24, 1] as const;

/** Words that rise out of a mask — transform-only so it stays at 60fps. */
function Rise({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.08 }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const hero = useDB((s) => s.settings.hero);
  const site = useDB((s) => s.settings.site);
  const products = useDB((s) => s.products);
  const quickAdd = useQuickAdd();

  const slides = useMemo(
    () =>
      (hero.slides ?? [])
        .map((s) => ({ ...s, p: products.find((p) => p.id === s.productId && p.active) }))
        .filter((s): s is typeof s & { p: NonNullable<typeof s.p> } => !!s.p),
    [hero.slides, products],
  );

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const idx = slides.length ? i % slides.length : 0;
  const cur = slides[idx];
  const bg = cur?.bg ?? "var(--bg)";
  const ink = cur?.ink ?? "var(--ink)";
  const pop = cur?.pop ?? "var(--accent)";
  const duration = Math.max(0, hero.autoplay ?? 5);

  useEffect(() => setStatus(openStatus(site.hours)), [site.hours]);

  // autoplay
  useEffect(() => {
    if (!duration || paused || !inView || slides.length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % slides.length), duration * 1000);
    return () => clearTimeout(t);
  }, [i, duration, paused, inView, slides.length]);

  // keep the browser chrome in sync with the hero colour
  useEffect(() => {
    if (!cur) return;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cur.bg);
  }, [cur]);

  // pointer parallax (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const py = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const cupX = useTransform(px, (v) => v * 28);
  const cupY = useTransform(py, (v) => v * 22);
  const tagX = useTransform(px, (v) => v * -40);
  const tagY = useTransform(py, (v) => v * -30);
  const bigX = useTransform(px, (v) => v * -60);

  // scroll choreography
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const cupScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const cupRot = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <motion.section
      ref={ref}
      initial={false}
      animate={{ backgroundColor: bg, color: ink }}
      transition={{ duration: 1, ease: SWAP }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      style={{ ["--pop" as string]: pop }}
    >
      {/* Giant drink name, sliding behind everything */}
      <motion.div style={{ x: bigX }} className="pointer-events-none absolute inset-x-0 bottom-[14%] -z-10 select-none opacity-[0.06] lg:bottom-[2%]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={cur?.id ?? "x"}
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "-12%", opacity: 0 }}
            transition={{ duration: 1, ease: SWAP }}
            className="display whitespace-nowrap pl-[4vw] text-[34vw] uppercase leading-none lg:text-[22vw]"
          >
            {cur?.p.name.split(" ").slice(-1)[0] ?? site.shortName}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <div className="mx-auto flex w-full max-w-[1520px] flex-1 flex-col px-5 pb-6 pt-24 sm:px-8 sm:pt-28 lg:px-12">
        {/* top meta row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="flex items-center justify-between gap-4 text-[13px] font-medium"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              {status?.open && <span className="absolute inset-0 animate-ping rounded-full" style={{ background: pop }} />}
              <span className="relative size-2 rounded-full" style={{ background: pop }} />
            </span>
            {hero.eyebrow}
          </span>
          <span className="hidden tabular-nums opacity-60 sm:block">
            N°{String(idx + 1).padStart(2, "0")} — {String(slides.length || 1).padStart(2, "0")}
          </span>
        </motion.div>

        <div className="relative mt-6 grid flex-1 grid-cols-1 items-center gap-6 lg:mt-0 lg:grid-cols-12 lg:gap-0">
          {/* Headline */}
          <motion.div style={{ y: headY, opacity: fade }} className="relative z-10 min-w-0 lg:col-span-7">
            <h1 className="display text-[clamp(3.6rem,15.5vw,11.5rem)] !leading-[0.84]">
              <span className="block">
                <Rise text={hero.title} delay={0.15} />
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "1.55em", opacity: 1 }}
                  transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
                  className="relative ml-[0.05em] inline-block h-[0.72em] overflow-hidden rounded-full align-[-0.02em]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hero.secondaryImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </motion.span>
              </span>
              <span className="block transition-colors duration-700" style={{ color: pop }}>
                <Rise text={hero.titleItalic} delay={0.35} />
              </span>
            </h1>
          </motion.div>

          {/* Cup */}
          <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
            <motion.div style={{ x: cupX, y: cupY, scale: cupScale, rotate: cupRot }} className="relative aspect-square w-[78vw] max-w-[540px] sm:w-[58vw] lg:w-[36vw]">
              {/* orbit ring */}
              <motion.svg
                viewBox="0 0 200 200"
                className="absolute -inset-[7%] h-[114%] w-[114%] opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <path id="orbit" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
                </defs>
                <text className="fill-current text-[7px] font-semibold uppercase tracking-[0.32em]">
                  <textPath href="#orbit">
                    {`${cur?.p.notes ?? "Roasted in Bandra"} • Pulled by hand • ${cur?.p.notes ?? "Roasted in Bandra"} • Pulled by hand • `}
                  </textPath>
                </text>
              </motion.svg>

              <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={cur?.id ?? "fallback"}
                    className="absolute inset-0"
                    initial={{ clipPath: "circle(0% at 50% 50%)", rotate: -25, scale: 1.25 }}
                    animate={{ clipPath: "circle(75% at 50% 50%)", rotate: 0, scale: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 1.1, ease: SWAP }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cur?.p.image.replace("w=900", "w=1200") ?? hero.image} alt={cur?.p.name ?? "Coffee"} className="h-full w-full object-cover" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* price sticker */}
              {cur && (
                <motion.div style={{ x: tagX, y: tagY }} className="absolute -right-1 top-[6%] sm:right-[2%]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.button
                      key={cur.id}
                      onClick={() => quickAdd(cur.p)}
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: -12 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.35 }}
                      whileHover={{ scale: 1.08, rotate: 0 }}
                      className="grid size-24 place-items-center rounded-full text-center shadow-xl sm:size-28"
                      style={{ background: pop, color: "#fff" }}
                      aria-label={`Add ${cur.p.name} to bag`}
                    >
                      <span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">from</span>
                        <span className="display block text-3xl !tracking-[-0.04em] sm:text-4xl">{money(cur.p.price, site.currency)}</span>
                        <span className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] font-semibold uppercase">
                          <Plus className="size-3" /> add
                        </span>
                      </span>
                    </motion.button>
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom: copy + switcher */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: EASE }}
          className="mt-8 grid grid-cols-1 gap-8 lg:mt-4 lg:grid-cols-12 lg:items-end"
        >
          <div className="min-w-0 lg:col-span-5">
            <p className="max-w-md text-[15px] leading-relaxed opacity-75 sm:text-base">{hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href={hero.ctaPrimary.href}
                className="group flex h-13 items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 text-[15px] font-semibold transition-transform active:scale-[0.97]"
                style={{ background: ink, color: bg }}
              >
                {hero.ctaPrimary.label}
                <span className="grid size-10 place-items-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45" style={{ background: pop }}>
                  <ArrowUpRight className="size-[18px]" />
                </span>
              </Link>
              <Link
                href={hero.ctaSecondary.href}
                className="flex h-13 items-center rounded-full px-6 text-[15px] font-semibold ring-1 ring-current/25 transition hover:ring-current"
              >
                {hero.ctaSecondary.label}
              </Link>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="min-w-0 lg:col-span-7 lg:pl-10">
              <div className="flex items-center justify-between pb-3 text-[12px] font-semibold opacity-60">
                <span>Today’s pours</span>
                <span className="hidden sm:inline">Tap to switch</span>
              </div>
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
                {slides.map((s, k) => {
                  const active = k === idx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setI(k)}
                      className={cn(
                        "group relative flex min-w-[10.5rem] shrink-0 items-center gap-3 overflow-hidden rounded-2xl p-2 pr-3 text-left transition-colors duration-500 sm:min-w-0",
                        active ? "bg-current/10" : "hover:bg-current/5",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.p.image} alt="" className={cn("size-11 shrink-0 rounded-full object-cover transition duration-500", active ? "scale-100" : "scale-90 opacity-70 grayscale-[40%]")} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold leading-tight">{s.p.name}</span>
                        <span className="text-[12px] opacity-60">{money(s.p.price, site.currency)}</span>
                      </span>
                      <span className="absolute inset-x-2 bottom-0 h-[2px] overflow-hidden rounded-full bg-current/10">
                        {active && (
                          <motion.span
                            key={`${s.id}-${i}-${paused}`}
                            className="block h-full rounded-full"
                            style={{ background: pop }}
                            initial={{ width: paused || !duration ? "100%" : "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: paused || !duration ? 0 : duration, ease: "linear" }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* info strip */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-current/15 pt-4 text-[12.5px] font-medium opacity-70"
        >
          <li>{status?.label ?? "Open daily"}</li>
          <li className="flex items-center gap-1">
            <Star className="size-3.5 fill-current" /> 4.9 · 2,400+ reviews
          </li>
          <li className="flex items-center gap-1.5">
            <Bike className="size-3.5" /> Delivery in ~30 min
          </li>
          <li className="hidden sm:block">Roasted in-house, twice a week</li>
          <li className="ml-auto hidden items-center gap-2 lg:flex">
            Scroll
            <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              ↓
            </motion.span>
          </li>
        </motion.ul>
      </div>
    </motion.section>
  );
}
