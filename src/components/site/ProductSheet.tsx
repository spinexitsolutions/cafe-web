"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import type { Product } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { lockScroll } from "./SmoothScroll";

export const useSheet = create<{ id: string | null; show: (id: string) => void; hide: () => void }>((set) => ({
  id: null,
  show: (id) => set({ id }),
  hide: () => set({ id: null }),
}));

/** Add to bag directly, or open the customiser when the product has options. */
export function useQuickAdd() {
  const add = useCart((s) => s.add);
  const show = useSheet((s) => s.show);
  return (p: Product) => {
    if (p.variants.length) return show(p.id);
    add({ productId: p.id, slug: p.slug, name: p.name, image: p.image, unitPrice: p.price, options: [] });
  };
}

export function useVariantPicker(p: Product | undefined) {
  const [sel, setSel] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!p) return;
    setSel(Object.fromEntries(p.variants.map((g) => [g.id, g.options[0]?.id])));
  }, [p]);
  const { unit, labels } = useMemo(() => {
    if (!p) return { unit: 0, labels: [] as string[] };
    let unit = p.price;
    const labels: string[] = [];
    for (const g of p.variants) {
      const o = g.options.find((x) => x.id === sel[g.id]);
      if (o) {
        unit += o.priceDelta;
        labels.push(o.label);
      }
    }
    return { unit, labels };
  }, [p, sel]);
  return { sel, setSel, unit, labels };
}

export function VariantGroups({ p, sel, setSel, cur }: { p: Product; sel: Record<string, string>; setSel: (s: Record<string, string>) => void; cur: string }) {
  return (
    <div className="space-y-6">
      {p.variants.map((g) => (
        <fieldset key={g.id}>
          <legend className="eyebrow mb-3 text-muted">{g.name}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => {
              const active = sel[g.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSel({ ...sel, [g.id]: o.id })}
                  className={cn(
                    "relative rounded-full px-4 py-2.5 text-sm transition",
                    active ? "text-bg" : "bg-surface text-ink ring-1 ring-line hover:ring-ink/30",
                  )}
                >
                  {active && <motion.span layoutId={`opt-${p.id}-${g.id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative">
                    {o.label}
                    {o.priceDelta > 0 && <span className={cn("ml-1.5 text-xs", active ? "text-bg/60" : "text-muted")}>+{money(o.priceDelta, cur)}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function ProductSheet() {
  const { id, hide } = useSheet();
  const p = useDB((s) => s.products.find((x) => x.id === id));
  const cur = useDB((s) => s.settings.site.currency);
  const add = useCart((s) => s.add);
  const { sel, setSel, unit, labels } = useVariantPicker(p);
  const [qty, setQty] = useState(1);
  useEffect(() => {
    setQty(1);
    lockScroll(!!id);
  }, [id]);

  return (
    <AnimatePresence>
      {p && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={hide} />
          <motion.div
            role="dialog"
            aria-label={p.name}
            className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex max-h-[94dvh] max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-bg sm:bottom-6 sm:rounded-[32px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && hide()}
          >
            <div className="overflow-y-auto overscroll-contain" data-lenis-prevent>
              <div className="relative h-64 sm:h-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
                <div className="absolute left-1/2 top-2.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/70" />
                <button onClick={hide} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-bg/80 backdrop-blur" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              <div className="-mt-10 px-6 pb-6">
                <h3 className="display relative text-4xl">{p.name}</h3>
                <p className="mt-2 text-muted">{p.description}</p>
                {p.notes && <p className="eyebrow mt-3 text-accent">{p.notes}</p>}
                <div className="mt-6">
                  <VariantGroups p={p} sel={sel} setSel={setSel} cur={cur} />
                </div>
                <Link href={`/product/${p.slug}`} onClick={hide} className="mt-6 inline-block text-sm text-muted underline underline-offset-4">
                  Full details & reviews
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-line bg-bg px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex h-14 items-center rounded-full bg-surface ring-1 ring-line">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-12 place-items-center" aria-label="Decrease">
                  <Minus className="size-4" />
                </button>
                <span className="w-5 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid size-12 place-items-center" aria-label="Increase">
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  add({ productId: p.id, slug: p.slug, name: p.name, image: p.image, unitPrice: unit, options: labels }, qty);
                  hide();
                }}
                className="flex h-14 flex-1 items-center justify-between rounded-full bg-ink px-6 font-medium text-bg transition active:scale-[0.98]"
              >
                <span>Add to bag</span>
                <span className="tabular-nums">{money(unit * qty, cur)}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
