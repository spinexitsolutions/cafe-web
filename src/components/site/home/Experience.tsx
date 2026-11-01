"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useDB } from "@/store/db";
import { Img } from "../../motion/Img";
import { Reveal } from "../../motion/Reveal";

function StackCard({ item, i, total, progress }: { item: { title: string; text: string; image: string }; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, i === total - 1 ? 0 : 0.35]);
  return (
    <div className="sticky flex h-[85vh] items-start justify-center" style={{ top: `calc(5.5rem + ${i * 18}px)` }}>
      <motion.article style={{ scale }} className="relative h-[72vh] w-full origin-top overflow-hidden rounded-card bg-ink text-bg shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.4)]">
        <div className="grid h-full md:grid-cols-2">
          <div className="relative order-2 flex flex-col justify-between p-7 sm:p-12 md:order-1">
            <span className="eyebrow text-bg/50">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div>
              <h3 className="display text-5xl sm:text-7xl">{item.title}</h3>
              <p className="mt-4 max-w-sm text-bg/70 sm:text-lg">{item.text}</p>
            </div>
          </div>
          <div className="relative order-1 min-h-[34vh] md:order-2">
            <Img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.article>
    </div>
  );
}

export function Experience() {
  const items = useDB((s) => s.settings.experience);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8 sm:pt-32">
      <Reveal className="max-w-3xl">
        <p className="eyebrow text-accent">The experience</p>
        <h2 className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">
          A room built for <em>lingering.</em>
        </h2>
      </Reveal>
      <div ref={ref} className="relative mt-10">
        {items.map((it, i) => (
          <StackCard key={i} item={it} i={i} total={items.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
