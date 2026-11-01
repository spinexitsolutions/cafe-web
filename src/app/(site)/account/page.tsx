"use client";

import { motion } from "framer-motion";
import { Heart, Package, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { cn, fmtDate, money } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  preparing: "bg-violet-100 text-violet-800",
  ready: "bg-emerald-100 text-emerald-800",
  "out-for-delivery": "bg-indigo-100 text-indigo-800",
  completed: "bg-soft text-muted",
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

  return (
    <>
      <PageHero eyebrow="Your account" title="Hello," italic={me ? `${me.name.split(" ")[0]}.` : "friend."} />
      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1 ring-1 ring-line no-scrollbar">
          {([["orders", "Orders", Package], ["wishlist", `Wishlist (${wished.length})`, Heart], ["rewards", "Rewards", Sparkles]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors sm:px-4", tab === id ? "text-bg" : "text-muted")}>
              {tab === id && <motion.span layoutId="acc-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <Icon className="relative size-4" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        {tab !== "wishlist" && (
          <form onSubmit={(e) => { e.preventDefault(); setLookup(email.trim()); }} className="mt-6 flex max-w-md gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Look up by email" className="field !rounded-full" />
            <button className="shrink-0 rounded-full bg-ink px-5 text-sm font-medium text-bg">Find</button>
          </form>
        )}

        {tab === "orders" && (
          <div className="mt-8 space-y-3">
            {mine.length === 0 && <p className="py-16 text-center text-muted">No orders yet. Try looking up with the email you used — e.g. ananya.rao@example.com</p>}
            {mine.map((o) => (
              <Link key={o.id} href={`/order/${o.id}`} className="flex flex-col gap-4 rounded-card bg-surface p-5 ring-1 ring-line transition hover:ring-ink/30 sm:flex-row sm:items-center">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((i, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={i.image} alt="" className="size-12 rounded-full object-cover ring-4 ring-surface" />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{o.number} · {o.items.map((i) => i.name).join(", ")}</p>
                  <p className="text-sm text-muted">{fmtDate(o.createdAt)} · <span className="capitalize">{o.fulfillment}</span></p>
                </div>
                <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-medium capitalize", STATUS_COLOR[o.status])}>{o.status.replace(/-/g, " ")}</span>
                <span className="font-medium tabular-nums">{money(o.total, cur)}</span>
              </Link>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          <div className="mt-8">
            {wished.length === 0 ? (
              <p className="py-16 text-center text-muted">Tap the heart on anything you love and it’ll show up here.</p>
            ) : (
              <div className="grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-4">
                {wished.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === "rewards" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-card bg-ink p-8 text-bg">
              <div className="absolute -right-16 -top-16 size-56 rounded-full bg-accent/40 blur-3xl" />
              <p className="eyebrow text-bg/50">Aura rewards</p>
              <p className="display mt-4 text-7xl">{me?.points ?? 0}<span className="text-3xl"> pts</span></p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-bg/15">
                <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${((me?.points ?? 0) % 100)}%` }} transition={{ duration: 1.2 }} />
              </div>
              <p className="mt-3 text-sm text-bg/60">{100 - ((me?.points ?? 0) % 100)} points to your next free drink · {Math.floor((me?.points ?? 0) / 100)} rewards available</p>
            </div>
            <div className="rounded-card bg-surface p-8 ring-1 ring-line">
              <h3 className="display text-4xl">How it works</h3>
              <p className="mt-3 text-muted">{loyalty.rewardText}</p>
              <p className="mt-3 text-sm text-muted">{me ? `Member since ${fmtDate(me.createdAt)} · ${me.stage.toUpperCase()} tier` : "Place an order or look up your email to see your points."}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
