"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Img } from "@/components/motion/Img";
import { Reveal } from "@/components/motion/Reveal";
import { MenuRow, ProductCard, Tag } from "@/components/site/ProductCard";
import { useVariantPicker, VariantGroups } from "@/components/site/ProductSheet";
import { cn, fmtDate, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";

function Accordion({ title, children, open: initial = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left font-medium">
        {title}
        <ChevronDown className={cn("size-4 transition duration-500", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const hydrated = useDB((s) => s.hydrated);
  const p = useDB((s) => s.products.find((x) => x.slug === slug));
  const products = useDB((s) => s.products);
  const allReviews = useDB((s) => s.reviews);
  const cat = useDB((s) => s.categories.find((c) => c.id === p?.categoryId));
  const cur = useDB((s) => s.settings.site.currency);
  const addReview = useDB((s) => s.addReview);
  const add = useCart((s) => s.add);
  const wished = useCart((s) => (p ? s.wishlist.includes(p.id) : false));
  const toggleWish = useCart((s) => s.toggleWish);
  const { sel, setSel, unit, labels } = useVariantPicker(p);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [rv, setRv] = useState({ name: "", rating: 5, text: "" });
  const [rvSent, setRvSent] = useState(false);

  if (!p) {
    return (
      <div className="mx-auto max-w-xl px-5 py-48 text-center">
        <p className="display text-5xl">{hydrated ? "We couldn’t find that." : "Brewing…"}</p>
        {hydrated && (
          <Link href="/menu" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm text-bg">
            Back to the menu
          </Link>
        )}
      </div>
    );
  }

  const images = [p.image, ...p.gallery];
  const reviews = allReviews.filter((r) => r.productId === p.id && r.approved);
  const related = products.filter((x) => x.active && x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
  const soldOut = p.stock <= 0;
  const payload = { productId: p.id, slug: p.slug, name: p.name, image: p.image, unitPrice: unit, options: labels };

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pt-24">
        <nav className="eyebrow mb-6 flex gap-2 text-muted">
          <Link href={p.type === "menu" ? "/menu" : "/shop"} className="hover:text-ink">
            {p.type === "menu" ? "Menu" : "Shop"}
          </Link>
          /<span className="text-ink">{cat?.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-card bg-soft sm:aspect-[5/4] lg:aspect-square">
              <AnimatePresence mode="popLayout">
                <motion.div key={imgIdx} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                  <Img src={images[imgIdx]} alt={p.name} eager className="h-full w-full object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute left-4 top-4 flex gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <Tag key={t} t={t} />
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((src, i) => (
                  <button key={src} onClick={() => setImgIdx(i)} className={cn("size-20 overflow-hidden rounded-2xl ring-2 transition", i === imgIdx ? "ring-accent" : "ring-transparent opacity-60 hover:opacity-100")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Reveal>
              <h1 className="display text-[clamp(2.8rem,6vw,5rem)]">{p.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-4", i < Math.round(p.rating) ? "fill-accent text-accent" : "text-line")} />
                  ))}
                </span>
                {p.rating.toFixed(1)} · {p.reviewCount + reviews.length} reviews
                {p.calories !== undefined && <span>· {p.calories} kcal</span>}
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="display text-5xl">{money(unit, cur)}</span>
                {p.comparePrice && p.comparePrice > p.price && <span className="text-lg text-muted line-through">{money(p.comparePrice, cur)}</span>}
              </div>
              <p className="mt-5 text-lg leading-relaxed text-muted">{p.description}</p>
              {p.notes && <p className="eyebrow mt-4 text-accent">{p.notes}</p>}
            </Reveal>

            {p.variants.length > 0 && (
              <div className="mt-8">
                <VariantGroups p={p} sel={sel} setSel={setSel} cur={cur} />
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <div className="flex h-14 items-center rounded-full bg-surface ring-1 ring-line">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-12 place-items-center" aria-label="Decrease">
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid size-12 place-items-center" aria-label="Increase">
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                disabled={soldOut}
                onClick={() => add(payload, qty)}
                className="flex h-14 flex-1 items-center justify-between rounded-full bg-ink px-6 font-medium text-bg transition hover:bg-accent active:scale-[0.98] disabled:bg-line disabled:text-muted"
              >
                <span>{soldOut ? "Sold out" : "Add to bag"}</span>
                {!soldOut && <span className="tabular-nums">{money(unit * qty, cur)}</span>}
              </button>
              <button onClick={() => toggleWish(p.id)} className="grid size-14 shrink-0 place-items-center rounded-full ring-1 ring-line transition hover:bg-soft" aria-label="Wishlist">
                <Heart className={cn("size-5", wished && "fill-accent text-accent")} />
              </button>
            </div>
            {!soldOut && (
              <button
                onClick={() => {
                  add(payload, qty);
                  router.push("/checkout");
                }}
                className="mt-3 h-14 w-full rounded-full font-medium ring-1 ring-ink transition hover:bg-ink hover:text-bg"
              >
                Buy now
              </button>
            )}
            {p.stock > 0 && p.stock < 15 && <p className="mt-4 text-sm text-accent">Only {p.stock} left today</p>}

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-soft p-4 text-sm">
              <Truck className="size-5 shrink-0 text-accent" />
              {p.type === "menu" ? "Ready for pickup in ~10 minutes, or delivered within 6 km." : "Ships within 48 hours of roasting. Free delivery over ₹799."}
            </div>

            <div className="mt-6">
              <Accordion title="Details" open>
                {p.longDescription}
              </Accordion>
              {p.type === "shop" && (
                <Accordion title="Brewing guide">
                  Espresso: 18g in, 38g out, 28 seconds. Pour over: 15g to 250g water at 94°C. French press: 30g to 500g, steep 4 minutes. Rest beans 5–7 days after roasting for best flavour.
                </Accordion>
              )}
              <Accordion title="Delivery & returns">Fresh food can’t be returned, but if anything isn’t perfect, tell us within 24 hours and we’ll make it right — replacement or full refund.</Accordion>
              <button
                onClick={() => navigator.share?.({ title: p.name, url: location.href }).catch(() => {}) ?? navigator.clipboard.writeText(location.href)}
                className="mt-5 flex items-center gap-2 text-sm text-muted hover:text-ink"
              >
                <Share2 className="size-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="display text-5xl">Reviews</h2>
            <div className="mt-4 flex items-end gap-3">
              <span className="display text-7xl">{p.rating.toFixed(1)}</span>
              <span className="pb-3 text-sm text-muted">out of 5 · {p.reviewCount + reviews.length} reviews</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rv.name || !rv.text) return;
                addReview({ productId: p.id, ...rv });
                setRvSent(true);
              }}
              className="mt-8 space-y-3 rounded-card bg-surface p-5 ring-1 ring-line"
            >
              {rvSent ? (
                <p className="py-6 text-center text-sm">Thank you! Your review will appear once our team approves it.</p>
              ) : (
                <>
                  <p className="font-medium">Write a review</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setRv({ ...rv, rating: n })} aria-label={`${n} stars`}>
                        <Star className={cn("size-6 transition", n <= rv.rating ? "fill-accent text-accent" : "text-line")} />
                      </button>
                    ))}
                  </div>
                  <input className="field" placeholder="Your name" value={rv.name} onChange={(e) => setRv({ ...rv, name: e.target.value })} />
                  <textarea className="field min-h-24" placeholder="What did you think?" value={rv.text} onChange={(e) => setRv({ ...rv, text: e.target.value })} />
                  <button className="h-12 w-full rounded-full bg-ink text-sm font-medium text-bg">Submit review</button>
                </>
              )}
            </form>
          </div>
          <ul className="divide-y divide-line">
            {reviews.length === 0 && <li className="py-6 text-muted">Be the first to review this.</li>}
            {reviews.map((r) => (
              <li key={r.id} className="py-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted">{fmtDate(r.createdAt)}</p>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-accent text-accent" : "text-line")} />
                  ))}
                </div>
                <p className="mt-3 text-muted">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <h2 className="display text-5xl">
            You might <em>also like</em>
          </h2>
          {p.type === "shop" ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {related.map((r, i) => (
                <ProductCard key={r.id} p={r} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid md:grid-cols-2 md:gap-x-14">
              {related.map((r) => (
                <MenuRow key={r.id} p={r} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
