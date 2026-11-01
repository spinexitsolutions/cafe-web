"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Bike, Check, CreditCard, Loader2, Lock, ShoppingBag, Smartphone, Store, Tag, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Fulfillment, PaymentMethod } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { computeTotals, useCart } from "@/store/cart";
import { useDB } from "@/store/db";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-line sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-medium">
        <span className="grid size-7 place-items-center rounded-full bg-ink text-xs text-bg">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Seg<T extends string>({ value, onChange, options, id }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; icon: React.ElementType; hint?: string }[]; id: string }) {
  return (
    <div className={cn("grid gap-2", options.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map(({ id: oid, label, icon: Icon, hint }) => (
        <button
          type="button"
          key={oid}
          onClick={() => onChange(oid)}
          className={cn("relative flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left ring-1 transition sm:p-4", value === oid ? "ring-ink" : "ring-line hover:ring-ink/30")}
        >
          {value === oid && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-2xl bg-soft ring-2 ring-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          <Icon className="relative size-5" />
          <span className="relative text-sm font-medium">{label}</span>
          {hint && <span className="relative text-[11px] leading-tight text-muted">{hint}</span>}
        </button>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, setCoupon, clear, rememberOrder } = useCart();
  const settings = useDB((s) => s.settings);
  const coupons = useDB((s) => s.coupons);
  const placeOrder = useDB((s) => s.placeOrder);
  const hydrated = useDB((s) => s.hydrated);
  const site = settings.site;
  const cur = site.currency;

  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [when, setWhen] = useState<"asap" | "later">("asap");
  const [time, setTime] = useState("");
  const [tip, setTip] = useState(0);
  const [code, setCode] = useState(couponCode ?? "");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", table: "", notes: "", upi: "", card: "", exp: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const t = computeTotals(items, site, coupons, couponCode, fulfillment, tip);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  if (!hydrated) return <div className="min-h-dvh" />;

  if (items.length === 0 && !placing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-44 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-accent-soft">
          <ShoppingBag className="size-8 text-accent" />
        </div>
        <h1 className="display mt-6 text-5xl">Your bag is empty</h1>
        <p className="mt-2 text-muted">Add something delicious to get started.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/menu" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg">Menu</Link>
          <Link href="/shop" className="rounded-full px-6 py-3 text-sm font-medium ring-1 ring-line">Shop</Link>
        </div>
      </div>
    );
  }

  const slots = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.now() + (i + 2) * 30 * 60000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 0);
    if (d.getMinutes() === 0) d.setHours(d.getHours() + 1);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }).filter((v, i, a) => a.indexOf(v) === i);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[+\d\s-]{8,}$/.test(form.phone)) e.phone = "Enter a valid phone";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (fulfillment === "delivery" && form.address.trim().length < 8) e.address = "Please add your full address";
    if (fulfillment === "dine-in" && !form.table.trim()) e.table = "Which table are you at?";
    if (when === "later" && !time) e.time = "Pick a time";
    if (payment === "upi" && !/^[\w.-]+@[\w]+$/.test(form.upi)) e.upi = "e.g. name@okbank";
    if (payment === "card") {
      if (form.card.replace(/\s/g, "").length < 12) e.card = "Card number";
      if (!/^\d{2}\/\d{2}$/.test(form.exp)) e.exp = "MM/YY";
      if (form.cvc.length < 3) e.cvc = "CVC";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!site.acceptingOrders || t.subtotal < site.minOrder) return;
    if (!validate()) {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const order = placeOrder({
      customer: { name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() },
      items: items.map((i) => ({ productId: i.productId, name: i.name, image: i.image, unitPrice: i.unitPrice, qty: i.qty, options: i.options })),
      subtotal: t.subtotal,
      discount: t.discount,
      tax: t.tax,
      deliveryFee: t.deliveryFee,
      tip: t.tip,
      total: t.total,
      couponCode: t.coupon?.code,
      fulfillment,
      address: fulfillment === "delivery" ? form.address : undefined,
      tableNo: fulfillment === "dine-in" ? form.table : undefined,
      scheduledFor: when === "later" ? time : undefined,
      payment,
      notes: form.notes || undefined,
    });
    rememberOrder(order.id);
    router.push(`/order/${order.id}`);
    setTimeout(clear, 300);
  };

  const F = ({ k, label, type = "text", ph, area, className }: { k: keyof typeof form; label: string; type?: string; ph?: string; area?: boolean; className?: string }) => (
    <label className={cn("block", className)} data-error={!!errors[k]}>
      <span className="mb-1.5 flex justify-between text-xs font-medium text-muted">
        {label}
        {errors[k] && <span className="text-red-600">{errors[k]}</span>}
      </span>
      {area ? (
        <textarea value={form[k]} onChange={set(k)} placeholder={ph} className={cn("field min-h-20", errors[k] && "!border-red-400")} />
      ) : (
        <input type={type} value={form[k]} onChange={set(k)} placeholder={ph} className={cn("field", errors[k] && "!border-red-400")} />
      )}
    </label>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-8 lg:pt-24">
      <h1 className="display text-[clamp(3rem,9vw,6.5rem)]">
        Check<em className="text-accent">out</em>
      </h1>
      {!site.acceptingOrders && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">We’re not taking online orders right now. Please check back soon — or call us on {site.phone}.</div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-4">
          <Step n={1} title="How would you like it?">
            <Seg
              id="ful"
              value={fulfillment}
              onChange={setFulfillment}
              options={[
                { id: "delivery", label: "Delivery", icon: Bike, hint: "30–40 min" },
                { id: "pickup", label: "Pickup", icon: Store, hint: "Ready in ~10 min" },
                { id: "dine-in", label: "Dine-in", icon: UtensilsCrossed, hint: "To your table" },
              ]}
            />
            <div className="mt-4 flex gap-2">
              {(["asap", "later"] as const).map((w) => (
                <button key={w} type="button" onClick={() => setWhen(w)} className={cn("rounded-full px-4 py-2 text-sm ring-1 transition", when === w ? "bg-ink text-bg ring-ink" : "ring-line")}>
                  {w === "asap" ? "As soon as possible" : "Schedule"}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {when === "later" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" data-error={!!errors.time}>
                  <div className="flex gap-2 overflow-x-auto pt-4 no-scrollbar">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => setTime(s)} className={cn("shrink-0 rounded-xl px-3.5 py-2 text-sm ring-1 transition", time === s ? "bg-accent text-white ring-accent" : "ring-line")}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="mt-2 text-xs text-red-600">{errors.time}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </Step>

          <Step n={2} title="Your details">
            <div className="grid gap-3 sm:grid-cols-2">
              {F({ k: "name", label: "Full name", ph: "Ananya Rao" })}
              {F({ k: "phone", label: "Phone", type: "tel", ph: "+91 98765 43210" })}
              {F({ k: "email", label: "Email", type: "email", ph: "you@email.com", className: "sm:col-span-2" })}
              {fulfillment === "delivery" && F({ k: "address", label: "Delivery address", ph: "Flat, building, street, area", area: true, className: "sm:col-span-2" })}
              {fulfillment === "dine-in" && F({ k: "table", label: "Table number", ph: "e.g. 7" })}
              {F({ k: "notes", label: "Notes for the kitchen (optional)", ph: "Extra hot, no sugar…", className: "sm:col-span-2" })}
            </div>
          </Step>

          <Step n={3} title="Payment">
            <Seg
              id="pay"
              value={payment}
              onChange={setPayment}
              options={[
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "cod", label: fulfillment === "delivery" ? "Cash on delivery" : "Pay at counter", icon: Banknote },
              ]}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {payment === "upi" && F({ k: "upi", label: "UPI ID", ph: "name@okbank", className: "sm:col-span-3" })}
              {payment === "card" && (
                <>
                  {F({ k: "card", label: "Card number", ph: "4242 4242 4242 4242", className: "sm:col-span-3" })}
                  {F({ k: "exp", label: "Expiry", ph: "MM/YY" })}
                  {F({ k: "cvc", label: "CVC", ph: "123" })}
                </>
              )}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Lock className="size-3.5" /> Demo checkout — no real payment is taken.
            </p>
          </Step>

          <Step n={4} title="Add a tip for the team">
            <div className="grid grid-cols-4 gap-2">
              {[0, 20, 40, 60].map((v) => (
                <button key={v} type="button" onClick={() => setTip(v)} className={cn("rounded-2xl py-3 text-sm font-medium ring-1 transition", tip === v ? "bg-ink text-bg ring-ink" : "ring-line hover:ring-ink/30")}>
                  {v ? money(v, cur) : "No tip"}
                </button>
              ))}
            </div>
          </Step>
        </div>

        <aside className="rounded-card bg-surface p-5 ring-1 ring-line sm:p-7 lg:sticky lg:top-20">
          <h2 className="text-lg font-medium">Order summary</h2>
          <ul className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="size-14 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-bg">{i.qty}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  {i.options.length > 0 && <p className="truncate text-xs text-muted">{i.options.join(" · ")}</p>}
                </div>
                <span className="text-sm tabular-nums">{money(i.unitPrice * i.qty, cur)}</span>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCoupon(code.trim().toUpperCase() || null);
            }}
            className="mt-5 flex gap-2"
          >
            <label className="flex flex-1 items-center gap-2 rounded-full bg-bg px-4 ring-1 ring-line focus-within:ring-accent">
              <Tag className="size-4 text-muted" />
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo code" className="h-11 min-w-0 flex-1 bg-transparent text-sm uppercase outline-none" />
            </label>
            {t.coupon ? (
              <button type="button" onClick={() => { setCoupon(null); setCode(""); }} className="grid size-11 place-items-center rounded-full ring-1 ring-line" aria-label="Remove code">
                <X className="size-4" />
              </button>
            ) : (
              <button className="rounded-full bg-ink px-5 text-sm font-medium text-bg">Apply</button>
            )}
          </form>
          {couponCode && t.couponError && <p className="mt-2 text-xs text-red-600">{t.couponError}</p>}
          {t.coupon && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
              <Check className="size-3.5" /> {t.coupon.code} applied — {t.coupon.description}
            </p>
          )}
          {!couponCode && <p className="mt-2 text-xs text-muted">Try AURA10 for 10% off.</p>}

          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
            {[
              ["Subtotal", money(t.subtotal, cur)],
              ...(t.discount ? [["Discount", `− ${money(t.discount, cur)}`]] : []),
              [`GST (${site.taxRate}%)`, money(t.tax, cur)],
              ...(fulfillment === "delivery" ? [["Delivery", t.deliveryFee ? money(t.deliveryFee, cur) : "Free"]] : []),
              ...(t.tip ? [["Tip", money(t.tip, cur)]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className={cn("tabular-nums", k === "Discount" && "text-emerald-700")}>{v}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="display text-3xl tabular-nums">{money(t.total, cur)}</dd>
            </div>
          </dl>
          {settings.loyalty.enabled && (
            <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-xs">
              You’ll earn <b>{Math.floor((t.total / 100) * settings.loyalty.pointsPer100)} Aura points</b> with this order ✦
            </p>
          )}
          {t.subtotal < site.minOrder && <p className="mt-3 text-xs text-red-600">Minimum order is {money(site.minOrder, cur)}.</p>}

          <button
            onClick={submit}
            disabled={placing || !site.acceptingOrders || t.subtotal < site.minOrder}
            className="relative mt-5 flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-accent font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {placing ? (
                <motion.span key="l" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Processing payment…
                </motion.span>
              ) : (
                <motion.span key="p" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  Place order · {money(t.total, cur)}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </aside>
      </div>
    </div>
  );
}
