"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Img } from "@/components/motion/Img";
import { ParallaxImg } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { IMG, img } from "@/lib/seed";
import { useDB } from "@/store/db";

const TIMELINE = [
  ["2019", "One machine, one grinder", "We opened as a six-seat espresso window on Linking Road."],
  ["2020", "The roastery", "A 5kg roaster in the back room. We’ve roasted every bean ourselves since."],
  ["2022", "The bakery", "Chef Neha joined, and the croissant queue began."],
  ["2024", "The garden", "We took over the courtyard next door — and planted a neem tree."],
  ["Today", "Still slow", "Twelve partner farms, forty humans, one obsession."],
];
const VALUES = [
  ["Traceable", "Every bean traced to the farm, every farmer paid above fair-trade price."],
  ["Seasonal", "Our menu follows the markets — what’s best this week, not all year."],
  ["Unhurried", "No timers on tables. Stay for one cup, or the whole afternoon."],
];
const TEAM = [
  ["Tara Menon", "Founder", img(IMG.avatarW1, 600)],
  ["Ishaan Kapoor", "Head roaster", img(IMG.avatarM2, 600)],
  ["Neha Shah", "Head baker", img(IMG.avatarW3, 600)],
  ["Arjun Rao", "Head barista", img(IMG.avatarM1, 600)],
];

export default function AboutPage() {
  const story = useDB((s) => s.settings.story);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const line = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <>
      <PageHero eyebrow="About Aura" title="A small café with" italic="big obsessions." intro={story.statement} />
      <ParallaxImg src={img(IMG.interiorBar, 2000)} alt="The café" className="mx-3 aspect-[4/5] rounded-card sm:mx-5 sm:aspect-[21/9]" eager />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-24 sm:px-8 md:grid-cols-3">
        {VALUES.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.08} className="rounded-card bg-surface p-8 ring-1 ring-line">
            <span className="eyebrow text-accent">0{i + 1}</span>
            <h3 className="display mt-6 text-5xl">{t}</h3>
            <p className="mt-3 text-muted">{d}</p>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <h2 className="display text-[clamp(2.8rem,7vw,5.5rem)]">How we <em>got here</em></h2>
        <div ref={ref} className="relative mt-12 pl-8 sm:pl-12">
          <div className="absolute bottom-0 left-2 top-0 w-px bg-line sm:left-4" />
          <motion.div style={{ height: line }} className="absolute left-2 top-0 w-px bg-accent sm:left-4" />
          {TIMELINE.map(([y, t, d]) => (
            <Reveal key={y} className="relative pb-14 last:pb-0">
              <span className="absolute -left-[1.85rem] top-2 size-3 rounded-full bg-accent ring-4 ring-bg sm:-left-[2.35rem]" />
              <p className="eyebrow text-muted">{y}</p>
              <h3 className="display mt-2 text-4xl sm:text-5xl">{t}</h3>
              <p className="mt-2 max-w-lg text-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <h2 className="display text-[clamp(2.8rem,7vw,5.5rem)]">The <em>humans</em></h2>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TEAM.map(([n, r, src], i) => (
            <Reveal key={n} delay={i * 0.06} className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-card">
                <Img src={src} alt={n} className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <p className="mt-4 font-medium">{n}</p>
              <p className="text-sm text-muted">{r}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-20 flex flex-col items-center text-center">
          <p className="display max-w-2xl text-4xl sm:text-5xl">Want to join the team? We’re always looking for curious people.</p>
          <Link href="/contact" className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg">Get in touch</Link>
        </div>
      </section>
    </>
  );
}
