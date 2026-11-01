"use client";

import { motion } from "framer-motion";
import { Bike, Check, ChefHat, ClipboardCheck, PackageCheck, Phone, Receipt, Store, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { cn, fmtDate, fmtTime, money } from "@/lib/utils";
import { useDB } from "@/store/db";

const FLOW: Record<string, { s: OrderStatus; label: string; icon: React.ElementType }[]> = {
  delivery: [
    { s: "pending", label: "Order placed", icon: Receipt },
    { s: "confirmed", label: "Confirmed", icon: ClipboardCheck },
    { s: "preparing", label: "Being prepared", icon: ChefHat },
    { s: "out-for-delivery", label: "On the way", icon: Bike },
    { s: "completed", label: "Delivered", icon: PackageCheck },
  ],
  other: [
    { s: "pending", label: "Order placed", icon: Receipt },
    { s: "confirmed", label: "Confirmed", icon: ClipboardCheck },
    { s: "preparing", label: "Being prepared", icon: ChefHat },
    { s: "ready", label: "Ready", icon: Store },
    { s: "completed", label: "Collected", icon: PackageCheck },
  ],
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useDB((s) => s.hydrated);
  const o = useDB((s) => s.orders.find((x) => x.id === id));
  const site = useDB((s) => s.settings.site);
  const customer = useDB((s) => s.customers.find((c) => c.email === o?.customer.email));
  const cur = site.currency;

  if (!o)
    return (
      <div className="mx-auto max-w-xl px-5 py-48 text-center">
        <p className="display text-5xl">{hydrated ? "Order not found" : "Loading…"}</p>
        {hydrated && <Link href="/account" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm text-bg">Find my orders</Link>}
      </div>
    );

  const flow = FLOW[o.fulfillment === "delivery" ? "delivery" : "other"];
  let idx = flow.findIndex((f) => f.s === o.status);
  if (o.status === "ready" && o.fulfillment === "delivery") idx = 2;
  const cancelled = o.status === "cancelled";
  const pct = cancelled ? 0 : (Math.max(0, idx) / (flow.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-8 sm:pt-36">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }} className={cn("grid size-16 place-items-center rounded-full text-white", cancelled ? "bg-red-500" : "bg-emerald-500")}>
        {cancelled ? <XCircle className="size-8" /> : <Check className="size-8" strokeWidth={3} />}
      </motion.div>
      <p className="eyebrow mt-6 text-muted">Order {o.number}</p>
      <h1 className="display mt-2 text-[clamp(2.8rem,8vw,5.5rem)]">
        {cancelled ? "Order cancelled." : (
          <>
            Thank you, <em className="text-accent">{o.customer.name.split(" ")[0]}.</em>
          </>
        )}
      </h1>
      <p className="mt-3 max-w-lg text-muted">
        {cancelled
          ? "This order was cancelled. If you were charged, a refund is on its way."
          : `We’ve sent a confirmation to ${o.customer.email}. This page updates live as your order moves along.`}
      </p>

      {!cancelled && (
        <div className="mt-10 rounded-card bg-surface p-5 ring-1 ring-line sm:p-8">
          <div className="flex items-center justify-between">
            <p className="font-medium">{flow[Math.max(0, idx)]?.label}</p>
            <span className="relative flex size-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />
              <span className="relative size-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="relative mt-8">
            <div className="absolute left-5 right-5 top-5 h-0.5 bg-line" />
            <motion.div className="absolute left-5 top-5 h-0.5 bg-accent" initial={{ width: 0 }} animate={{ width: `calc((100% - 2.5rem) * ${pct / 100})` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            <ol className="relative flex justify-between">
              {flow.map((f, i) => {
                const done = i <= idx;
                const Icon = f.icon;
                return (
                  <li key={f.s} className="flex w-10 flex-col items-center">
                    <motion.span
                      animate={{ scale: i === idx ? [1, 1.12, 1] : 1 }}
                      transition={{ repeat: i === idx ? Infinity : 0, duration: 1.8 }}
                      className={cn("grid size-10 place-items-center rounded-full ring-4 ring-surface transition-colors duration-700", done ? "bg-accent text-white" : "bg-soft text-muted")}
                    >
                      <Icon className="size-4" />
                    </motion.span>
                    <span className={cn("mt-3 w-16 text-center text-[10px] leading-tight sm:w-20 sm:text-xs", done ? "text-ink" : "text-muted")}>{f.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-card bg-surface p-5 ring-1 ring-line sm:p-7">
          <h2 className="font-medium">Items</h2>
          <ul className="mt-4 divide-y divide-line">
            {o.items.map((i, k) => (
              <li key={k} className="flex items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt="" className="size-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {i.qty} × {i.name}
                  </p>
                  {i.options.length > 0 && <p className="truncate text-xs text-muted">{i.options.join(" · ")}</p>}
                </div>
                <span className="text-sm tabular-nums">{money(i.unitPrice * i.qty, cur)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-sm">
            {[
              ["Subtotal", o.subtotal],
              ["Discount", -o.discount],
              ["GST", o.tax],
              ["Delivery", o.deliveryFee],
              ["Tip", o.tip],
            ]
              .filter(([k, v]) => v !== 0 || k === "Subtotal" || k === "GST")
              .map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-muted">
                  <dt>{k}</dt>
                  <dd className="tabular-nums">{(v as number) < 0 ? `− ${money(-(v as number), cur)}` : money(v as number, cur)}</dd>
                </div>
              ))}
            <div className="flex justify-between pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(o.total, cur)}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4">
          <div className="rounded-card bg-surface p-5 text-sm ring-1 ring-line sm:p-7">
            <h2 className="font-medium">Details</h2>
            <dl className="mt-4 space-y-3">
              <div><dt className="text-muted">Placed</dt><dd>{fmtDate(o.createdAt)} · {fmtTime(o.createdAt)}</dd></div>
              <div><dt className="text-muted">Fulfilment</dt><dd className="capitalize">{o.fulfillment}{o.scheduledFor ? ` · ${o.scheduledFor}` : " · ASAP"}</dd></div>
              {o.address && <div><dt className="text-muted">Address</dt><dd>{o.address}</dd></div>}
              {o.tableNo && <div><dt className="text-muted">Table</dt><dd>{o.tableNo}</dd></div>}
              <div><dt className="text-muted">Payment</dt><dd className="uppercase">{o.payment} · <span className="capitalize">{o.paymentStatus}</span></dd></div>
            </dl>
          </div>
          {customer && (
            <div className="rounded-card bg-ink p-5 text-bg sm:p-7">
              <p className="eyebrow text-bg/50">Aura rewards</p>
              <p className="display mt-2 text-4xl">{customer.points} pts</p>
              <p className="mt-1 text-sm text-bg/60">{Math.max(0, 100 - (customer.points % 100))} points to your next free drink.</p>
            </div>
          )}
          <a href={`tel:${site.phone}`} className="flex items-center justify-center gap-2 rounded-full py-4 text-sm font-medium ring-1 ring-line">
            <Phone className="size-4" /> Need help? Call {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
