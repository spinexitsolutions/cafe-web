"use client";

import { MoreLink, SectionHead } from "../../motion/Kit";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Reveal } from "../../motion/Reveal";

export function Testimonials() {
  const list = useDB((s) => s.testimonials);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setI((x) => (x + d + list.length) % list.length);
  };
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, list.length]);
  if (!list.length) return null;
  const t = list[i % list.length];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead label="Kind words" title="Said over" accent="coffee." />
      <Reveal className="mt-8 flex items-center justify-end">
        <div className="flex gap-2">
          <button onClick={() => go(-1)} className="grid size-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-ink hover:text-bg" aria-label="Previous">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={() => go(1)} className="grid size-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-ink hover:text-bg" aria-label="Next">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </Reveal>

      <div className="relative mt-10 min-h-[22rem] sm:min-h-[20rem]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure
            key={t.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -60, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => Math.abs(info.offset.x) > 60 && go(info.offset.x < 0 ? 1 : -1)}
            className="cursor-grab active:cursor-grabbing"
          >
            <div className="flex gap-1 text-accent">
              {Array.from({ length: t.rating }).map((_, k) => (
                <Star key={k} className="size-5 fill-current" />
              ))}
            </div>
            <blockquote className="display mt-6 text-[clamp(1.9rem,4.6vw,3.8rem)] leading-[1.08]">“{t.quote}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.avatar} alt="" className="size-14 rounded-full object-cover" />
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-10 flex gap-2">
        {list.map((x, k) => (
          <button key={x.id} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} className="h-1 flex-1 overflow-hidden rounded-full bg-line" aria-label={`Show testimonial ${k + 1}`}>
            <span className={cn("block h-full bg-ink transition-all duration-700", k === i ? "w-full" : k < i ? "w-full opacity-30" : "w-0")} />
          </button>
        ))}
      </div>
    </section>
  );
}
