"use client";

import { motion } from "framer-motion";
import { ChevronDown, Truck, Leaf, Gift } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { cn, money } from "@/lib/utils";
import { useDB } from "@/store/db";

const SORTS = {
  featured: "Featured",
  new: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
} as const;

export default function ShopPage() {
  const allCats = useDB((s) => s.categories);
  const products = useDB((s) => s.products);
  const site = useDB((s) => s.settings.site);
  const cats = useMemo(() => allCats.filter((c) => c.type === "shop").sort((a, b) => a.order - b.order), [allCats]);
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("featured");
  const [inStock, setInStock] = useState(false);

  const list = useMemo(() => {
    const l = products.filter((p) => p.active && p.type === "shop" && (cat === "all" || p.categoryId === cat) && (!inStock || p.stock > 0));
    const by = {
      featured: (a: typeof l[0], b: typeof l[0]) => Number(b.featured) - Number(a.featured),
      new: (a: typeof l[0], b: typeof l[0]) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a: typeof l[0], b: typeof l[0]) => a.price - b.price,
      "price-desc": (a: typeof l[0], b: typeof l[0]) => b.price - a.price,
      rating: (a: typeof l[0], b: typeof l[0]) => b.rating - a.rating,
    }[sort];
    return [...l].sort(by);
  }, [products, cat, sort, inStock]);

  return (
    <>
      <PageHero eyebrow="The roastery shop" title="Beans, gear" italic="& gifts." intro="Fresh-roasted coffee shipped across India, the tools we use behind the bar, and thoughtful gifts for the coffee people in your life." />

      <div className="mx-auto grid max-w-7xl gap-3 px-5 sm:grid-cols-3 sm:px-8">
        {[
          { icon: Truck, t: `Free shipping over ${money(site.freeDeliveryAbove, site.currency)}`, s: "Dispatched in 48 hours" },
          { icon: Leaf, t: "Direct trade", s: "Traced to 12 partner farms" },
          { icon: Gift, t: "Gift wrapping", s: "With a handwritten note" },
        ].map(({ icon: Icon, t, s }) => (
          <div key={t} className="flex items-center gap-4 rounded-[22px] bg-surface p-4 ring-1 ring-line">
            <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{t}</p>
              <p className="text-xs text-muted">{s}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
          <div className="-mx-5 flex gap-1 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
            {[{ id: "all", name: "All" }, ...cats].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn("relative shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors", cat === c.id ? "text-bg" : "text-muted hover:text-ink")}
              >
                {cat === c.id && <motion.span layoutId="shop-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 accent-[var(--accent)]" />
              In stock
            </label>
            <label className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="h-11 appearance-none rounded-full bg-surface pl-4 pr-10 text-sm ring-1 ring-line outline-none">
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </label>
          </div>
        </div>
        <p className="mt-5 text-sm text-muted">{list.length} products</p>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
