"use client";

import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { Img } from "../motion/Img";
import { RollText } from "../motion/Kit";
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

/** Shop grid cell — sits inside a hairline grid (`ProductGrid`). */
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const cur = useDB((s) => s.settings.site.currency);
  const quickAdd = useQuickAdd();
  const wished = useCart((s) => s.wishlist.includes(p.id));
  const toggleWish = useCart((s) => s.toggleWish);
  const soldOut = p.stock <= 0;
  const alt = p.gallery[0];
  const sale = p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.07 }}
      className="group relative flex flex-col bg-bg p-3 transition-colors duration-500 hover:bg-surface sm:p-4"
    >
      <div className="flex items-center justify-between pb-3 text-[11px] font-bold tabular-nums">
        <span className="text-muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex gap-1.5">
          {sale > 0 && <span className="rounded-[4px] bg-accent px-1.5 py-0.5 text-white">−{sale}%</span>}
          {p.tags.slice(0, sale ? 1 : 2).map((t) => (
            <span key={t} className="rounded-[4px] bg-ink/[0.07] px-1.5 py-0.5 uppercase tracking-wide">
              {TAG_LABEL[t] ?? t}
            </span>
          ))}
        </span>
      </div>

      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        whileInView={{ clipPath: "inset(0 0 0% 0)" }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: (index % 4) * 0.07 }}
        className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-soft"
      >
        <Link href={`/product/${p.slug}`} className="absolute inset-0" aria-label={p.name}>
          <Img src={p.image} alt={p.name} className={cn("absolute inset-0 h-full w-full object-cover duration-[1.2s] group-hover:scale-[1.05]", alt && "group-hover:opacity-0")} />
          {alt && <Img src={alt} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover !opacity-0 transition duration-700 group-hover:scale-100 group-hover:!opacity-100" />}
        </Link>
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/60">
            <span className="display display-n -rotate-6 border-2 border-ink px-3 py-1 text-sm uppercase">Sold out</span>
          </div>
        )}
        <button
          onClick={() => toggleWish(p.id)}
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-bg/90 backdrop-blur transition hover:scale-110"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <motion.span key={String(wished)} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
            <Heart className={cn("size-4", wished && "fill-accent text-accent")} />
          </motion.span>
        </button>
        {!soldOut && (
          <button
            onClick={() => quickAdd(p)}
            className="absolute inset-x-2.5 bottom-2.5 flex h-11 items-center justify-between rounded-[calc(var(--radius)-2px)] bg-ink px-4 text-sm font-semibold text-bg transition duration-500 ease-[cubic-bezier(.76,0,.24,1)] hover:bg-accent lg:translate-y-[130%] lg:group-hover:translate-y-0"
            aria-label={`Add ${p.name} to bag`}
          >
            <span className="sm:hidden">{p.variants.length ? "Options" : "Add"}</span>
            <span className="hidden sm:inline-flex">
              <RollText>{p.variants.length ? "Choose options" : "Add to bag"}</RollText>
            </span>
            <Plus className="size-4" />
          </button>
        )}
      </motion.div>

      <Link href={`/product/${p.slug}`} className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="display display-n text-[13px] uppercase leading-tight sm:text-base">{p.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted">{p.notes ?? p.description}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
            <Star className="size-3 fill-ink text-ink" /> {p.rating.toFixed(1)} ({p.reviewCount})
          </p>
        </div>
        <div className="order-first flex shrink-0 items-baseline gap-2 sm:order-none sm:block sm:text-right">
          <p className="font-bold tabular-nums">{money(p.price, cur)}</p>
          {sale > 0 && <p className="text-xs text-muted line-through">{money(p.comparePrice!, cur)}</p>}
        </div>
      </Link>
    </motion.article>
  );
}

/** Hairline grid that product cells sit in. */
export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-3 xl:grid-cols-4", className)}>{children}</div>;
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
