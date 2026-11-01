"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { guardedStorage } from "@/lib/safeStorage";
import { buildSeed } from "@/lib/seed";
import type {
  CollectionKey,
  Customer,
  DB,
  EventBooking,
  Message,
  Order,
  OrderStatus,
  Reservation,
  Review,
  Settings,
} from "@/lib/types";
import { uid } from "@/lib/utils";

type Item<K extends CollectionKey> = DB[K][number];

interface Actions {
  hydrated: boolean;
  setHydrated: () => void;
  upsert: <K extends CollectionKey>(key: K, item: Item<K>) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
  reorder: <K extends CollectionKey>(key: K, ids: string[]) => void;
  updateSettings: <S extends keyof Settings>(section: S, value: Partial<Settings[S]> | Settings[S]) => void;
  replaceSettings: (s: Settings) => void;
  resetDemo: () => void;
  importDB: (db: DB) => void;

  placeOrder: (o: Omit<Order, "id" | "number" | "createdAt" | "status" | "timeline" | "paymentStatus">) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  addReservation: (r: Omit<Reservation, "id" | "createdAt" | "status">) => Reservation;
  sendMessage: (m: Omit<Message, "id" | "createdAt" | "status">) => void;
  subscribe: (email: string) => boolean;
  bookEvent: (b: Omit<EventBooking, "id" | "createdAt">) => boolean;
  addReview: (r: Omit<Review, "id" | "createdAt" | "approved">) => void;
  addCustomerNote: (customerId: string, text: string) => void;
  adjustPoints: (customerId: string, delta: number, reason: string) => void;
}

export type Store = DB & Actions;

const nowIso = () => new Date().toISOString();

/** Create or update a CRM contact and log an activity against it. */
function touchCustomer(
  state: DB,
  who: { name: string; email: string; phone?: string },
  source: Customer["source"],
  activity: { type: DB["activities"][number]["type"]; text: string },
  points = 0,
): Pick<DB, "customers" | "activities"> {
  const email = who.email.trim().toLowerCase();
  const existing = state.customers.find((c) => c.email.toLowerCase() === email);
  let customers: Customer[];
  let id: string;
  if (existing) {
    id = existing.id;
    const orders = activity.type === "order" ? 1 : 0;
    const prevOrders = state.orders.filter((o) => o.customer.email.toLowerCase() === email).length;
    const total = prevOrders + orders;
    const stage: Customer["stage"] =
      existing.stage === "vip" ? "vip" : total >= 5 ? "vip" : total >= 2 ? "regular" : total >= 1 ? "new" : existing.stage;
    customers = state.customers.map((c) =>
      c.id === id
        ? {
            ...c,
            name: who.name || c.name,
            phone: who.phone || c.phone,
            points: c.points + points,
            lastActivity: nowIso(),
            stage,
          }
        : c,
    );
  } else {
    id = uid("cu-");
    customers = [
      {
        id,
        name: who.name || email.split("@")[0],
        email,
        phone: who.phone ?? "",
        tags: [],
        notes: "",
        stage: activity.type === "order" ? "new" : "lead",
        source,
        points,
        createdAt: nowIso(),
        lastActivity: nowIso(),
      },
      ...state.customers,
    ];
  }
  const activities = [{ id: uid("a-"), customerId: id, type: activity.type, text: activity.text, at: nowIso() }, ...state.activities];
  return { customers, activities };
}

