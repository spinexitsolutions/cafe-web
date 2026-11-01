"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Img } from "@/components/motion/Img";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { cn, fmtDate } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function JournalPage() {
  const all = useDB((s) => s.posts);
  const posts = useMemo(() => all.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date)), [all]);
  const tags = useMemo(() => ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))], [posts]);
  const [tag, setTag] = useState("All");
  const list = posts.filter((p) => tag === "All" || p.tags.includes(tag));
  const [lead, ...rest] = list;
  return (
    <>
      <PageHero eyebrow="The journal" title="Notes from" italic="the bar." intro="Brewing guides, farm stories and the occasional love letter to butter." />
      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(t)} className={cn("rounded-full px-4 py-2 text-sm ring-1 transition", tag === t ? "bg-ink text-bg ring-ink" : "ring-line")}>{t}</button>
          ))}
        </div>
        {lead && (
          <Reveal>
            <Link href={`/journal/${lead.slug}`} className="group mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div className="aspect-[16/10] overflow-hidden rounded-card">
                <Img src={lead.cover} alt={lead.title} className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
              </div>
              <div>
                <p className="eyebrow text-muted">{lead.tags.join(" · ")} · {fmtDate(lead.date)}</p>
                <h2 className="display mt-3 text-5xl leading-[1] transition group-hover:text-accent sm:text-6xl">{lead.title}</h2>
                <p className="mt-4 text-muted">{lead.excerpt}</p>
                <p className="mt-4 text-sm">By {lead.author} · {lead.readTime} min read</p>
              </div>
            </Link>
          </Reveal>
        )}
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.06}>
              <Link href={`/journal/${p.slug}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-card">
                  <Img src={p.cover} alt={p.title} className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-5 text-muted">{p.tags[0]} · {fmtDate(p.date)}</p>
                <h3 className="display mt-2 text-3xl transition group-hover:text-accent">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
