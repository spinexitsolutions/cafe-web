"use client";

import { motion, useInView, useScroll, useTransform, type MotionValue, animate } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDB } from "@/store/db";
import { ParallaxImg } from "../../motion/Parallax";
import { Reveal } from "../../motion/Reveal";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const num = parseFloat(value);
  const suffix = value.replace(/^[\d.]+/, "");
  const [display, setDisplay] = useState(isNaN(num) ? value : "0");
  useEffect(() => {
    if (!inView || isNaN(num)) return;
    const decimals = value.includes(".") ? 1 : 0;
    const c = animate(0, num, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setDisplay(v.toFixed(decimals)) });
    return () => c.stop();
  }, [inView, num, value]);
  return (
    <span ref={ref}>
      {display}
      {!isNaN(num) && suffix}
    </span>
  );
}

export function Story() {
  const story = useDB((s) => s.settings.story);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = story.statement.split(" ");

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36">
      <Reveal>
        <p className="eyebrow text-accent">{story.eyebrow}</p>
      </Reveal>
      <div ref={ref}>
        <p className="display mt-6 text-[clamp(2.2rem,5.6vw,4.8rem)] leading-[1.04]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>
      </div>

      <div className="mt-16 grid gap-10 sm:mt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ParallaxImg src={story.image} alt="Inside the café" className="aspect-[4/5] rounded-card sm:aspect-[5/4] lg:aspect-[4/5]" />
        <div className="flex flex-col justify-between gap-12">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted sm:text-xl">{story.body}</p>
            <Link href="/about" className="group mt-8 inline-flex items-center gap-3 text-sm font-medium">
              <span className="h-px w-10 bg-ink transition-all duration-500 group-hover:w-16" />
              Read our story
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line">
            {story.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="bg-bg p-6 sm:p-8">
                <p className="display text-5xl sm:text-6xl">
                  <Counter value={s.value} />
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
