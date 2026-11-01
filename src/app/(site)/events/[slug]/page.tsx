"use client";

import { motion } from "framer-motion";
import { Calendar, Check, Clock, Minus, Plus, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ParallaxImg } from "@/components/motion/Parallax";
import { SplitWords } from "@/components/motion/Reveal";
import { money, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const e = useDB((s) => s.events.find((x) => x.slug === slug));
  const hydrated = useDB((s) => s.hydrated);
  const cur = useDB((s) => s.settings.site.currency);
  const bookEvent = useDB((s) => s.bookEvent);
  const [seats, setSeats] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState<"idle" | "done" | "full">("idle");

  if (!e) return <div className="py-48 text-center"><p className="display text-5xl">{hydrated ? "Event not found" : "Loading…"}</p></div>;
  const left = e.seats - e.booked;
  const d = new Date(e.date);

  return (
    <>
      <section className="relative h-[85vh] overflow-hidden text-white">
        <ParallaxImg src={e.image} alt={e.title} className="absolute inset-0" eager />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-12 sm:px-8">
          <p className="eyebrow text-white/70">{e.category}</p>
          <h1 className="display mt-3 text-[clamp(3rem,10vw,8rem)]"><SplitWords text={e.title} animateOnMount /></h1>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [Calendar, d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })],
              [Clock, to12h(e.time)],
              [Ticket, e.price ? money(e.price, cur) : "Free"],
              [Users, left > 0 ? `${left} of ${e.seats} left` : "Sold out"],
            ].map(([Icon, t], i) => {
              const I = Icon as React.ElementType;
              return (
                <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <I className="size-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">{t as string}</p>
                </div>
              );
            })}
          </div>
          <p className="display mt-10 text-3xl leading-snug sm:text-4xl">{e.description}</p>
          <p className="mt-6 leading-relaxed text-muted">All materials, coffee and snacks are included. Please arrive 10 minutes early. Loyalty members get 10% off every workshop — just use the email you order with.</p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${(e.booked / e.seats) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          </div>
          <p className="mt-2 text-sm text-muted">{e.booked} people are going</p>
        </div>
        <aside className="rounded-card bg-surface p-6 ring-1 ring-line lg:sticky lg:top-28 lg:self-start">
          {state === "done" ? (
            <div className="py-8 text-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500 text-white"><Check className="size-7" /></motion.span>
              <p className="display mt-5 text-4xl">You’re in!</p>
              <p className="mt-2 text-sm text-muted">Tickets sent to {form.email}.</p>
              <Link href="/events" className="mt-6 inline-block text-sm underline underline-offset-4">More events</Link>
            </div>
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email)) return;
                setState(bookEvent({ eventId: e.id, seats, ...form }) ? "done" : "full");
              }}
              className="space-y-3"
            >
              <h2 className="display text-4xl">Book your spot</h2>
              <div className="flex items-center justify-between rounded-2xl bg-soft p-3">
                <span className="text-sm">Seats</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setSeats(Math.max(1, seats - 1))} className="grid size-8 place-items-center rounded-full bg-surface" aria-label="Fewer"><Minus className="size-3.5" /></button>
                  <span className="w-4 text-center tabular-nums">{seats}</span>
                  <button type="button" onClick={() => setSeats(Math.min(Math.max(1, left), seats + 1))} className="grid size-8 place-items-center rounded-full bg-surface" aria-label="More"><Plus className="size-3.5" /></button>
                </div>
              </div>
              <input required className="field" placeholder="Name" value={form.name} onChange={(x) => setForm({ ...form, name: x.target.value })} />
              <input required type="email" className="field" placeholder="Email" value={form.email} onChange={(x) => setForm({ ...form, email: x.target.value })} />
              <input className="field" type="tel" placeholder="Phone" value={form.phone} onChange={(x) => setForm({ ...form, phone: x.target.value })} />
              {state === "full" && <p className="text-sm text-red-600">Sorry — not enough seats left.</p>}
              <button disabled={left <= 0} className="flex h-14 w-full items-center justify-between rounded-full bg-ink px-6 font-medium text-bg transition hover:bg-accent disabled:opacity-40">
                <span>{left > 0 ? "Reserve" : "Sold out"}</span>
                <span>{e.price ? money(e.price * seats, cur) : "Free"}</span>
              </button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
