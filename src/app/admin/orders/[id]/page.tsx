"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Mail, MapPin, MessageCircle, Phone, Printer, Store, Truck, Utensils } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, EmptyState, PageSkeleton, Select, StatusPill, Thumb, useConfirm } from "@/components/admin/ui";
import { FLOW, NEXT_LABEL, nextStatus } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { OrderStatus } from "@/lib/types";
import { cn, fmtDate, fmtTime, money } from "@/lib/utils";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useDB((s) => s.hydrated);
  const order = useDB((s) => s.orders.find((o) => o.id === id));
  const settings = useDB((s) => s.settings.site);
  const customer = useDB((s) => s.customers.find((c) => c.email.toLowerCase() === order?.customer.email.toLowerCase()));
  const setStatus = useDB((s) => s.setOrderStatus);
  const upsert = useDB((s) => s.upsert);
  const { confirm, node } = useConfirm();

  if (!hydrated) return <PageSkeleton />;
  if (!order)
    return (
      <Card>
        <EmptyState title="Order not found" action={<Link href="/admin/orders"><Button>Back to orders</Button></Link>} />
      </Card>
    );

  const cur = settings.currency;
  const nx = nextStatus(order);
  const flow = order.fulfillment === "delivery" ? FLOW : FLOW.filter((s) => s !== "out-for-delivery");
  const stepIndex = flow.indexOf(order.status);
  const FIcon = order.fulfillment === "delivery" ? Truck : order.fulfillment === "pickup" ? Store : Utensils;
  const move = (s: OrderStatus) => {
    setStatus(order.id, s);
    toast(`Order ${order.number} → ${s.replace(/-/g, " ")}`);
  };

  return (
    <div>
      {node}
      <div className="print:hidden">
        <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--a-muted)] hover:text-[var(--a-ink)]">
          <ArrowLeft className="size-4" /> Orders
        </Link>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-semibold tracking-tight">{order.number}</h1>
              <StatusPill status={order.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--a-muted)]">
              {fmtDate(order.createdAt, { weekday: "short", day: "numeric", month: "long", year: "numeric" })} at {fmtTime(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.print()}>
              <Printer className="size-4" /> Print receipt
            </Button>
            {order.status !== "cancelled" && order.status !== "completed" && (
              <Button
                variant="danger"
                onClick={async () => {
                  if (await confirm("Cancel this order?", "The customer will be refunded if they paid online.")) move("cancelled");
                }}
              >
                Cancel
              </Button>
            )}
            {nx && (
              <Button variant="primary" onClick={() => move(nx)}>
                <Check className="size-4" /> {NEXT_LABEL[nx]}
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        {order.status !== "cancelled" && (
          <Card className="mb-4">
            <div className="flex items-center">
              {flow.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <button onClick={() => move(s)} className="group flex flex-col items-center gap-1.5" title={`Set ${s}`}>
                    <motion.span
                      initial={false}
                      animate={{ scale: i === stepIndex ? 1.15 : 1 }}
                      className={cn(
                        "grid size-8 place-items-center rounded-full border-2 text-xs font-semibold transition-colors",
                        i <= stepIndex ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--a-line)] bg-white text-[var(--a-muted)] group-hover:border-[var(--accent)]",
                      )}
                    >
                      {i < stepIndex ? <Check className="size-4" /> : i + 1}
                    </motion.span>
                    <span className="hidden text-[11px] capitalize text-[var(--a-muted)] sm:block">{s.replace(/-/g, " ")}</span>
                  </button>
                  {i < flow.length - 1 && (
                    <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded bg-[var(--a-line)] sm:mb-5">
                      <motion.div className="h-full bg-[var(--accent)]" initial={false} animate={{ width: i < stepIndex ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card title={`Items (${order.items.reduce((a, b) => a + b.qty, 0)})`}>
              <div className="divide-y divide-[var(--a-line)]">
                {order.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 first:pt-0">
                    <Thumb src={it.image} className="size-14" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{it.name}</div>
                      {it.options.length > 0 && <div className="text-xs text-[var(--a-muted)]">{it.options.join(" · ")}</div>}
                      <div className="text-xs text-[var(--a-muted)]">
                        {it.qty} × {money(it.unitPrice, cur)}
                      </div>
                    </div>
                    <div className="font-medium tabular-nums">{money(it.qty * it.unitPrice, cur)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-[var(--a-line)] pt-4 text-sm">
                <Row l="Subtotal" r={money(order.subtotal, cur)} />
                {order.discount > 0 && <Row l={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} r={`−${money(order.discount, cur)}`} />}
                <Row l={`Tax (${settings.taxRate}%)`} r={money(order.tax, cur)} />
                {order.deliveryFee > 0 && <Row l="Delivery" r={money(order.deliveryFee, cur)} />}
                {order.tip > 0 && <Row l="Tip" r={money(order.tip, cur)} />}
                <div className="flex justify-between pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{money(order.total, cur)}</span>
                </div>
              </div>
            </Card>
            {order.notes && (
              <Card title="Customer note">
                <p className="text-sm">{order.notes}</p>
              </Card>
            )}
            <Card title="Timeline">
              <ol className="relative space-y-4 border-l border-[var(--a-line)] pl-5">
                {[...order.timeline].reverse().map((t, i) => (
                  <li key={i} className="relative">
                    <span className={cn("absolute -left-[26px] top-1 size-3 rounded-full ring-4 ring-white", i === 0 ? "bg-[var(--accent)]" : "bg-black/20")} />
                    <div className="text-sm font-medium capitalize">{t.status.replace(/-/g, " ")}</div>
                    <div className="text-xs text-[var(--a-muted)]">
                      {fmtDate(t.at, { day: "numeric", month: "short" })} · {fmtTime(t.at)}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
          <div className="space-y-4">
            <Card title="Customer" action={customer && <Link href={`/admin/customers/${customer.id}`} className="text-sm text-[var(--accent)]">Profile</Link>}>
              <div className="font-medium">{order.customer.name}</div>
              <div className="mt-2 space-y-1.5 text-sm text-[var(--a-muted)]">
                <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 hover:text-[var(--a-ink)]">
                  <Mail className="size-4" /> {order.customer.email}
                </a>
                <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 hover:text-[var(--a-ink)]">
                  <Phone className="size-4" /> {order.customer.phone}
                </a>
                <a href={`https://wa.me/${order.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${order.customer.name.split(" ")[0]}, an update on your ${settings.name} order ${order.number}: it is now ${order.status.replace(/-/g, " ")}.`)}`} target="_blank" className="flex items-center gap-2 hover:text-[var(--a-ink)]">
                  <MessageCircle className="size-4" /> WhatsApp update
                </a>
              </div>
              {customer && (
                <div className="mt-3 flex gap-2">
                  <Badge tone="purple">{customer.stage}</Badge>
                  <Badge tone="accent">{customer.points} pts</Badge>
                </div>
              )}
            </Card>
            <Card title="Fulfilment">
              <div className="flex items-center gap-2 text-sm font-medium capitalize">
                <FIcon className="size-4 text-[var(--accent)]" /> {order.fulfillment}
              </div>
              {order.address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`} target="_blank" className="mt-2 flex items-start gap-2 text-sm text-[var(--a-muted)] hover:text-[var(--a-ink)]">
                  <MapPin className="mt-0.5 size-4 shrink-0" /> {order.address}
                </a>
              )}
              {order.tableNo && <p className="mt-2 text-sm text-[var(--a-muted)]">Table {order.tableNo}</p>}
              {order.scheduledFor && <p className="mt-2 text-sm text-[var(--a-muted)]">Scheduled for {order.scheduledFor}</p>}
            </Card>
            <Card title="Payment">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase">{order.payment}</span>
                <StatusPill status={order.paymentStatus} />
              </div>
              <Select
                className="mt-3"
                value={order.paymentStatus}
                onChange={(e) => {
                  upsert("orders", { ...order, paymentStatus: e.target.value as typeof order.paymentStatus });
                  toast("Payment status updated");
                }}
                options={[{ value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "refunded", label: "Refunded" }]}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Printable receipt */}
      <div className="mx-auto hidden max-w-[320px] font-mono text-[12px] text-black print:block">
        <div className="text-center">
          <div className="text-base font-bold">{settings.name}</div>
          <div>{settings.address}, {settings.city}</div>
          <div>{settings.phone}</div>
        </div>
        <div className="my-2 border-t border-dashed border-black" />
        <div>Order {order.number}</div>
        <div>{fmtDate(order.createdAt)} {fmtTime(order.createdAt)}</div>
        <div className="capitalize">{order.fulfillment} · {order.customer.name}</div>
        <div className="my-2 border-t border-dashed border-black" />
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between">
            <span>{it.qty}× {it.name}</span>
            <span>{money(it.qty * it.unitPrice, cur)}</span>
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-black" />
        <Row l="Subtotal" r={money(order.subtotal, cur)} />
        {order.discount > 0 && <Row l="Discount" r={`-${money(order.discount, cur)}`} />}
        <Row l="Tax" r={money(order.tax, cur)} />
        {order.deliveryFee > 0 && <Row l="Delivery" r={money(order.deliveryFee, cur)} />}
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{money(order.total, cur)}</span>
        </div>
        <div className="mt-3 text-center">Thank you ☕</div>
      </div>
    </div>
  );
}

function Row({ l, r }: { l: string; r: string }) {
  return (
    <div className="flex justify-between text-[var(--a-muted)] print:text-black">
      <span>{l}</span>
      <span className="tabular-nums">{r}</span>
    </div>
  );
}
