"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useDB } from "@/store/db";
import { Magnetic } from "../../motion/Magnetic";
import { SplitWords } from "../../motion/Reveal";
import { Img } from "../../motion/Img";

function RotatingBadge({ text }: { text: string }) {
  const chars = `${text} • `;
  return (
    <div className="relative grid size-28 place-items-center sm:size-32">
      <motion.svg viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        <defs>
          <path id="circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current text-[9px] uppercase tracking-[0.24em]" style={{ fontFamily: "var(--font-mono)" }}>
          <textPath href="#circle">{chars}</textPath>
        </text>
      </motion.svg>
      <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
        <ArrowRight className="size-5 -rotate-45" />
      </span>
    </div>
  );
}

export function Hero() {
  const hero = useDB((s) => s.settings.hero);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const inset = useTransform(scrollYProgress, [0, 0.55], [5, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.55], [32, 0]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(0 ${i}% 0 ${i}% round ${r}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const overlayText = useTransform(scrollYProgress, [0.25, 0.6], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.25, 0.6], [40, 0]);

  return (
    <section ref={ref} className="relative">
      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 mx-auto max-w-7xl px-5 pt-28 sm:px-8 sm:pt-36">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="eyebrow flex items-center gap-2 text-muted">
          <span className="inline-block size-1.5 rounded-full bg-accent" />
          {hero.eyebrow}
        </motion.p>
        <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <h1 className="display text-[clamp(3.6rem,15vw,12.5rem)] leading-[0.86]">
            <SplitWords text={hero.title} animateOnMount delay={0.1} />
            <br />
            <em className="text-accent">
              <SplitWords text={hero.titleItalic} animateOnMount delay={0.3} />
            </em>
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="hidden pb-6 lg:block"
          >
            <Link href={hero.ctaPrimary.href} aria-label={hero.ctaPrimary.label}>
              <RotatingBadge text="Order ahead · Fresh daily" />
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col gap-6 sm:mt-10 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-[1.05rem] leading-relaxed text-muted">{hero.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link href={hero.ctaPrimary.href} className="group flex h-14 items-center gap-3 rounded-full bg-ink pl-6 pr-2 font-medium text-bg">
                {hero.ctaPrimary.label}
                <span className="grid size-10 place-items-center rounded-full bg-accent transition duration-500 group-hover:rotate-[-45deg]">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={hero.ctaSecondary.href} className="flex h-14 items-center rounded-full px-6 font-medium ring-1 ring-line transition hover:bg-ink hover:text-bg">
                {hero.ctaSecondary.label}
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </motion.div>

      <div className="relative mt-10 h-[78vh] sm:mt-14 sm:h-[115vh]">
        <motion.div style={{ clipPath: clip }} className="sticky top-0 h-[78vh] overflow-hidden sm:h-dvh">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Img src={hero.image} alt="Barista pouring latte art" eager className="h-full w-full object-cover" />
          </motion.div>
          <div className="grain absolute inset-0 overflow-hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
          <motion.div style={{ opacity: overlayText, y: overlayY }} className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="display max-w-2xl text-4xl sm:text-6xl">
                Every cup, <em>pulled by hand.</em>
              </p>
              <div className="flex items-center gap-4 rounded-full bg-white/10 p-2 pr-5 backdrop-blur-md">
                <Img src={hero.secondaryImage} alt="" className="size-12 rounded-full object-cover" />
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    4.9 <Star className="size-3.5 fill-current" /> on Google
                  </p>
                  <p className="text-xs text-white/70">2,400+ happy regulars</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
