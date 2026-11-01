"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Lines, RollText, Rule } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { IMG, img } from "@/lib/seed";
import type { Reservation } from "@/lib/types";
import { cn, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

const AREAS: { id: Reservation["area"]; label: string; desc: string; image: string }[] = [
  { id: "indoor", label: "Main room", desc: "Bright, buzzy, by the bar", image: img(IMG.interiorWood, 700) },
  { id: "garden", label: "Garden", desc: "Under the neem tree", image: img(IMG.interiorWindow, 700) },
  { id: "bar", label: "Slow bar", desc: "Watch the baristas work", image: img(IMG.counter, 700) },
  { id: "private", label: "Private corner", desc: "For 6–12 guests", image: img(IMG.interiorDark, 700) },
];
const OCCASIONS = ["None", "Birthday", "Anniversary", "Business", "Date", "Celebration"];
const STEPS = ["When", "Where", "Who"];
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
  const valid = [time !== "" && guests > 0, true, !!form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && form.phone.trim().length >= 8];

  const submit = () => {
    setDone(
      addReservation({
        name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(),
        date: iso(date), time, guests, area,
        occasion: form.occasion === "None" ? undefined : form.occasion, notes: form.notes || undefined,
      }),
    );
  };

  if (done) {
    return (
      <div className="px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pt-24">
        <Rule />
        <div className="grid gap-6 pt-5 md:grid-cols-12">
          <p className="text-[13px] font-semibold md:col-span-3">
            <span className="text-accent">(✓)</span> <span className="text-muted">Request received</span>
          </p>
          <div className="md:col-span-9">
            <h1 className="display text-[clamp(2.8rem,10vw,8rem)] uppercase">
              <Lines text="See you" onMount /> <em><Lines text="soon." onMount delay={0.1} /></em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              <b className="text-ink">{done.guests} guests</b> · <b className="text-ink">{date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</b> · <b className="text-ink">{to12h(done.time)}</b>. We’ll confirm by SMS and email to {done.email} shortly.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/menu" className="group flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-bg"><RollText>Peek at the menu</RollText></Link>
              <Link href="/" className="group flex h-12 items-center rounded-full px-6 text-sm font-semibold ring-1 ring-ink/20"><RollText>Home</RollText></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const areaObj = AREAS.find((a) => a.id === area)!;
  const summary: [string, string][] = [
    ["Guests", String(guests)],
    ["Date", date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })],
    ["Time", time ? to12h(time) : "—"],
    ["Seating", areaObj.label],
    ["Occasion", form.occasion],
  ];

  return (
    <>
      <PageHero eyebrow="Reservations" title="Save me" italic="a seat." intro="Book up to three weeks ahead for parties of 1–12. Walk-ins always welcome, too." />
      <div className="grid gap-12 px-5 pb-24 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-8">
          {/* step index */}
          <div className="grid grid-cols-3 border-b border-ink/10">
            {STEPS.map((l, i) => (
              <button key={l} onClick={() => i < step && go(i)} className={cn("relative pb-3 text-left text-[15px] font-semibold transition-colors", i <= step ? "text-ink" : "text-muted")}>
                <span className="mr-2 text-[12px] tabular-nums text-accent">({String(i + 1).padStart(2, "0")})</span>
                {l}
                {i === step && <motion.span layoutId="rs-step" className="absolute inset-x-0 -bottom-px h-[3px] bg-accent" />}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden pt-8">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -50 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-ink/10 pb-6">
                      <p className="display display-n text-2xl uppercase">Guests</p>
                      <div className="flex items-center gap-5">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid size-11 place-items-center rounded-full ring-1 ring-ink/20 transition hover:bg-ink hover:text-bg" aria-label="Fewer"><Minus className="size-4" /></button>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span key={guests} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="display w-12 text-center text-5xl tabular-nums">{guests}</motion.span>
                        </AnimatePresence>
                        <button onClick={() => setGuests(Math.min(12, guests + 1))} className="grid size-11 place-items-center rounded-full ring-1 ring-ink/20 transition hover:bg-ink hover:text-bg" aria-label="More"><Plus className="size-4" /></button>
                      </div>
                    </div>
                    <div>
                      <p className="display display-n text-2xl uppercase">Date</p>
                      <div className="-mx-5 mt-4 flex gap-px overflow-x-auto bg-ink/10 px-5 no-scrollbar sm:mx-0 sm:px-0">
                        {days.map((d, i) => {
                          const closed = site.hours.find((h) => h.day === d.toLocaleDateString("en-US", { weekday: "long" }))?.closed;
                          return (
                            <button key={i} disabled={closed} onClick={() => { setDay(i); setTime(""); }} className={cn("relative flex w-[4.5rem] shrink-0 flex-col items-start bg-bg px-3 py-3 transition-colors disabled:opacity-30", day === i ? "text-bg" : "hover:bg-surface")}>
                              {day === i && <motion.span layoutId="rs-day" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                              <span className="relative text-[11px] font-semibold uppercase opacity-70">{i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                              <span className="display relative mt-1 text-3xl">{d.getDate()}</span>
                              <span className="relative text-[11px] opacity-70">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="display display-n text-2xl uppercase">Time</p>
                      {slots.length === 0 ? (
                        <p className="mt-3 text-sm text-muted">No more slots on this day — try another date.</p>
                      ) : (
                        <div className="mt-4 grid grid-cols-4 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-6">
                          {slots.map((t) => (
                            <button key={t} disabled={busy(t)} onClick={() => setTime(t)} className={cn("relative bg-bg py-3 text-sm font-semibold transition-colors disabled:text-ink/25 disabled:line-through", time === t ? "text-white" : "hover:bg-surface")}>
                              {time === t && <motion.span layoutId="rs-time" className="absolute inset-0 bg-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                              <span className="relative">{to12h(t)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-10">
                    <div className="grid gap-px bg-ink/10 sm:grid-cols-2">
                      {AREAS.map((a, i) => {
                        const disabled = a.id === "private" && guests < 6;
                        const active = area === a.id;
                        return (
                          <button key={a.id} disabled={disabled} onClick={() => setArea(a.id)} className="group bg-bg p-3 text-left disabled:opacity-40">
                            <div className="flex items-center justify-between pb-2 text-[11px] font-bold">
                              <span className="tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                              {active && <span className="flex items-center gap-1 text-accent"><Check className="size-3.5" /> Selected</span>}
                            </div>
                            <div className={cn("relative aspect-[16/10] overflow-hidden rounded-[var(--radius)] ring-2 transition", active ? "ring-accent" : "ring-transparent")}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={a.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                            </div>
                            <p className="display display-n mt-3 text-xl uppercase">{a.label}</p>
                            <p className="text-sm text-muted">{disabled ? "Available for 6+ guests" : a.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <p className="display display-n text-2xl uppercase">Occasion</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {OCCASIONS.map((o) => (
                          <button key={o} onClick={() => setForm({ ...form, occasion: o })} className={cn("relative pb-1.5 text-[15px] font-semibold transition-colors", form.occasion === o ? "text-ink" : "text-muted hover:text-ink")}>
                            {o}
                            {form.occasion === o && <motion.span layoutId="rs-occ" className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                    <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="field" placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <input className="field sm:col-span-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <textarea rows={3} className="field sm:col-span-2" placeholder="Anything we should know? Allergies, high chair, surprise cake…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Booking ticket */}
        <aside className="lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
          <div className="relative bg-ink p-6 text-bg">
            <div className="flex items-baseline justify-between">
              <p className="display text-2xl uppercase">{site.shortName}® table</p>
              <p className="text-[11px] font-semibold text-bg/50">Step {step + 1}/3</p>
            </div>
            <div className="my-5 border-t border-dashed border-bg/25" />
            <dl className="space-y-2.5 text-sm">
              {summary.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="text-bg/55">{k}</dt>
                  <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/20" />
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex gap-2">
              {step > 0 && (
                <button onClick={() => go(step - 1)} className="grid size-12 shrink-0 place-items-center rounded-full ring-1 ring-bg/25 transition hover:bg-bg/10" aria-label="Back">
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <button
                disabled={!valid[step]}
                onClick={() => (step < 2 ? go(step + 1) : submit())}
                className="group flex h-12 flex-1 items-center justify-between rounded-full bg-accent pl-5 pr-1.5 text-sm font-semibold text-white transition disabled:opacity-40"
              >
                <RollText>{step < 2 ? "Continue" : "Request booking"}</RollText>
                <span className="grid size-9 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
            </div>
            {!valid[step] && <p className="mt-3 text-xs text-bg/50">{step === 0 ? "Pick a time to continue." : "Add your name, email and phone."}</p>}
            <div aria-hidden className="absolute inset-x-0 -bottom-[7px] h-[14px]" style={{ background: "radial-gradient(circle at 7px 7px, var(--bg) 6px, transparent 6.5px) repeat-x", backgroundSize: "14px 14px" }} />
          </div>
        </aside>
      </div>
    </>
  );
}
