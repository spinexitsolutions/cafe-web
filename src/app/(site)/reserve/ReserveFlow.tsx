"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { IMG, img } from "@/lib/seed";
import type { Reservation } from "@/lib/types";
import { cn, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

const AREAS: { id: Reservation["area"]; label: string; desc: string; image: string }[] = [
  { id: "indoor", label: "Main room", desc: "Bright, buzzy, by the bar", image: img(IMG.interiorWood, 600) },
  { id: "garden", label: "Garden", desc: "Under the neem tree", image: img(IMG.interiorWindow, 600) },
  { id: "bar", label: "Slow bar", desc: "Watch the baristas work", image: img(IMG.counter, 600) },
  { id: "private", label: "Private corner", desc: "For 6–12 guests", image: img(IMG.interiorDark, 600) },
];
const OCCASIONS = ["None", "Birthday", "Anniversary", "Business", "Date", "Celebration"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ReserveFlow() {
  const params = useSearchParams();
  const site = useDB((s) => s.settings.site);
  const reservations = useDB((s) => s.reservations);
  const addReservation = useDB((s) => s.addReservation);

  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const initialDay = (() => {
    const w = params.get("when");
    if (w === "tomorrow") return 1;
    if (w === "weekend") return days.findIndex((d) => d.getDay() === 6);
    return 0;
  })();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [day, setDay] = useState(Math.max(0, initialDay));
  const [guests, setGuests] = useState(Math.min(12, Math.max(1, Number(params.get("guests")) || 2)));
  const [time, setTime] = useState("");
  const [area, setArea] = useState<Reservation["area"]>("indoor");
  const [form, setForm] = useState({ name: "", email: "", phone: "", occasion: "None", notes: "" });
  const [done, setDone] = useState<Reservation | null>(null);

  const date = days[day];
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const hours = site.hours.find((h) => h.day === dayName);
  const slots = useMemo(() => {
    if (!hours || hours.closed) return [];
    const [oh, om] = hours.open.split(":").map(Number);
    const [ch] = hours.close.split(":").map(Number);
    const out: string[] = [];
    for (let m = oh * 60 + om + 30; m <= (ch - 1) * 60; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    const now = new Date();
    return out.filter((t) => day > 0 || Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) > now.getHours() * 60 + now.getMinutes() + 30);
  }, [hours, day]);
  const busy = (t: string) => reservations.filter((r) => r.date === iso(date) && r.time === t && r.status !== "cancelled").reduce((a, b) => a + b.guests, 0) >= 16;

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const valid = [time !== "" && guests > 0, true, form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && form.phone.trim().length >= 8];

  const submit = () => {
    const r = addReservation({
      name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(),
      date: iso(date), time, guests, area,
      occasion: form.occasion === "None" ? undefined : form.occasion, notes: form.notes || undefined,
    });
    setDone(r);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-36 text-center">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="mx-auto grid size-20 place-items-center rounded-full bg-accent text-white">
          <CalendarCheck className="size-9" />
        </motion.div>
        <h1 className="display mt-8 text-6xl">See you <em className="text-accent">soon.</em></h1>
        <p className="mt-4 text-muted">Your request for <b className="text-ink">{done.guests} guests</b> on <b className="text-ink">{date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</b> at <b className="text-ink">{to12h(done.time)}</b> is in. We’ll confirm by SMS and email to {done.email} shortly.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/menu" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg">Peek at the menu</Link>
          <Link href="/" className="rounded-full px-6 py-3 text-sm font-medium ring-1 ring-line">Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow="Reservations" title="Save me" italic="a seat." intro="Book up to three weeks ahead for parties of 1–12. Walk-ins always welcome, too." />
      <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-8">
        <div className="mb-6 flex gap-2">
          {["When", "Where", "Who"].map((l, i) => (
            <button key={l} onClick={() => i < step && go(i)} className="flex-1 text-left">
              <div className="h-1 overflow-hidden rounded-full bg-line">
                <motion.div className="h-full bg-accent" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
              </div>
              <p className={cn("mt-2 text-xs font-medium", i <= step ? "text-ink" : "text-muted")}>{String(i + 1).padStart(2, "0")} · {l}</p>
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-card bg-surface p-5 ring-1 ring-line sm:p-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {step === 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Guests</h2>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid size-10 place-items-center rounded-full ring-1 ring-line" aria-label="Fewer"><Minus className="size-4" /></button>
                      <span className="display w-8 text-center text-4xl tabular-nums">{guests}</span>
                      <button onClick={() => setGuests(Math.min(12, guests + 1))} className="grid size-10 place-items-center rounded-full ring-1 ring-line" aria-label="More"><Plus className="size-4" /></button>
                    </div>
                  </div>
                  <h2 className="mt-8 text-lg font-medium">Date</h2>
                  <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar sm:-mx-8 sm:px-8">
                    {days.map((d, i) => {
                      const closed = site.hours.find((h) => h.day === d.toLocaleDateString("en-US", { weekday: "long" }))?.closed;
                      return (
                        <button key={i} disabled={closed} onClick={() => { setDay(i); setTime(""); }} className={cn("relative flex w-16 shrink-0 flex-col items-center rounded-2xl py-3 ring-1 transition disabled:opacity-30", day === i ? "text-bg ring-ink" : "ring-line hover:ring-ink/30")}>
                          {day === i && <motion.span layoutId="day" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                          <span className="relative text-[11px] uppercase opacity-70">{i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                          <span className="display relative text-3xl">{d.getDate()}</span>
                          <span className="relative text-[11px] opacity-70">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                        </button>
                      );
                    })}
                  </div>
                  <h2 className="mt-8 text-lg font-medium">Time</h2>
                  {slots.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No more slots on this day — try another date.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {slots.map((t) => (
                        <button key={t} disabled={busy(t)} onClick={() => setTime(t)} className={cn("rounded-xl py-2.5 text-sm ring-1 transition disabled:line-through disabled:opacity-30", time === t ? "bg-accent text-white ring-accent" : "ring-line hover:ring-ink/30")}>
                          {to12h(t)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-lg font-medium">Where would you like to sit?</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {AREAS.map((a) => {
                      const disabled = a.id === "private" && guests < 6;
                      return (
                        <button key={a.id} disabled={disabled} onClick={() => setArea(a.id)} className={cn("group relative h-40 overflow-hidden rounded-2xl text-left text-white ring-2 transition disabled:opacity-40", area === a.id ? "ring-accent" : "ring-transparent")}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/0" />
                          <span className="absolute bottom-4 left-4">
                            <span className="display block text-3xl">{a.label}</span>
                            <span className="text-xs text-white/80">{disabled ? "Available for 6+ guests" : a.desc}</span>
                          </span>
                          {area === a.id && <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium">Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                  <h2 className="mt-8 text-lg font-medium">Occasion</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => (
                      <button key={o} onClick={() => setForm({ ...form, occasion: o })} className={cn("rounded-full px-4 py-2 text-sm ring-1 transition", form.occasion === o ? "bg-ink text-bg ring-ink" : "ring-line")}>{o}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-medium">Your details</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="field" placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <input className="field sm:col-span-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <textarea className="field min-h-24 sm:col-span-2" placeholder="Anything we should know? Allergies, high chair, surprise cake…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div className="mt-6 rounded-2xl bg-soft p-4 text-sm">
                    <p className="font-medium">{guests} guests · {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {time && to12h(time)}</p>
                    <p className="text-muted">{AREAS.find((a) => a.id === area)?.label}{form.occasion !== "None" ? ` · ${form.occasion}` : ""}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            <button onClick={() => go(step - 1)} className={cn("flex items-center gap-2 text-sm font-medium", step === 0 && "invisible")}>
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              disabled={!valid[step]}
              onClick={() => (step < 2 ? go(step + 1) : submit())}
              className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bg transition hover:bg-accent disabled:opacity-40"
            >
              {step < 2 ? "Continue" : "Request booking"} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
