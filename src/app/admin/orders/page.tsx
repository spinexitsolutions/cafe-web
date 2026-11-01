"use client";

import { Download, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Card, EmptyState, PageHeader, PageSkeleton, SearchInput, Segmented, Select, StatusPill, Table, Td, downloadFile, toCSV } from "@/components/admin/ui";
import { useDB } from "@/store/db";
import type { OrderStatus } from "@/lib/types";
import { fmtDate, fmtTime, money } from "@/lib/utils";

const STATUSES: (OrderStatus | "all" | "active")[] = ["all", "active", "pending", "confirmed", "preparing", "ready", "out-for-delivery", "completed", "cancelled"];

export default function OrdersPage() {
  const hydrated = useDB((s) => s.hydrated);
  const orders = useDB((s) => s.orders);
  const currency = useDB((s) => s.settings.site.currency);
  const router = useRouter();
  const [status, setStatus] = useState<string>("all");
  const [fulfil, setFulfil] = useState("all");
  const [range, setRange] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const days = range === "all" ? Infinity : Number(range);
    return orders.filter(
      (o) =>
        (status === "all" || (status === "active" ? !["completed", "cancelled"].includes(o.status) : o.status === status)) &&
        (fulfil === "all" || o.fulfillment === fulfil) &&
        Date.now() - new Date(o.createdAt).getTime() < days * 86400000 &&
        (!t || o.number.toLowerCase().includes(t) || o.customer.name.toLowerCase().includes(t) || o.customer.email.toLowerCase().includes(t) || o.customer.phone.includes(t)),
    );
  }, [orders, status, fulfil, range, q]);

  if (!hydrated) return <PageSkeleton />;
  const total = list.filter((o) => o.status !== "cancelled").reduce((a, b) => a + b.total, 0);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${list.length} orders · ${money(total, currency)} revenue`}
        actions={
          <>
            <Button
              onClick={() =>
                downloadFile(
                  "orders.csv",
                  toCSV(list.map((o) => ({ number: o.number, date: o.createdAt, customer: o.customer.name, email: o.customer.email, phone: o.customer.phone, items: o.items.map((i) => `${i.qty}x ${i.name}`).join("; "), fulfillment: o.fulfillment, payment: o.payment, status: o.status, total: o.total }))),
                  "text/csv",
                )
              }
            >
              <Download className="size-4" /> Export
            </Button>
            <Link href="/admin/orders/board">
              <Button variant="dark">Live board</Button>
            </Link>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Order #, name, email, phone" className="lg:w-80" />
        <div className="flex gap-2">
          <Select value={fulfil} onChange={(e) => setFulfil(e.target.value)} options={[{ value: "all", label: "All types" }, { value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }, { value: "dine-in", label: "Dine-in" }]} className="!w-auto" />
          <Select value={range} onChange={(e) => setRange(e.target.value)} options={[{ value: "all", label: "All time" }, { value: "1", label: "Today" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} className="!w-auto" />
        </div>
      </div>
      <Segmented
        value={status}
        onChange={setStatus}
        className="mb-4"
        options={STATUSES.map((s) => ({
          value: s,
          label: (
            <span className="capitalize">
              {s.replace(/-/g, " ")}{" "}
              <span className="text-[var(--a-muted)]">{s === "all" ? orders.length : s === "active" ? orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length : orders.filter((o) => o.status === s).length}</span>
            </span>
          ),
        }))}
      />
      <Card pad={false}>
        {list.length === 0 ? (
          <EmptyState icon={<Receipt className="size-5" />} title="No orders match" text="Try a different filter or search." />
        ) : (
          <>
            <Table head={["Order", "Date", "Customer", "Items", "Type", "Payment", "Status", "Total"]}>
              {list.map((o) => (
                <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="cursor-pointer transition hover:bg-black/[0.02]">
                  <Td className="font-medium">{o.number}</Td>
                  <Td className="text-[var(--a-muted)]">
                    {fmtDate(o.createdAt, { day: "numeric", month: "short" })} · {fmtTime(o.createdAt)}
                  </Td>
                  <Td>
                    <div>{o.customer.name}</div>
                    <div className="text-xs text-[var(--a-muted)]">{o.customer.phone}</div>
                  </Td>
                  <Td className="max-w-[220px] truncate text-[var(--a-muted)]">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</Td>
                  <Td className="capitalize">{o.fulfillment}</Td>
                  <Td>
                    <span className="uppercase">{o.payment}</span> <span className="text-xs text-[var(--a-muted)]">· {o.paymentStatus}</span>
                  </Td>
                  <Td>
                    <StatusPill status={o.status} />
                  </Td>
                  <Td className="text-right font-medium tabular-nums">{money(o.total, currency)}</Td>
                </tr>
              ))}
            </Table>
            <div className="divide-y divide-[var(--a-line)] md:hidden">
              {list.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="block px-4 py-3.5 active:bg-black/[0.03]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{o.number}</span>
                    <span className="font-medium tabular-nums">{money(o.total, currency)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-[var(--a-muted)]">
                      {o.customer.name} · <span className="capitalize">{o.fulfillment}</span> · {fmtDate(o.createdAt, { day: "numeric", month: "short" })}
                    </span>
                    <StatusPill status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
