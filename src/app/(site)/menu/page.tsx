"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { MenuRow } from "@/components/site/ProductCard";
import { cn, openStatus } from "@/lib/utils";
import { useDB } from "@/store/db";

const FILTERS = [
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "bestseller", label: "Bestsellers" },
  { id: "new", label: "New" },
];

export default function MenuPage() {
  const allCats = useDB((s) => s.categories);
  const products = useDB((s) => s.products);
  const site = useDB((s) => s.settings.site);
  const cats = useMemo(() => allCats.filter((c) => c.type === "menu").sort((a, b) => a.order - b.order), [allCats]);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [active, setActive] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setStatus(openStatus(site.hours).label), [site.hours]);

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          p.active &&
          p.type === "menu" &&
          (!q || `${p.name} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) &&
          filters.every((f) => p.tags.includes(f)),
      ),
    [products, q, filters],
  );

  // scroll-spy
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [list, cats]);

  useEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const jump = (id: string) => {
    const el = refs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 150;
    if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <PageHero eyebrow={`The menu · ${status || "Today"}`} title="Made to" italic="order." intro="Everything is prepared the moment you order — coffee pulled, toast buttered, cakes sliced. Pick up in minutes or get it delivered warm." />

      <div className="sticky top-[4.75rem] z-30 sm:top-[5.25rem]">
        <div className="mx-auto max-w-7xl px-3 sm:px-8">
          <div className="flex flex-col gap-2 rounded-[26px] bg-bg/90 backdrop-blur-xl p-1.5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] ring-1 ring-line md:flex-row md:items-center">
            <div ref={tabsRef} className="flex gap-1 overflow-x-auto no-scrollbar">
              {cats.map((c) => (
                <button
                  key={c.id}
                  data-cat={c.id}
                  onClick={() => jump(c.id)}
                  className={cn("relative shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors", active === c.id ? "text-bg" : "text-muted hover:text-ink")}
                >
                  {active === c.id && <motion.span layoutId="menu-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{c.name}</span>
                </button>
              ))}
            </div>
            <label className="flex h-11 items-center gap-2 rounded-full bg-surface px-4 ring-1 ring-line md:ml-auto md:w-64">
              <Search className="size-4 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the menu" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              {q && (
                <button onClick={() => setQ("")} aria-label="Clear search">
                  <X className="size-4 text-muted" />
                </button>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const on = filters.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setFilters(on ? filters.filter((x) => x !== f.id) : [...filters, f.id])}
                className={cn("rounded-full px-4 py-2 text-xs font-medium ring-1 transition", on ? "bg-accent text-white ring-accent" : "ring-line hover:ring-ink/30")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="py-24 text-center">
            <p className="display text-4xl">Nothing matches that.</p>
            <p className="mt-2 text-muted">Try another search or clear the filters.</p>
          </div>
        )}

        {cats.map((c) => {
          const items = list.filter((p) => p.categoryId === c.id);
          if (!items.length) return null;
          return (
            <section key={c.id} id={c.id} ref={(el) => { refs.current[c.id] = el; }} className="pt-14">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <h2 className="display text-4xl sm:text-6xl">{c.name}</h2>
                <span className="eyebrow text-muted">{items.length} items</span>
              </div>
              <motion.div layout className="mt-6 grid gap-3 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {items.map((p) => (
                    <MenuRow key={p.id} p={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          );
        })}
      </div>
    </>
  );
}
