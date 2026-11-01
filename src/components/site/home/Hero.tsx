"use client";

import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, money } from "@/lib/utils";
import { useDB } from "@/store/db";
import { RollText } from "../../motion/Kit";
import { useQuickAdd } from "../ProductSheet";

const OUT = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

function Rise({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span aria-label={text} className="block">
      {text.split(" ").map((w, i, a) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] -mb-[0.06em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 6 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 1.2, ease: OUT, delay: delay + i * 0.09 }}
          >
            {w}
            {i < a.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Split hero. Left: a wide headline and a café menu-board of today's pours.
 * Right: a full-height photo of the selected drink. The whole section
 * recolours to match each drink; the board auto-advances.
 */
export function Hero() {
  const hero = useDB((s) => s.settings.hero);
  const cur$ = useDB((s) => s.settings.site.currency);
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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const idx = slides.length ? i % slides.length : 0;
  const cur = slides[idx];
  const bg = cur?.bg ?? "#f3f1ec";
  const ink = cur?.ink ?? "#141210";
  const pop = cur?.pop ?? "#e8432d";
  const duration = Math.max(0, hero.autoplay ?? 5);

  useEffect(() => {
    if (!duration || paused || !inView || slides.length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % slides.length), duration * 1000);
    return () => clearTimeout(t);
  }, [i, duration, paused, inView, slides.length]);

  useEffect(() => {
    if (cur) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cur.bg);
  }, [cur]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <motion.section
      ref={ref}
      initial={false}
      animate={{ backgroundColor: bg, color: ink }}
      transition={{ duration: 1.1, ease: WIPE }}
      className="relative grid min-h-[100svh] overflow-hidden lg:grid-cols-[1.08fr_1fr]"
    >
      {/* ------------------------------------------------ Photo panel */}
      <div className="relative h-[56svh] overflow-hidden lg:order-2 lg:h-auto">
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={cur?.id ?? "x"}
              className="absolute inset-0"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.1, ease: WIPE }}
            >
              <motion.img
                src={(cur?.p.image ?? hero.image).replace("w=900", "w=1400")}
                alt={cur?.p.name ?? "Coffee"}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1.06 }}
                transition={{ duration: 2.2, ease: OUT }}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

        {/* big index */}
        <div className="pointer-events-none absolute right-4 top-14 text-white lg:right-8 lg:top-24">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={idx}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-60%", opacity: 0 }}
              transition={{ duration: 0.8, ease: WIPE }}
              className="display block text-[22vw] leading-none opacity-90 lg:text-[9vw]"
              style={{ WebkitTextStroke: "2px white", color: "transparent" }}
            >
              {String(idx + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* caption */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={cur?.id ?? "c"} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: OUT }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">{cur?.p.notes ?? "Today’s pour"}</p>
              <p className="display mt-1 text-2xl uppercase sm:text-3xl">{cur?.p.name}</p>
            </motion.div>
          </AnimatePresence>
          {cur && (
            <motion.button
              key={`add-${cur.id}`}
              onClick={() => quickAdd(cur.p)}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="grid size-[4.5rem] shrink-0 place-items-center rounded-full text-white shadow-2xl sm:size-20"
              style={{ background: pop }}
              aria-label={`Add ${cur.p.name}`}
            >
              <span className="text-center leading-none">
                <Plus className="mx-auto size-5" />
                <span className="mt-1 block text-[11px] font-bold">{money(cur.p.price, cur$)}</span>
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ Copy + board */}
      <motion.div style={{ y: textY }} className="relative z-10 flex flex-col px-5 pb-10 pt-8 sm:px-8 lg:order-1 lg:px-12 lg:pb-10 lg:pt-10">
        <div className="hidden items-center justify-between text-[13px] font-semibold lg:flex">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full transition-colors duration-700" style={{ background: pop }} />
            {hero.eyebrow}
          </span>
        </div>

        <h1 className="display mt-2 text-[clamp(2.7rem,13.2vw,9rem)] uppercase !leading-[0.86] lg:mt-auto lg:text-[6.5vw]">
          <Rise text={hero.title} delay={0.2} />
          <span className="block transition-colors duration-700" style={{ color: pop }}>
            <Rise text={hero.titleItalic} delay={0.4} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: OUT }}
          className="mt-6 max-w-md text-[15px] leading-relaxed opacity-75"
        >
          {hero.subtitle}
        </motion.p>

        {/* Menu board */}
        {slides.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
            className="mt-8 lg:mt-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex items-center justify-between border-b border-current/20 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">
              <span>Today’s pours</span>
              <span>{cur$} · Regular</span>
            </div>
            <ul>
              {slides.map((s, k) => {
                const active = k === idx;
                return (
                  <li key={s.id} className="relative border-b border-current/15">
                    <button
                      onClick={() => setI(k)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setI(k)}
                      className="group flex w-full items-baseline gap-3 py-3 text-left"
                    >
                      <span className="w-6 shrink-0 text-[12px] font-bold tabular-nums opacity-50">{String(k + 1).padStart(2, "0")}</span>
                      <span
                        className={cn("display display-n text-[clamp(1.05rem,4.6vw,1.5rem)] uppercase leading-none transition-[color,transform] duration-500", active ? "translate-x-1" : "opacity-70")}
                        style={active ? { color: pop } : undefined}
                      >
                        <RollText>{s.p.name}</RollText>
                      </span>
                      <span className="mx-1 h-0 flex-1 translate-y-[-0.2em] border-b-2 border-dotted border-current/25" />
                      <span className="text-[15px] font-bold tabular-nums">{money(s.p.price, cur$)}</span>
                    </button>
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
                        <motion.span
                          key={`${s.id}-${i}-${paused}`}
                          className="block h-full"
                          style={{ background: pop }}
                          initial={{ width: paused || !duration ? "100%" : "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: paused || !duration ? 0 : duration, ease: "linear" }}
                        />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: OUT }}
          className="mt-7 flex flex-wrap items-center gap-2.5"
        >
          <Link
            href={hero.ctaPrimary.href}
            className="group flex h-12 items-center gap-2.5 rounded-full pl-5 pr-1.5 text-[15px] font-semibold transition-colors duration-700"
            style={{ background: ink, color: bg }}
          >
            <RollText>{hero.ctaPrimary.label}</RollText>
            <span className="grid size-9 place-items-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45" style={{ background: pop }}>
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
          <Link href={hero.ctaSecondary.href} className="group flex h-12 items-center rounded-full px-5 text-[15px] font-semibold ring-1 ring-current/30 transition hover:ring-current">
            <RollText>{hero.ctaSecondary.label}</RollText>
          </Link>
          <span className="ml-auto hidden items-center gap-1.5 text-[12px] font-semibold opacity-60 lg:flex">
            Scroll <ArrowDownRight className="size-3.5" />
          </span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
