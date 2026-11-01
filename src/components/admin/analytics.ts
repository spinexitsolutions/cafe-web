import type { Customer, Order, OrderStatus } from "@/lib/types";

export const FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "out-for-delivery", "completed"];

/** Next status in the kitchen flow (pickup / dine-in skip "out-for-delivery"). */
export function nextStatus(o: Order): OrderStatus | null {
  if (o.status === "cancelled" || o.status === "completed") return null;
  const flow = o.fulfillment === "delivery" ? FLOW : FLOW.filter((s) => s !== "out-for-delivery");
  const i = flow.indexOf(o.status);
  return flow[i + 1] ?? null;
}

export const NEXT_LABEL: Record<string, string> = {
  confirmed: "Accept",
  preparing: "Start preparing",
  ready: "Mark ready",
  "out-for-delivery": "Send out",
  completed: "Complete",
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const valid = (o: Order) => o.status !== "cancelled";

export function revenueBetween(orders: Order[], from: Date, to: Date) {
  return orders.filter((o) => valid(o) && new Date(o.createdAt) >= from && new Date(o.createdAt) < to);
}

export function periodStats(orders: Order[], days: number) {
  const end = new Date(startOfDay().getTime() + 86400000);
  const start = new Date(end.getTime() - days * 86400000);
  const prevStart = new Date(start.getTime() - days * 86400000);
  const cur = revenueBetween(orders, start, end);
  const prev = revenueBetween(orders, prevStart, start);
  const sum = (l: Order[]) => l.reduce((a, b) => a + b.total, 0);
  const revenue = sum(cur);
  const prevRevenue = sum(prev);
  const change = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : revenue ? 100 : 0;
  return { revenue, prevRevenue, change, count: cur.length, prevCount: prev.length, aov: cur.length ? revenue / cur.length : 0 };
}

export function dailySeries(orders: Order[], days = 14) {
  const today = startOfDay();
  const out: { date: Date; key: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    out.push({ date: d, key: dayKey(d), revenue: 0, orders: 0 });
  }
  const idx = new Map(out.map((x, i) => [x.key, i]));
  for (const o of orders) {
    if (!valid(o)) continue;
    const k = dayKey(startOfDay(new Date(o.createdAt)));
    const i = idx.get(k);
    if (i !== undefined) {
      out[i].revenue += o.total;
      out[i].orders += 1;
    }
  }
  return out;
}

export function topProducts(orders: Order[], limit = 5) {
  const m = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
  for (const o of orders) {
    if (!valid(o)) continue;
    for (const it of o.items) {
      const e = m.get(it.productId) ?? { name: it.name, image: it.image, qty: 0, revenue: 0 };
      e.qty += it.qty;
      e.revenue += it.qty * it.unitPrice;
      m.set(it.productId, e);
    }
  }
  return [...m.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function customerStats(c: Customer, orders: Order[]) {
  const mine = orders.filter((o) => o.customer.email.toLowerCase() === c.email.toLowerCase());
  const paid = mine.filter(valid);
  const ltv = paid.reduce((a, b) => a + b.total, 0);
  return { orders: mine, count: paid.length, ltv, aov: paid.length ? ltv / paid.length : 0, last: mine[0]?.createdAt };
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
