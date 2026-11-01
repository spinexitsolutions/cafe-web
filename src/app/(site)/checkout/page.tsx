"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Banknote, Bike, Check, CreditCard, Loader2, Lock, Minus, Plus, Smartphone, Store, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lines, RollText, Rule } from "@/components/motion/Kit";
import type { Fulfillment, PaymentMethod } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { computeTotals, useCart } from "@/store/cart";
import { useDB } from "@/store/db";

/** One numbered block on the editorial grid: label column + content column. */
function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 * n, ease: [0.22, 1, 0.36, 1] }}
      className="pb-10"
    >
      <Rule />
      <div className="grid gap-5 pt-5 md:grid-cols-12">
        <div className="flex items-center gap-3 md:col-span-4 md:block">
          <p className="text-[13px] font-semibold">
            <span className="tabular-nums text-accent">({String(n).padStart(2, "0")})</span>{" "}
            <span className="text-muted">Step</span>
          </p>
          <h2 className="display display-n flex items-center gap-2 text-2xl uppercase md:mt-2 md:text-3xl">
            {title}
            <AnimatePresence>
              {done && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="grid size-6 place-items-center rounded-full bg-accent text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </h2>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </motion.section>
  );
}

/** Hairline-grid option tiles; the active one fills with ink. */
function Tiles<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; icon: React.ElementType; hint?: string }[] }) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-[var(--radius)] border border-ink/12 bg-ink/12", options.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map(({ id, label, icon: Icon, hint }) => {
        const active = value === id;
        return (
          <button type="button" key={id} onClick={() => onChange(id)} className={cn("relative flex flex-col items-start gap-6 p-3.5 text-left transition-colors duration-300 sm:p-4", active ? "text-bg" : "bg-bg hover:bg-surface")}>
            {active && <motion.span layoutId={`tile-${options.map((o) => o.id).join("")}`} className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 450, damping: 38 }} />}
            <Icon className="relative size-5" />
            <span className="relative">
              <span className="block text-sm font-semibold">{label}</span>
              {hint && <span className={cn("block text-[11px]", active ? "text-bg/60" : "text-muted")}>{hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, setCoupon, clear, rememberOrder, setQty } = useCart();
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
      <div className="px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pt-24">
        <Rule />
        <div className="grid gap-6 pt-5 md:grid-cols-12">
          <p className="text-[13px] font-semibold md:col-span-3">
            <span className="text-accent">(0)</span> <span className="text-muted">Items in bag</span>
          </p>
          <div className="md:col-span-9">
            <h1 className="display text-[clamp(2.6rem,9vw,7rem)] uppercase">
              <Lines text="Your bag" onMount /> <em><Lines text="is empty." onMount delay={0.1} /></em>
            </h1>
            <div className="mt-8 flex gap-3">
              <Link href="/menu" className="group flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-bg"><RollText>Browse the menu</RollText></Link>
              <Link href="/shop" className="group flex h-12 items-center rounded-full px-6 text-sm font-semibold ring-1 ring-ink/20"><RollText>Shop beans</RollText></Link>
            </div>
          </div>
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

  const detailsDone = !!form.name.trim() && /^[+\d\s-]{8,}$/.test(form.phone) && /^\S+@\S+\.\S+$/.test(form.email) && (fulfillment !== "delivery" || form.address.trim().length >= 8) && (fulfillment !== "dine-in" || !!form.table.trim());
  const payDone = payment === "cod" || (payment === "upi" && /^[\w.-]+@[\w]+$/.test(form.upi)) || (payment === "card" && form.card.replace(/\s/g, "").length >= 12 && /^\d{2}\/\d{2}$/.test(form.exp) && form.cvc.length >= 3);

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

  /** Underlined editorial field. Called as a function (not a component) so inputs keep focus. */
  const F = ({ k, label, type = "text", ph, area, className }: { k: keyof typeof form; label: string; type?: string; ph?: string; area?: boolean; className?: string }) => (
    <label className={cn("group block", className)} data-error={!!errors[k]}>
      <span className="flex justify-between text-[12px] font-semibold text-muted">
        {label}
        {errors[k] && <span className="text-red-600">{errors[k]}</span>}
      </span>
      {area ? (
        <textarea
          value={form[k]}
          onChange={set(k)}
          placeholder={ph}
          rows={2}
          className={cn("w-full resize-none border-b-2 bg-transparent py-2.5 text-lg outline-none transition-colors placeholder:text-ink/25 focus:border-accent", errors[k] ? "border-red-400" : "border-ink/15")}
        />
      ) : (
        <input
          type={type}
          value={form[k]}
          onChange={set(k)}
          placeholder={ph}
          className={cn("w-full border-b-2 bg-transparent py-2.5 text-lg outline-none transition-colors placeholder:text-ink/25 focus:border-accent", errors[k] ? "border-red-400" : "border-ink/15")}
        />
      )}
    </label>
  );

  const rows: [string, string, boolean?][] = [
    ["Subtotal", money(t.subtotal, cur)],
    ...(t.discount ? ([["Discount", `− ${money(t.discount, cur)}`, true]] as [string, string, boolean][]) : []),
    [`GST ${site.taxRate}%`, money(t.tax, cur)],
    ...(fulfillment === "delivery" ? ([["Delivery", t.deliveryFee ? money(t.deliveryFee, cur) : "Free"]] as [string, string][]) : []),
    ...(t.tip ? ([["Tip for the team", money(t.tip, cur)]] as [string, string][]) : []),
  ];

  return (
    <div className="px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pt-24">
      {/* Header */}
      <Rule />
      <div className="grid gap-4 pt-5 md:grid-cols-12">
        <p className="text-[13px] font-semibold md:col-span-3">
          <span className="text-accent">({t.count})</span> <span className="text-muted">Items · {money(t.subtotal, cur)}</span>
        </p>
        <h1 className="display text-[clamp(2.8rem,10vw,8rem)] uppercase md:col-span-9">
          <Lines text="Check" onMount />
          <em>
            <Lines text="out." onMount delay={0.1} />
          </em>
        </h1>
      </div>
      {!site.acceptingOrders && <div className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800">We’re not taking online orders right now. Please call us on {site.phone}.</div>}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        {/* Steps */}
        <div>
          <Step n={1} title="Fulfilment" done>
            <Tiles
              value={fulfillment}
              onChange={setFulfillment}
              options={[
                { id: "delivery", label: "Delivery", icon: Bike, hint: "30–40 min" },
                { id: "pickup", label: "Pickup", icon: Store, hint: "~10 min" },
                { id: "dine-in", label: "Dine-in", icon: UtensilsCrossed, hint: "To your table" },
              ]}
            />
            <div className="mt-4 flex gap-5 text-sm font-semibold">
              {(["asap", "later"] as const).map((w) => (
                <button key={w} type="button" onClick={() => setWhen(w)} className={cn("relative pb-1.5 transition-colors", when === w ? "text-ink" : "text-muted")}>
                  {w === "asap" ? "As soon as possible" : "Schedule for later"}
                  {when === w && <motion.span layoutId="when-line" className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {when === "later" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" data-error={!!errors.time}>
                  <div className="flex gap-2 overflow-x-auto pt-4 no-scrollbar">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => setTime(s)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition", time === s ? "bg-ink text-bg ring-ink" : "ring-ink/15 hover:ring-ink/40")}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="mt-2 text-xs text-red-600">{errors.time}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </Step>

          <Step n={2} title="Details" done={detailsDone}>
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {F({ k: "name", label: "Full name", ph: "Ananya Rao" })}
              {F({ k: "phone", label: "Phone", type: "tel", ph: "+91 98765 43210" })}
              {F({ k: "email", label: "Email", type: "email", ph: "you@email.com", className: "sm:col-span-2" })}
              {fulfillment === "delivery" && F({ k: "address", label: "Delivery address", ph: "Flat, building, street, area", area: true, className: "sm:col-span-2" })}
              {fulfillment === "dine-in" && F({ k: "table", label: "Table number", ph: "e.g. 7" })}
              {F({ k: "notes", label: "Kitchen notes (optional)", ph: "Extra hot, no sugar…", className: "sm:col-span-2" })}
            </div>
          </Step>

          <Step n={3} title="Payment" done={payDone}>
            <Tiles
              value={payment}
              onChange={setPayment}
              options={[
                { id: "upi", label: "UPI", icon: Smartphone, hint: "GPay, PhonePe…" },
                { id: "card", label: "Card", icon: CreditCard, hint: "Visa, Mastercard" },
                { id: "cod", label: fulfillment === "delivery" ? "Cash" : "At counter", icon: Banknote, hint: "Pay on arrival" },
              ]}
            />
            <div className="mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-3">
              {payment === "upi" && F({ k: "upi", label: "UPI ID", ph: "name@okbank", className: "sm:col-span-3" })}
              {payment === "card" && (
                <>
                  {F({ k: "card", label: "Card number", ph: "4242 4242 4242 4242", className: "sm:col-span-3" })}
                  {F({ k: "exp", label: "Expiry", ph: "MM/YY" })}
                  {F({ k: "cvc", label: "CVC", ph: "123" })}
                </>
              )}
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted">
              <Lock className="size-3.5" /> Demo checkout — no real payment is taken.
            </p>
          </Step>

          <Step n={4} title="Say thanks" done={tip > 0}>
            <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius)] border border-ink/12 bg-ink/12">
              {[0, 20, 40, 60].map((v) => (
                <button key={v} type="button" onClick={() => setTip(v)} className={cn("relative py-4 text-sm font-semibold transition-colors", tip === v ? "text-bg" : "bg-bg hover:bg-surface")}>
                  {tip === v && <motion.span layoutId="tip" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 450, damping: 38 }} />}
                  <span className="relative">{v ? money(v, cur) : "No tip"}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">100% of tips go to the baristas and bakers on shift.</p>
          </Step>
        </div>

        {/* Receipt */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            className="relative bg-ink text-bg"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-baseline justify-between">
                <p className="display text-2xl uppercase">{site.shortName}®</p>
                <p className="text-[11px] font-semibold text-bg/50">Order summary</p>
              </div>
              <div className="my-5 border-t border-dashed border-bg/25" />
              <ul className="max-h-72 space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
                {items.map((i) => (
                  <li key={i.key} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="size-12 shrink-0 rounded-[6px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 text-sm">
                        <span className="truncate font-semibold">{i.name}</span>
                        <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/30" />
                        <span className="tabular-nums">{money(i.unitPrice * i.qty, cur)}</span>
                      </div>
                      {i.options.length > 0 && <p className="truncate text-[11px] text-bg/50">{i.options.join(" · ")}</p>}
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <button onClick={() => setQty(i.key, i.qty - 1)} className="grid size-6 place-items-center rounded-full ring-1 ring-bg/25 hover:bg-bg/10" aria-label="Decrease">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-4 text-center tabular-nums">{i.qty}</span>
                        <button onClick={() => setQty(i.key, i.qty + 1)} className="grid size-6 place-items-center rounded-full ring-1 ring-bg/25 hover:bg-bg/10" aria-label="Increase">
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCoupon(code.trim().toUpperCase() || null);
                }}
                className="mt-6 flex items-end gap-3"
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="min-w-0 flex-1 border-b-2 border-bg/20 bg-transparent py-2 text-sm font-semibold uppercase tracking-wider outline-none placeholder:text-bg/30 focus:border-accent"
                />
                {t.coupon ? (
                  <button type="button" onClick={() => { setCoupon(null); setCode(""); }} className="grid size-9 place-items-center rounded-full ring-1 ring-bg/25" aria-label="Remove code">
                    <X className="size-4" />
                  </button>
                ) : (
                  <button className="h-9 rounded-full bg-bg px-4 text-xs font-bold text-ink">Apply</button>
                )}
              </form>
              {couponCode && t.couponError && <p className="mt-2 text-xs text-red-300">{t.couponError}</p>}
              {t.coupon && <p className="mt-2 text-xs text-emerald-300">✓ {t.coupon.code} — {t.coupon.description}</p>}
              {!couponCode && <p className="mt-2 text-[11px] text-bg/40">Try AURA10 for 10% off.</p>}

              <div className="my-5 border-t border-dashed border-bg/25" />
              <dl className="space-y-2 text-sm">
                {rows.map(([k, v, good]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <dt className="text-bg/60">{k}</dt>
                    <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/20" />
                    <dd className={cn("tabular-nums", good && "text-emerald-300")}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-end justify-between border-t border-bg/20 pt-4">
                <span className="text-sm font-semibold">Total</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={t.total} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="display text-4xl tabular-nums">
                    {money(t.total, cur)}
                  </motion.span>
                </AnimatePresence>
              </div>
              {settings.loyalty.enabled && (
                <p className="mt-3 text-xs text-bg/60">
                  + <b className="text-bg">{Math.floor((t.total / 100) * settings.loyalty.pointsPer100)} Aura points</b> with this order
                </p>
              )}
              {t.subtotal < site.minOrder && <p className="mt-3 text-xs text-red-300">Minimum order is {money(site.minOrder, cur)}.</p>}

              <button
                onClick={submit}
                disabled={placing || !site.acceptingOrders || t.subtotal < site.minOrder}
                className="group relative mt-6 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-accent pl-6 pr-2 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {placing ? (
                    <motion.span key="l" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </motion.span>
                  ) : (
                    <motion.span key="p" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                      <RollText>{`Place order · ${money(t.total, cur)}`}</RollText>
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="grid size-10 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
            </div>
            {/* perforated receipt edge */}
            <div aria-hidden className="absolute inset-x-0 -bottom-[7px] h-[14px]" style={{ background: "radial-gradient(circle at 7px 7px, var(--bg) 6px, transparent 6.5px) repeat-x", backgroundSize: "14px 14px" }} />
          </motion.div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted">
            <Lock className="size-3.5" /> Secure checkout · Free cancellation within 2 minutes
          </p>
        </aside>
      </div>
    </div>
  );
}