export const useDB = create<Store>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      upsert: (key, item) =>
        set((s) => {
          const list = s[key] as { id: string }[];
          const exists = list.some((x) => x.id === (item as { id: string }).id);
          const next = exists
            ? list.map((x) => (x.id === (item as { id: string }).id ? item : x))
            : [item, ...list];
          return { [key]: next } as Partial<Store>;
        }),
      remove: (key, id) =>
        set((s) => ({ [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<Store>),
      reorder: (key, ids) =>
        set((s) => {
          const list = s[key] as { id: string }[];
          const map = new Map(list.map((x) => [x.id, x]));
          const ordered = ids.map((id) => map.get(id)).filter(Boolean);
          const rest = list.filter((x) => !ids.includes(x.id));
          return { [key]: [...ordered, ...rest] } as Partial<Store>;
        }),
      updateSettings: (section, value) =>
        set((s) => {
          const current = s.settings[section];
          const next = Array.isArray(current) || Array.isArray(value) ? value : { ...(current as object), ...(value as object) };
          return { settings: { ...s.settings, [section]: next } };
        }),
      replaceSettings: (settings) => set({ settings }),
      resetDemo: () => set({ ...buildSeed() }),
      importDB: (db) => set({ ...db }),

      placeOrder: (o) => {
        const s = get();
        const order: Order = {
          ...o,
          id: uid("o-"),
          number: `AU-${10240 + s.orders.length + 1}`,
          createdAt: nowIso(),
          status: "pending",
          paymentStatus: o.payment === "cod" ? "pending" : "paid",
          timeline: [{ status: "pending", at: nowIso() }],
        };
        const points = s.settings.loyalty.enabled ? Math.floor((order.total / 100) * s.settings.loyalty.pointsPer100) : 0;
        const crm = touchCustomer(
          { ...s, orders: [order, ...s.orders] },
          order.customer,
          "order",
          { type: "order", text: `Placed order ${order.number} · ${order.items.length} item(s)` },
          points,
        );
        // decrement stock + coupon usage
        const products = s.products.map((p) => {
          const qty = order.items.filter((i) => i.productId === p.id).reduce((a, b) => a + b.qty, 0);
          return qty && p.stock < 999 ? { ...p, stock: Math.max(0, p.stock - qty) } : p;
        });
        const coupons = order.couponCode
          ? s.coupons.map((c) => (c.code === order.couponCode ? { ...c, uses: c.uses + 1 } : c))
          : s.coupons;
        set({ orders: [order, ...s.orders], products, coupons, ...crm });
        return order;
      },
      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  paymentStatus: status === "completed" ? "paid" : status === "cancelled" && o.paymentStatus === "paid" ? "refunded" : o.paymentStatus,
                  timeline: [...o.timeline, { status, at: nowIso() }],
                }
              : o,
          ),
        })),
      addReservation: (r) => {
        const s = get();
        const res: Reservation = { ...r, id: uid("r-"), createdAt: nowIso(), status: "pending" };
        const crm = touchCustomer(s, r, "reservation", {
          type: "reservation",
          text: `Booked a table for ${r.guests} on ${r.date} at ${r.time}`,
        });
        set({ reservations: [res, ...s.reservations], ...crm });
        return res;
      },
      sendMessage: (m) => {
        const s = get();
        const msg: Message = { ...m, id: uid("m-"), createdAt: nowIso(), status: "new" };
        const crm = touchCustomer(s, m, "contact", { type: "message", text: `Sent a message: “${m.subject}”` });
        set({ messages: [msg, ...s.messages], ...crm });
      },
      subscribe: (email) => {
        const s = get();
        const e = email.trim().toLowerCase();
        if (s.subscribers.some((x) => x.email === e)) return false;
        const crm = touchCustomer(s, { name: "", email: e }, "newsletter", { type: "newsletter", text: "Subscribed to the newsletter" });
        set({ subscribers: [{ id: uid("s-"), email: e, createdAt: nowIso() }, ...s.subscribers], ...crm });
        return true;
      },
      bookEvent: (b) => {
        const s = get();
        const ev = s.events.find((e) => e.id === b.eventId);
        if (!ev || ev.booked + b.seats > ev.seats) return false;
        const crm = touchCustomer(s, b, "event", { type: "event", text: `Booked ${b.seats} seat(s) for “${ev.title}”` });
        set({
          events: s.events.map((e) => (e.id === ev.id ? { ...e, booked: e.booked + b.seats } : e)),
          eventBookings: [{ ...b, id: uid("eb-"), createdAt: nowIso() }, ...s.eventBookings],
          ...crm,
        });
        return true;
      },
      addReview: (r) =>
        set((s) => ({ reviews: [{ ...r, id: uid("rv-"), createdAt: nowIso(), approved: false }, ...s.reviews] })),
      addCustomerNote: (customerId, text) =>
        set((s) => ({ activities: [{ id: uid("a-"), customerId, type: "note", text, at: nowIso() }, ...s.activities] })),
      adjustPoints: (customerId, delta, reason) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === customerId ? { ...c, points: Math.max(0, c.points + delta) } : c)),
          activities: [
            { id: uid("a-"), customerId, type: "points", text: `${delta > 0 ? "+" : ""}${delta} points · ${reason}`, at: nowIso() },
            ...s.activities,
          ],
        })),
    }),
    {
      name: "aura-db-v3",
      ...guardedStorage(),
      skipHydration: true,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hydrated, ...rest } = s;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (typeof v !== "function") out[k] = v;
        return out as unknown as Store;
      },
    },
  ),
);

/** Read the whole DB (without actions) — for export. */
export function snapshot(): DB {
  const s = useDB.getState();
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) if (typeof v !== "function" && k !== "hydrated") out[k] = v;
  return out as unknown as DB;
}

/** Sync across tabs: when admin edits in one tab, the storefront in another updates live. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "aura-db-v3") useDB.persist.rehydrate();
  });
}
