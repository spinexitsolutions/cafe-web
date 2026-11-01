"use client";

import { MoreLink, SectionHead } from "../../motion/Kit";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useDB } from "@/store/db";
import { Img } from "../../motion/Img";
import { Reveal } from "../../motion/Reveal";

export function Gallery() {
  const items = useDB((s) => s.gallery);
  const insta = useDB((s) => s.settings.site.instagram);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const ys = [y1, y2, y3];
  const split = (n: number) => Array.from({ length: n }, (_, c) => items.filter((_, i) => i % n === c));

  const Figure = ({ g }: { g: (typeof items)[number] }) => (
    <figure className="group relative overflow-hidden rounded-[22px]">
      <Img
        src={g.image}
        alt={g.caption}
        className={`w-full object-cover transition duration-[1.2s] group-hover:scale-105 ${g.span === "tall" ? "aspect-[3/4]" : g.span === "wide" ? "aspect-[4/3]" : "aspect-square"}`}
      />
      <figcaption className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-bg/90 px-4 py-2 text-xs font-medium opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        {g.caption}
      </figcaption>
    </figure>
  );

  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          label="Gallery"
          title="Moments at"
          accent="Aura"
          aside={
            <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer" className="border-b border-ink/25 pb-1 text-sm font-semibold">
              @{insta} ↗
            </a>
          }
        />
        <div ref={ref} className="mt-12">
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {split(2).map((col, c) => (
              <motion.div key={c} style={{ y: ys[c] }} className="flex flex-col gap-3">
                {col.map((g) => (
                  <Figure key={g.id} g={g} />
                ))}
              </motion.div>
            ))}
          </div>
          <div className="hidden grid-cols-3 gap-4 md:grid">
            {split(3).map((col, c) => (
              <motion.div key={c} style={{ y: ys[c] }} className="flex flex-col gap-4">
                {col.map((g) => (
                  <Figure key={g.id} g={g} />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
