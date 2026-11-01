"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipImg, Lines, RollText, Rule } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard, ProductGrid } from "@/components/site/ProductCard";
import { useQuickAdd } from "@/components/site/ProductSheet";
import type { Product } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { useDB } from "@/store/db";

const SORTS = {
  featured: "Featured",
  new: "Newest",
  "price-asc": "Price, low → high",
  "price-desc": "Price, high → low",
  rating: "Top rated",
} as const;

const BY: Record<keyof typeof SORTS, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
};

function Feature({ p }: { p: Product }) {
  const site = useDB((s) => s.settings.site);
  const quickAdd = useQuickAdd();
  const perks = [
    ["Free shipping", `On orders over ${money(site.freeDeliveryAbove, site.currency)}`],
    ["Roasted to order", "Dispatched within 48 hours"],
    ["Gift wrapping", "With a handwritten note"],
  ];
  return (
    <section className="px-5 pb-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Rule />
        <div className="grid gap-8 pt-5 lg:grid-cols-12 lg:gap-x-10">
          <p className="text-[13px] font-semibold lg:col-span-12">
            <span className="text-accent">(★)</span> <span className="text-muted">Roast of the month</span>
          </p>
          <Link href={`/product/${p.slug}`} className="group relative lg:col-span-7">
            <ClipImg src={(p.gallery[0] ?? p.image).replace("w=1000", "w=1600")} alt={p.name} className="aspect-[4/3] rounded-[var(--radius)]" parallax={6} />
            <span className="absolute left-4 top-4 rounded-full bg-bg px-3 py-1.5 text-xs font-bold">{p.notes?.split("·")[0]?.trim() ?? "New roast"}</span>
          </Link>
          <div className="flex flex-col lg:col-span-5">
            <h2 className="display text-[clamp(2.4rem,6vw,4.6rem)] uppercase">
              <Lines text={p.name} />
            </h2>
            <p className="mt-4 text-sm font-semibold text-accent">{p.notes}</p>
            <p className="mt-4 max-w-md leading-relaxed text-muted">{p.longDescription}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="display text-5xl">{money(p.price, site.currency)}</span>
              {p.comparePrice && <span className="text-muted line-through">{money(p.comparePrice, site.currency)}</span>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button onClick={() => quickAdd(p)} className="group flex h-12 items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-sm font-semibold text-bg transition hover:bg-accent">
                <RollText>{p.variants.length ? "Choose weight & grind" : "Add to bag"}</RollText>
                <span className="grid size-9 place-items-center rounded-full bg-bg/15 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
              <Link href={`/product/${p.slug}`} className="group flex h-12 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink">
                <RollText>Read the notes</RollText>
              </Link>
            </div>
            <ul className="mt-auto pt-10">
              {perks.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2.5rem_1fr] border-t border-ink/10 py-3 text-sm">
                  <span className="font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <b className="font-semibold">{t}</b> <span className="text-muted">— {d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ShopPage() {
  const allCats = useDB((s) => s.categories);
  const products = useDB((s) => s.products);
  const shop = useMemo(() => products.filter((p) => p.active && p.type === "shop"), [products]);
  const cats = useMemo(() => allCats.filter((c) => c.type === "shop").sort((a, b) => a.order - b.order), [allCats]);
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("featured");
  const [inStock, setInStock] = useState(false);

  const list = useMemo(
    () => [...shop.filter((p) => (cat === "all" || p.categoryId === cat) && (!inStock || p.stock > 0))].sort(BY[sort]),
    [shop, cat, sort, inStock],
  );
  const feature = shop.find((p) => p.featured && p.categoryId === "c-beans") ?? shop[0];
  const fillers = (n: number, cols: number) => (n % cols ? cols - (n % cols) : 0);

  return (
    <>
      <PageHero eyebrow="The roastery shop" title="Beans, gear" italic="& gifts." intro="Fresh-roasted coffee shipped across India, the tools we use behind the bar, and thoughtful gifts for the coffee people in your life." />

      {feature && <Feature p={feature} />}

      {/* Filter bar */}
      <div className="sticky top-0 z-30 border-y border-ink/10 bg-bg/90 backdrop-blur-xl lg:top-0">
        <div className="flex flex-col gap-3 px-5 py-3 sm:px-8 md:flex-row md:items-center md:justify-between lg:pl-12 lg:pr-48">
          <div className="-mx-5 flex gap-6 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
            {[{ id: "all", name: "All" }, ...cats].map((c) => {
              const n = c.id === "all" ? shop.length : shop.filter((p) => p.categoryId === c.id).length;
              const active = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} className={cn("group relative shrink-0 py-2 text-[15px] font-semibold transition-colors", active ? "text-ink" : "text-muted hover:text-ink")}>
                  <RollText>{c.name}</RollText>
                  <sup className="ml-1 text-[10px] tabular-nums">{n}</sup>
                  {active && <motion.span layoutId="shop-underline" className="absolute inset-x-0 -bottom-[13px] h-[3px] bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-5 text-sm font-semibold">
            <button onClick={() => setInStock(!inStock)} className="flex items-center gap-2" aria-pressed={inStock}>
              <span className={cn("relative h-5 w-9 rounded-full transition-colors", inStock ? "bg-accent" : "bg-ink/15")}>
                <motion.span layout className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow", inStock ? "right-0.5" : "left-0.5")} />
              </span>
              In stock only
            </button>
            <label className="relative flex items-center gap-1">
              <span className="text-muted">Sort:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="appearance-none bg-transparent pr-5 outline-none">
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 size-4" />
            </label>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <p className="pb-4 text-sm text-muted">
          Showing <b className="text-ink">{list.length}</b> of {shop.length}
        </p>
        <AnimatePresence mode="wait">
          <motion.div key={`${cat}-${sort}-${inStock}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            {list.length === 0 ? (
              <p className="border-y border-ink/10 py-24 text-center text-muted">Nothing here right now — try another filter.</p>
            ) : (
              <ProductGrid>
                {list.map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i} />
                ))}
                {/* fill the last row so the hairline grid stays clean */}
                {Array.from({ length: fillers(list.length, 4) }).map((_, i) => (
                  <div key={`f${i}`} className="hidden bg-bg xl:block" />
                ))}
                {Array.from({ length: fillers(list.length, 3) }).map((_, i) => (
                  <div key={`g${i}`} className="hidden bg-bg lg:block xl:hidden" />
                ))}
                {Array.from({ length: fillers(list.length, 2) }).map((_, i) => (
                  <div key={`h${i}`} className="bg-bg lg:hidden" />
                ))}
              </ProductGrid>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subscription band */}
      <section className="bg-ink px-5 py-20 text-bg sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Rule dark />
          <div className="grid gap-10 pt-5 lg:grid-cols-12">
            <p className="text-[13px] font-semibold lg:col-span-3">
              <span className="text-accent">(∞)</span> <span className="text-bg/50">Subscription</span>
            </p>
            <div className="lg:col-span-9">
              <h2 className="display text-[clamp(2.4rem,7vw,5.5rem)] uppercase">
                <Lines text="Never run out." />{" "}
                <em>
                  <Lines text="Save 15%." delay={0.1} />
                </em>
              </h2>
              <div className="mt-10 grid gap-px bg-bg/10 sm:grid-cols-3">
                {[
                  ["Pick your beans", "Any roast, any grind, from 250 g."],
                  ["Choose a rhythm", "Every 2, 3 or 4 weeks. Pause anytime."],
                  ["Brew & repeat", "Fresh bags at your door, 15% off each."],
                ].map(([t, d], i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="bg-ink p-6"
                  >
                    <span className="display text-4xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-6 text-lg font-semibold">{t}</p>
                    <p className="mt-1 text-sm text-bg/60">{d}</p>
                  </motion.div>
                ))}
              </div>
              <Link href="/contact" className="group mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-accent pl-6 pr-1.5 text-sm font-semibold text-white">
                <RollText>Start a subscription</RollText>
                <span className="grid size-9 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
