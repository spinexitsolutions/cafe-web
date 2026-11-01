"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { money } from "@/lib/utils";
import { computeTotals, useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { lockScroll } from "./SmoothScroll";

const ease = [0.32, 0.72, 0, 1] as const;

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, add, couponCode } = useCart();
  const site = useDB((s) => s.settings.site);
  const coupons = useDB((s) => s.coupons);
  const products = useDB((s) => s.products);
  const pathname = usePathname();
  const t = computeTotals(items, site, coupons, couponCode);
  const cur = site.currency;
  const toFree = Math.max(0, site.freeDeliveryAbove - t.subtotal);
  const upsell = products
    .filter((p) => p.active && p.type === "menu" && p.variants.length === 0 && p.stock > 0 && !items.some((i) => i.productId === p.id))
    .filter((p) => p.tags.includes("bestseller") || p.tags.includes("signature"))
    .slice(0, 3);

  useEffect(() => {
    lockScroll(open);
  }, [open]);
  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-label="Your bag"
              className="fixed inset-x-0 bottom-0 z-[91] flex max-h-[92dvh] flex-col rounded-t-[32px] bg-bg shadow-2xl sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:w-[440px] sm:rounded-[32px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.55, ease }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 120 && setOpen(false)}
            >
              <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15 sm:hidden" />
              <div className="flex items-center justify-between px-6 pb-3 pt-4">
                <div>
                  <h2 className="display text-3xl">Your bag</h2>
                  <p className="text-sm text-muted">{t.count ? `${t.count} item${t.count > 1 ? "s" : ""}` : "Nothing here yet"}</p>
                </div>
                <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-soft transition hover:bg-line" aria-label="Close bag">
                  <X className="size-5" />
                </button>
              </div>

              {items.length > 0 && (
                <div className="mx-6 mb-2 rounded-2xl bg-surface p-3.5 text-sm">
                  <p className="text-muted">
                    {toFree > 0 ? (
                      <>
                        Add <b className="text-ink">{money(toFree, cur)}</b> for free delivery
                      </>
                    ) : (
                      <b className="text-ink">You’ve unlocked free delivery ✦</b>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={false}
                      animate={{ width: `${Math.min(100, (t.subtotal / site.freeDeliveryAbove) * 100)}%` }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="grid size-20 place-items-center rounded-full bg-accent-soft">
                      <ShoppingBag className="size-8 text-accent" />
                    </div>
                    <p className="display mt-6 text-3xl">Your bag is empty</p>
                    <p className="mt-2 max-w-xs text-sm text-muted">Start with a flat white. Everything else follows.</p>
                    <Link href="/menu" className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg">
                      Browse the menu
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    <AnimatePresence initial={false}>
                      {items.map((i) => (
                        <motion.li
                          key={i.key}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-4 py-4">
                            <Link href={`/product/${i.slug}`} className="shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={i.image} alt={i.name} className="size-20 rounded-2xl object-cover" />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex justify-between gap-2">
                                <p className="font-medium leading-snug">{i.name}</p>
                                <button onClick={() => remove(i.key)} className="text-muted transition hover:text-ink" aria-label={`Remove ${i.name}`}>
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                              {i.options.length > 0 && <p className="mt-0.5 truncate text-xs text-muted">{i.options.join(" · ")}</p>}
                              <div className="mt-auto flex items-center justify-between pt-2">
                                <div className="flex items-center rounded-full bg-surface ring-1 ring-line">
                                  <button onClick={() => setQty(i.key, i.qty - 1)} className="grid size-8 place-items-center" aria-label="Decrease">
                                    <Minus className="size-3.5" />
                                  </button>
                                  <span className="w-6 text-center text-sm tabular-nums">{i.qty}</span>
                                  <button onClick={() => setQty(i.key, i.qty + 1)} className="grid size-8 place-items-center" aria-label="Increase">
                                    <Plus className="size-3.5" />
                                  </button>
                                </div>
                                <span className="font-medium tabular-nums">{money(i.unitPrice * i.qty, cur)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}

                {items.length > 0 && upsell.length > 0 && (
                  <div className="pb-4 pt-2">
                    <p className="eyebrow text-muted">Pairs beautifully with</p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                      {upsell.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, image: p.image, unitPrice: p.price, options: [] })}
                          className="group flex w-44 shrink-0 items-center gap-2.5 rounded-2xl bg-surface p-2 text-left ring-1 ring-line transition hover:ring-accent"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt="" className="size-12 rounded-xl object-cover" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium">{p.name}</span>
                            <span className="flex items-center gap-1 text-xs text-muted">
                              {money(p.price, cur)} <Plus className="size-3 text-accent" />
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-line px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{money(t.subtotal, cur)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Taxes, delivery and offers calculated at checkout.</p>
                  <Link
                    href="/checkout"
                    className="group mt-4 flex h-14 items-center justify-between rounded-full bg-ink pl-6 pr-2 text-bg transition active:scale-[0.98]"
                  >
                    <span className="font-medium">Checkout · {money(t.subtotal, cur)}</span>
                    <span className="grid size-10 place-items-center rounded-full bg-accent transition group-hover:translate-x-0.5">
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
