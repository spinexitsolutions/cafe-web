"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipImg } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { cn, fmtDate } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function JournalPage() {
  const all = useDB((s) => s.posts);
  const posts = useMemo(() => all.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date)), [all]);
  const tags = useMemo(() => ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))], [posts]);
  const [tag, setTag] = useState("All");
  const [hover, setHover] = useState<string | null>(null);
  const list = posts.filter((p) => tag === "All" || p.tags.includes(tag));
  const [lead, ...rest] = list;
  const preview = rest.find((p) => p.id === hover) ?? rest[0];

  return (
    <>
      <PageHero eyebrow="The journal" title="Notes from" italic="the bar." intro="Brewing guides, farm stories and the occasional love letter to butter." />
      <div className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/10 pb-3">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(t)} className={cn("relative pb-1.5 text-[15px] font-semibold transition-colors", tag === t ? "text-ink" : "text-muted hover:text-ink")}>
              {t}
              {tag === t && <motion.span layoutId="j-tag" className="absolute inset-x-0 -bottom-[13px] h-[3px] bg-accent" />}
            </button>
          ))}
        </div>

        {lead && (
          <Link href={`/journal/${lead.slug}`} className="group mt-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <ClipImg src={lead.cover} alt={lead.title} className="aspect-[16/10] rounded-[var(--radius)] lg:col-span-7" />
            <div className="lg:col-span-5">
              <p className="text-[12px] font-semibold">
                <span className="text-accent">(Latest)</span> <span className="text-muted">{lead.tags.join(" · ")} · {fmtDate(lead.date)}</span>
              </p>
              <h2 className="display mt-3 text-[clamp(2rem,4.6vw,3.8rem)] uppercase leading-[0.95] transition-colors group-hover:text-accent">{lead.title}</h2>
              <p className="mt-4 text-muted">{lead.excerpt}</p>
              <p className="mt-5 text-sm font-semibold">By {lead.author} · {lead.readTime} min read</p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-20 grid gap-10 lg:grid-cols-12">
            <ul className="lg:col-span-8" onMouseLeave={() => setHover(null)}>
              <li className="grid grid-cols-12 border-b border-ink/10 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                <span className="col-span-2">No.</span>
                <span className="col-span-7">Title</span>
                <span className="col-span-3 text-right">Read</span>
              </li>
              {rest.map((p, i) => (
                <li key={p.id} className="border-b border-ink/10">
                  <Link href={`/journal/${p.slug}`} onMouseEnter={() => setHover(p.id)} className="group grid grid-cols-12 items-baseline gap-2 py-5">
                    <span className="col-span-2 text-[12px] font-bold tabular-nums text-muted">{String(i + 2).padStart(2, "0")}</span>
                    <span className="col-span-8 sm:col-span-7">
                      <span className="display display-n block text-xl uppercase leading-tight transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-accent sm:text-2xl">{p.title}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {p.tags[0]} · {fmtDate(p.date)}
                      </span>
                    </span>
                    <span className="col-span-2 flex items-center justify-end gap-2 text-sm font-semibold sm:col-span-3">
                      <span className="hidden sm:inline">{p.readTime} min</span>
                      <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24 aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
                <AnimatePresence initial={false}>
                  {preview && (
                    <motion.img
                      key={preview.id}
                      src={preview.cover}
                      alt=""
                      initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                      animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
