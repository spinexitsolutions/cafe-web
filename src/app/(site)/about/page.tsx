"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ClipImg, Lines, RollText, Rule, SectionHead } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { IMG, img } from "@/lib/seed";
import { useDB } from "@/store/db";

const TIMELINE = [
  ["2019", "One machine, one grinder", "We opened as a six-seat espresso window on Linking Road."],
  ["2020", "The roastery", "A 5 kg roaster in the back room. We’ve roasted every bean ourselves since."],
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
  ["Tara Menon", "Founder", img(IMG.avatarW1, 700)],
  ["Ishaan Kapoor", "Head roaster", img(IMG.avatarM2, 700)],
  ["Neha Shah", "Head baker", img(IMG.avatarW3, 700)],
  ["Arjun Rao", "Head barista", img(IMG.avatarM1, 700)],
];

const wrap = "px-5 sm:px-8 lg:px-12";

export default function AboutPage() {
  const story = useDB((s) => s.settings.story);
  return (
    <>
      <PageHero eyebrow="About Aura" title="A small café," italic="big obsessions." intro={story.statement} />

      <div className={wrap}>
        <ClipImg src={img(IMG.interiorBar, 2200)} alt="Inside the café" eager className="aspect-[4/5] rounded-[var(--radius)] sm:aspect-[21/9]" />
        <div className="mt-4 flex justify-between text-[12px] font-semibold text-muted">
          <span>Linking Road, Bandra — est. 2019</span>
          <span>Fig. 01</span>
        </div>
      </div>

      {/* Stats */}
      <section className={`${wrap} pt-20`}>
        <div className="grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-4">
          {story.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.8 }}
              className="bg-bg p-5 sm:p-8"
            >
              <p className="display text-[clamp(2.6rem,7vw,5rem)]">{s.value}</p>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className={`${wrap} pt-24`}>
        <SectionHead n={1} label="What we believe" title="Three rules," accent="no shortcuts." />
        <div className="mt-10 grid gap-px border-y border-ink/10 bg-ink/10 md:grid-cols-3">
          {VALUES.map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group bg-bg p-6 transition-colors duration-500 hover:bg-ink hover:text-bg sm:p-8"
            >
              <span className="text-[12px] font-bold tabular-nums text-accent">0{i + 1}</span>
              <h3 className="display mt-16 text-4xl uppercase sm:text-5xl">{t}</h3>
              <p className="mt-3 max-w-xs text-muted transition-colors group-hover:text-bg/70">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className={`${wrap} pt-24`}>
        <SectionHead n={2} label="How we got here" title="Five years," accent="one cup at a time." />
        <ul className="mt-6">
          {TIMELINE.map(([y, t, d], i) => (
            <li key={y}>
              <Rule delay={i * 0.05} />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className="group grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-4"
              >
                <span className="display text-3xl text-accent md:col-span-3 md:text-4xl">{y}</span>
                <span className="display display-n text-2xl uppercase transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-3xl">{t}</span>
                <span className="text-muted md:col-span-4">{d}</span>
              </motion.div>
            </li>
          ))}
        </ul>
        <Rule />
      </section>

      {/* Team */}
      <section className={`${wrap} pt-24`}>
        <SectionHead n={3} label="The humans" title="Who’s" accent="behind the bar." />
        <div className="mt-10 grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-4">
          {TEAM.map(([n, r, src], i) => (
            <div key={n} className="group bg-bg p-3 sm:p-4">
              <p className="pb-3 text-[11px] font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</p>
              <ClipImg src={src} alt={n} parallax={4} className="aspect-[3/4] rounded-[var(--radius)]" imgClassName="grayscale transition duration-700 group-hover:grayscale-0" />
              <p className="display display-n mt-3 text-base uppercase">{n}</p>
              <p className="text-sm text-muted">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={`${wrap} py-24`}>
        <Rule />
        <Link href="/contact" className="group mt-6 block">
          <p className="text-[13px] font-semibold">
            <span className="text-accent">(04)</span> <span className="text-muted">Careers</span>
          </p>
          <p className="display mt-4 flex flex-wrap items-center gap-x-5 text-[clamp(2.4rem,9vw,7.5rem)] uppercase leading-[0.9]">
            <span className="transition-colors group-hover:text-accent">
              <Lines text="Work with us" />
            </span>
            <span className="grid size-[0.85em] place-items-center rounded-full bg-accent text-white transition-transform duration-700 group-hover:rotate-45">
              <ArrowUpRight className="size-1/2" strokeWidth={2.5} />
            </span>
          </p>
          <p className="mt-4 max-w-md text-muted">
            We’re always looking for curious baristas, bakers and hosts. <RollText>Say hello →</RollText>
          </p>
        </Link>
      </section>
    </>
  );
}
