"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RollText } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { cn, fmtDate, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-ink text-bg",
  confirmed: "bg-accent text-white",
  preparing: "bg-accent text-white",
  ready: "bg-emerald-600 text-white",
  "out-for-delivery": "bg-accent text-white",
  completed: "bg-ink/10 text-ink",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const orders = useDB((s) => s.orders);
  const products = useDB((s) => s.products);
  const customers = useDB((s) => s.customers);
  const cur = useDB((s) => s.settings.site.currency);
  const loyalty = useDB((s) => s.settings.loyalty);
  const myOrderIds = useCart((s) => s.myOrders);
  const wishlist = useCart((s) => s.wishlist);
  const [tab, setTab] = useState<"orders" | "wishlist" | "rewards">("orders");
  const [email, setEmail] = useState("");
  const [lookup, setLookup] = useState("");

  const mine = useMemo(() => {
    const e = lookup.toLowerCase();
    return orders.filter((o) => myOrderIds.includes(o.id) || (e && o.customer.email.toLowerCase() === e));
  }, [orders, myOrderIds, lookup]);
  const knownEmail = lookup || mine[0]?.customer.email;
  const me = customers.find((c) => c.email === knownEmail?.toLowerCase());
  const wished = products.filter((p) => wishlist.includes(p.id));

  const tabs = [
    ["orders", "Orders", mine.length],
    ["wishlist", "Wishlist", wished.length],
    ["rewards", "Rewards", me?.points ?? 0],
  ] as const;

  return (
    <>
      <PageHero eyebrow="Your account" title="Hello," italic={me ? `${me.name.split(" ")[0]}.` : "friend."} />
      <div className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-6">
            {tabs.map(([id, label, n]) => (
              <button key={id} onClick={() => setTab(id)} className={cn("relative pb-1.5 text-[15px] font-semibold transition-colors", tab === id ? "text-ink" : "text-muted hover:text-ink")}>
                {label}
                <sup className="ml-1 text-[10px] tabular-nums">{n}</sup>
                {tab === id && <motion.span layoutId="acc-tab" className="absolute inset-x-0 -bottom-[13px] h-[3px] bg-accent" />}
              </button>
            ))}
          </div>
          {tab !== "wishlist" && (
            <form onSubmit={(e) => { e.preventDefault(); setLookup(email.trim()); }} className="flex w-full max-w-sm items-end gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Look up by email" className="field !py-2 !text-sm" />
              <button className="group h-9 shrink-0 rounded-full bg-ink px-4 text-xs font-bold text-bg"><RollText>Find</RollText></button>
            </form>
          )}
        </div>

        {tab === "orders" && (
          <div className="mt-2">
            {mine.length === 0 && <p className="py-20 text-center text-muted">No orders yet. Try looking up with the email you used — e.g. ananya.rao@example.com</p>}
            {mine.map((o, i) => (
              <motion.div key={o.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/order/${o.id}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-ink/10 py-5 md:grid-cols-12">
                  <div className="flex -space-x-3 md:col-span-2">
                    {o.items.slice(0, 3).map((it, k) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={k} src={it.image} alt="" className="size-11 rounded-full object-cover ring-2 ring-bg" />
                    ))}
                  </div>
                  <div className="min-w-0 md:col-span-6">
                    <p className="display display-n truncate text-base uppercase transition-colors group-hover:text-accent">{o.number}</p>
                    <p className="truncate text-sm text-muted">{o.items.map((it) => it.name).join(", ")}</p>
                  </div>
                  <span className="hidden text-sm text-muted md:col-span-2 md:block">
                    {fmtDate(o.createdAt)} · <span className="capitalize">{o.fulfillment}</span>
                  </span>
                  <span className="text-right md:col-span-2">
                    <span className="block font-bold tabular-nums">{money(o.total, cur)}</span>
                    <span className={cn("mt-1 inline-block rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold uppercase", STATUS_COLOR[o.status])}>{o.status.replace(/-/g, " ")}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          <div className="mt-8">
            {wished.length === 0 ? (
              <p className="py-20 text-center text-muted">Tap the heart on anything you love and it’ll show up here.</p>
            ) : (
              <div className="grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-4">
                {wished.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === "rewards" && (
          <div className="mt-8 grid gap-px bg-ink/10 lg:grid-cols-2">
            <div className="relative overflow-hidden bg-ink p-8 text-bg">
              <p className="text-[12px] font-semibold text-bg/50">Aura rewards · {me ? me.stage.toUpperCase() : "GUEST"}</p>
              <p className="display mt-6 text-[clamp(3.5rem,10vw,7rem)] leading-none">
                {me?.points ?? 0}
                <span className="text-2xl text-bg/50"> pts</span>
              </p>
              <div className="mt-8 grid grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }).map((_, k) => (
                  <motion.span
                    key={k}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2 + k * 0.05 }}
                    className={cn("h-8 origin-bottom", k < Math.floor(((me?.points ?? 0) % 100) / 10) ? "bg-accent" : "bg-bg/15")}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-bg/60">
                {100 - ((me?.points ?? 0) % 100)} points to your next free drink · {Math.floor((me?.points ?? 0) / 100)} rewards ready
              </p>
            </div>
            <div className="bg-bg p-8">
              <p className="display text-3xl uppercase">How it works</p>
              <ol className="mt-6">
                {[loyalty.rewardText, "Points work online and in the café — just use the same email.", me ? `Member since ${fmtDate(me.createdAt)}.` : "Look up your email above to see your balance."].map((t, k) => (
                  <li key={k} className="grid grid-cols-[2.5rem_1fr] border-t border-ink/10 py-3 text-sm">
                    <span className="font-bold tabular-nums text-accent">{String(k + 1).padStart(2, "0")}</span>
                    <span className="text-muted">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
