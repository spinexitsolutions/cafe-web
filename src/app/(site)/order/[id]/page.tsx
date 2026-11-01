"use client";

import { motion } from "framer-motion";
import { Bike, Check, ChefHat, ClipboardCheck, PackageCheck, Phone, Receipt, Store, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { cn, fmtDate, fmtTime, money } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Lines, RollText, Rule } from "@/components/motion/Kit";

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

  if (!o || !hydrated)
    return (
      <div className="mx-auto max-w-xl px-5 py-48 text-center">
        <p className="display text-5xl uppercase">{hydrated ? "Order not found" : "Loading…"}</p>
        {hydrated && <Link href="/account" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm text-bg">Find my orders</Link>}
      </div>
    );

  const flow = FLOW[o.fulfillment === "delivery" ? "delivery" : "other"];
  let idx = flow.findIndex((f) => f.s === o.status);
  if (o.status === "ready" && o.fulfillment === "delivery") idx = 2;
  const cancelled = o.status === "cancelled";
  const pct = cancelled ? 0 : (Math.max(0, idx) / (flow.length - 1)) * 100;

  const rows: [string, number][] = (
    [
      ["Subtotal", o.subtotal],
      ["Discount", -o.discount],
      ["GST", o.tax],
      ["Delivery", o.deliveryFee],
      ["Tip", o.tip],
    ] as [string, number][]
  ).filter(([k, v]) => v !== 0 || k === "Subtotal" || k === "GST");
  const details: [string, string][] = [
    ["Placed", `${fmtDate(o.createdAt)} · ${fmtTime(o.createdAt)}`],
    ["Fulfilment", `${o.fulfillment}${o.scheduledFor ? ` · ${o.scheduledFor}` : " · ASAP"}`],
    ...(o.address ? ([["Address", o.address]] as [string, string][]) : []),
    ...(o.tableNo ? ([["Table", o.tableNo]] as [string, string][]) : []),
    ["Payment", `${o.payment.toUpperCase()} · ${o.paymentStatus}`],
  ];

  return (
    <div className="px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pt-24">
      <Rule />
      <div className="grid gap-4 pt-5 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="text-[13px] font-semibold">
            <span className="text-accent">({o.number})</span> <span className="text-muted">{cancelled ? "Cancelled" : "Order confirmed"}</span>
          </p>
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 }}
            className={cn("mt-4 grid size-14 place-items-center rounded-full text-white", cancelled ? "bg-red-500" : "bg-accent")}
          >
            {cancelled ? <XCircle className="size-7" /> : <Check className="size-7" strokeWidth={3} />}
          </motion.div>
        </div>
        <div className="md:col-span-9">
          <h1 className="display text-[clamp(2.6rem,9vw,7rem)] uppercase">
            {cancelled ? (
              <Lines text="Order cancelled." onMount />
            ) : (
              <>
                <Lines text="Thank you," onMount /> <em><Lines text={`${o.customer.name.split(" ")[0]}.`} onMount delay={0.1} /></em>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-lg text-muted">
            {cancelled ? "If you were charged, a refund is on its way." : `Confirmation sent to ${o.customer.email}. This page updates live as the café moves your order along.`}
          </p>
        </div>
      </div>

      {!cancelled && (
        <section className="mt-14">
          <div className="flex items-center justify-between pb-3 text-[13px] font-semibold">
            <span className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              Live · {flow[Math.max(0, idx)]?.label}
            </span>
            <span className="text-muted">{Math.round(pct)}%</span>
          </div>
          <div className="h-1 bg-ink/10">
            <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }} />
          </div>
          <ol className="grid grid-cols-5 gap-px bg-ink/10">
            {flow.map((f, i) => {
              const done = i <= idx;
              const Icon = f.icon;
              return (
                <li key={f.s} className={cn("bg-bg px-2 py-4 transition-colors duration-700 sm:px-4", i === idx && "bg-surface")}>
                  <Icon className={cn("size-5 transition-colors duration-700", done ? "text-accent" : "text-ink/25")} />
                  <p className={cn("mt-3 text-[11px] font-semibold leading-tight sm:text-sm", done ? "text-ink" : "text-muted")}>{f.label}</p>
                  <p className="text-[10px] tabular-nums text-muted sm:text-xs">{String(i + 1).padStart(2, "0")}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[13px] font-semibold"><span className="text-accent">(01)</span> <span className="text-muted">Details</span></p>
          <dl className="mt-3">
            {details.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] border-b border-ink/10 py-3.5 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold capitalize">{v}</dd>
              </div>
            ))}
          </dl>
          {customer && (
            <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-4 bg-ink p-6 text-bg">
              <div>
                <p className="text-[12px] font-semibold text-bg/50">Aura rewards</p>
                <p className="display mt-2 text-5xl">{customer.points} pts</p>
                <p className="mt-1 text-sm text-bg/60">{Math.max(0, 100 - (customer.points % 100))} points to your next free drink.</p>
              </div>
              <Link href="/account" className="group text-sm font-semibold text-accent"><RollText>View →</RollText></Link>
            </div>
          )}
          <a href={`tel:${site.phone}`} className="group mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm font-semibold">
            <Phone className="size-4" /> <RollText>{`Need help? ${site.phone}`}</RollText>
          </a>
        </div>

        <aside className="lg:col-span-5">
          <div className="relative bg-ink p-6 text-bg sm:p-7">
            <div className="flex items-baseline justify-between">
              <p className="display text-2xl uppercase">{site.shortName}®</p>
              <p className="text-[11px] font-semibold text-bg/50">{o.number}</p>
            </div>
            <div className="my-5 border-t border-dashed border-bg/25" />
            <ul className="space-y-3">
              {o.items.map((it, k) => (
                <li key={k} className="flex items-baseline gap-2 text-sm">
                  <span className="tabular-nums text-bg/50">{it.qty}×</span>
                  <span className="min-w-0 truncate font-semibold">{it.name}</span>
                  <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/25" />
                  <span className="tabular-nums">{money(it.unitPrice * it.qty, cur)}</span>
                </li>
              ))}
            </ul>
            <div className="my-5 border-t border-dashed border-bg/25" />
            <dl className="space-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="text-bg/55">{k}</dt>
                  <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/20" />
                  <dd className="tabular-nums">{v < 0 ? `− ${money(-v, cur)}` : money(v, cur)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-bg/20 pt-4">
              <span className="text-sm font-semibold">Total paid</span>
              <span className="display text-4xl">{money(o.total, cur)}</span>
            </div>
            <div aria-hidden className="absolute inset-x-0 -bottom-[7px] h-[14px]" style={{ background: "radial-gradient(circle at 7px 7px, var(--bg) 6px, transparent 6.5px) repeat-x", backgroundSize: "14px 14px" }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
