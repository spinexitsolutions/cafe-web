"use client";

import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { Img } from "../motion/Img";
import { useQuickAdd } from "./ProductSheet";

const TAG_LABEL: Record<string, string> = {
  bestseller: "Bestseller",
  new: "New",
  vegan: "Vegan",
  seasonal: "Seasonal",
  signature: "Signature",
  "gluten-free": "GF",
};

export function Tag({ t, className }: { t: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
        t.startsWith("−") ? "bg-accent text-white" : "bg-bg/85 text-ink",
        className,
      )}
    >
      {TAG_LABEL[t] ?? t}
    </span>
  );
}

/** Tall card used in shop / featured grids */
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const cur = useDB((s) => s.settings.site.currency);
  const quickAdd = useQuickAdd();
  const wished = useCart((s) => s.wishlist.includes(p.id));
  const toggleWish = useCart((s) => s.toggleWish);
  const soldOut = p.stock <= 0;
  const alt = p.gallery[0];
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-soft">
        <Link href={`/product/${p.slug}`} className="absolute inset-0" aria-label={p.name}>
          <Img src={p.image} alt={p.name} className={cn("absolute inset-0 h-full w-full object-cover duration-[1.2s] group-hover:scale-[1.04]", alt && "group-hover:opacity-0")} />
          {alt && <Img src={alt} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover !opacity-0 transition duration-700 group-hover:scale-100 group-hover:!opacity-100" />}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 pr-14">
          {p.comparePrice && p.comparePrice > p.price && <Tag t={`−${Math.round((1 - p.price / p.comparePrice) * 100)}%`} />}
          {p.tags.slice(0, 2).map((t) => (
            <Tag key={t} t={t} />
          ))}
        </div>
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-bg">Sold out</span>
          </div>
        )}
        <button
          onClick={() => toggleWish(p.id)}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-bg/85 backdrop-blur transition hover:scale-105"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <motion.span key={String(wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart className={cn("size-[18px]", wished && "fill-accent text-accent")} />
          </motion.span>
        </button>
        {!soldOut && (
          <button
            onClick={() => quickAdd(p)}
            className="absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full bg-ink pl-3.5 pr-4 text-sm font-medium text-bg shadow-lg transition duration-500 hover:bg-accent sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            aria-label={`Add ${p.name} to bag`}
          >
            <Plus className="size-4" /> Add
          </button>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <Link href={`/product/${p.slug}`}>
            <h3 className="truncate font-medium">{p.name}</h3>
          </Link>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">{p.notes ?? p.description}</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="size-3 fill-accent text-accent" /> {p.rating.toFixed(1)} · {p.reviewCount}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-medium tabular-nums">{money(p.price, cur)}</p>
          {p.comparePrice && p.comparePrice > p.price && <p className="text-xs text-muted line-through">{money(p.comparePrice, cur)}</p>}
        </div>
      </div>
    </motion.article>
  );
}

/** Menu-board row: thumbnail, name … dotted leader … price, and a round add button. */
export function MenuRow({ p }: { p: Product }) {
  const cur = useDB((s) => s.settings.site.currency);
  const quickAdd = useQuickAdd();
  const soldOut = p.stock <= 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-ink/12 py-4"
    >
      <span className="pointer-events-none absolute inset-y-0 -left-3 -right-3 -z-10 origin-left scale-x-0 rounded-[var(--radius)] bg-surface transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-100" />
      <Link href={`/product/${p.slug}`} className="relative size-[4.5rem] overflow-hidden rounded-[var(--radius)] sm:size-20">
        <Img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      </Link>
      <div className="min-w-0">
        <Link href={`/product/${p.slug}`} className="flex items-baseline gap-2">
          <h3 className="truncate text-[17px] font-semibold leading-tight sm:text-lg">{p.name}</h3>
          <span className="hidden h-0 min-w-6 flex-1 translate-y-[-0.25em] border-b-2 border-dotted border-ink/20 sm:block" />
          <span className="hidden shrink-0 font-bold tabular-nums sm:block">{money(p.price, cur)}</span>
        </Link>
        <p className="mt-1 line-clamp-1 text-sm text-muted">{p.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="font-bold tabular-nums text-ink sm:hidden">{money(p.price, cur)}</span>
          {p.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-ink/[0.06] px-2 py-0.5 capitalize text-ink/70">
              {t.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>
      <button
        disabled={soldOut}
        onClick={() => quickAdd(p)}
        aria-label={soldOut ? `${p.name} sold out` : `Add ${p.name}`}
        className="grid size-11 place-items-center rounded-full ring-1 ring-ink/20 transition duration-300 hover:rotate-90 hover:bg-accent hover:text-white hover:ring-accent active:scale-90 disabled:opacity-30 disabled:hover:rotate-0 disabled:hover:bg-transparent"
      >
        <Plus className="size-5" />
      </button>
    </motion.div>
  );
}
