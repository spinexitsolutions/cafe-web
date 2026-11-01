"use client";

import { MoreLink, SectionHead } from "../../motion/Kit";
import Link from "next/link";
import { fmtDate } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Img } from "../../motion/Img";
import { Reveal } from "../../motion/Reveal";

export function Journal() {
  const all = useDB((s) => s.posts);
  const posts = all.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead label="The journal" title="Notes from" accent="the bar" aside={<MoreLink href="/journal">Read all</MoreLink>} />
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <Link href={`/journal/${p.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden rounded-card">
                <Img src={p.cover} alt={p.title} className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-muted">
                {p.tags[0]} · {fmtDate(p.date)} · {p.readTime} min
              </p>
              <h3 className="display mt-2 text-3xl leading-tight transition group-hover:text-accent">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
