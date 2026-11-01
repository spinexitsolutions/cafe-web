"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { guardedStorage } from "@/lib/safeStorage";
import type { Coupon, Fulfillment, Settings } from "@/lib/types";

export interface CartItem {
  key: string; // productId + options hash
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  options: string[];
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  open: boolean;
  wishlist: string[];
  lastOrderId: string | null;
  myOrders: string[];
  lastAdded: { name: string; image: string; qty: number; at: number } | null;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  setCoupon: (code: string | null) => void;
  toggleWish: (productId: string) => void;
  rememberOrder: (id: string) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      open: false,
      wishlist: [],
      lastOrderId: null,
      myOrders: [],
      lastAdded: null,
      add: (item, qty = 1) =>
        set((s) => {
          const key = `${item.productId}::${item.options.join("|")}`;
          const found = s.items.find((i) => i.key === key);
          const items = found
            ? s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { ...item, key, qty }];
          return { items, lastAdded: { name: item.name, image: item.image, qty, at: Date.now() } };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], couponCode: null }),
      setOpen: (open) => set({ open }),
      setCoupon: (couponCode) => set({ couponCode }),
      toggleWish: (id) =>
        set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id] })),
      rememberOrder: (id) => set((s) => ({ lastOrderId: id, myOrders: [id, ...s.myOrders] })),
    }),
    {
      name: "aura-cart-v1",
      ...guardedStorage(),
      skipHydration: true,
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode, wishlist: s.wishlist, lastOrderId: s.lastOrderId, myOrders: s.myOrders }) as CartState,
    },
  ),
);

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  count: number;
}

export function computeTotals(
  items: CartItem[],
  site: Settings["site"],
  coupons: Coupon[],
  couponCode: string | null,
  fulfillment: Fulfillment = "delivery",
  tip = 0,
): Totals {
  const subtotal = items.reduce((a, b) => a + b.unitPrice * b.qty, 0);
  const count = items.reduce((a, b) => a + b.qty, 0);
  let coupon: Coupon | null = null;
  let couponError: string | null = null;
  let discount = 0;
  if (couponCode) {
    const c = coupons.find((x) => x.code.toUpperCase() === couponCode.toUpperCase());
    if (!c || !c.active) couponError = "This code isn't valid";
    else if (c.expiresAt && new Date(c.expiresAt) < new Date()) couponError = "This code has expired";
    else if (subtotal < c.minOrder) couponError = `Add ${site.currency}${c.minOrder - subtotal} more to use this code`;
    else {
      coupon = c;
      discount = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
    }
  }
  const taxable = subtotal - discount;
  const tax = Math.round((taxable * site.taxRate) / 100);
  const deliveryFee = fulfillment === "delivery" && taxable > 0 && taxable < site.freeDeliveryAbove ? site.deliveryFee : 0;
  return { subtotal, discount, tax, deliveryFee, tip, total: taxable + tax + deliveryFee + tip, coupon, couponError, count };
}
