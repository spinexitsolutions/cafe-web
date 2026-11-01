"use client";

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
      <Reveal className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-accent">The journal</p>
          <h2 className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">
            Notes from <em>the bar</em>
          </h2>
        </div>
        <Link href="/journal" className="mb-3 hidden rounded-full px-5 py-3 text-sm font-medium ring-1 ring-line transition hover:bg-ink hover:text-bg sm:block">
          Read all
        </Link>
      </Reveal>
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
