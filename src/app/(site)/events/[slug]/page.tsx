"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ClipImg, Lines, RollText, Rule } from "@/components/motion/Kit";
import { money, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const e = useDB((s) => s.events.find((x) => x.slug === slug));
  const hydrated = useDB((s) => s.hydrated);
  const cur = useDB((s) => s.settings.site.currency);
  const shortName = useDB((s) => s.settings.site.shortName);
  const bookEvent = useDB((s) => s.bookEvent);
  const [seats, setSeats] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState<"idle" | "done" | "full">("idle");

  if (!e) return <div className="px-5 py-48 text-center"><p className="display text-5xl uppercase">{hydrated ? "Event not found" : "Loading…"}</p></div>;
  const left = e.seats - e.booked;
  const d = new Date(e.date);
  const facts: [string, string][] = [
    ["Date", d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })],
    ["Time", to12h(e.time)],
    ["Price", e.price ? money(e.price, cur) : "Free"],
    ["Seats", left > 0 ? `${left} of ${e.seats} left` : "Sold out"],
  ];

  return (
    <div className="px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pt-24">
      <Link href="/events" className="group inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> <RollText>All events</RollText>
      </Link>
      <div className="mt-6">
        <Rule />
        <div className="grid gap-4 pt-5 md:grid-cols-12">
          <p className="text-[13px] font-semibold md:col-span-3">
            <span className="text-accent">({String(d.getDate()).padStart(2, "0")}.{String(d.getMonth() + 1).padStart(2, "0")})</span> <span className="text-muted">{e.category}</span>
          </p>
          <h1 className="display text-[clamp(2.2rem,7vw,5.8rem)] uppercase [overflow-wrap:anywhere] md:col-span-9">
            <Lines text={e.title} onMount />
          </h1>
        </div>
      </div>

      <ClipImg src={e.image.replace("w=1200", "w=2000")} alt={e.title} eager className="mt-10 aspect-[4/3] rounded-[var(--radius)] sm:aspect-[21/9]" />

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-bg py-5 pr-4">
                <p className="text-[12px] font-semibold text-muted">{k}</p>
                <p className="mt-1 text-lg font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <p className="display display-n mt-10 text-3xl leading-tight sm:text-4xl">{e.description}</p>
          <p className="mt-6 max-w-xl leading-relaxed text-muted">All materials, coffee and snacks are included. Please arrive 10 minutes early. Loyalty members get 10% off every workshop — just use the email you order with.</p>
          <div className="mt-10">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{e.booked} going</span>
              <span className="text-muted">{e.seats} seats</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden bg-ink/10">
              <motion.div className="h-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${(e.booked / e.seats) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }} />
            </div>
          </div>
        </div>

        {/* Ticket */}
        <aside className="lg:sticky lg:top-20 lg:col-span-5 lg:self-start">
          <div className="relative bg-ink p-6 text-bg sm:p-7">
            <div className="flex items-baseline justify-between">
              <p className="display text-2xl uppercase">{shortName}® ticket</p>
              <p className="text-[11px] font-semibold text-bg/50">Admit {seats}</p>
            </div>
            <div className="my-5 border-t border-dashed border-bg/25" />
            {state === "done" ? (
              <div className="py-6">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-12 place-items-center rounded-full bg-accent text-white"><Check className="size-6" /></motion.span>
                <p className="display mt-5 text-4xl uppercase">You’re in.</p>
                <p className="mt-2 text-sm text-bg/60">Tickets sent to {form.email}.</p>
              </div>
            ) : (
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email)) return;
                  setState(bookEvent({ eventId: e.id, seats, ...form }) ? "done" : "full");
                }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bg/60">Seats</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setSeats(Math.max(1, seats - 1))} className="grid size-8 place-items-center rounded-full ring-1 ring-bg/25" aria-label="Fewer"><Minus className="size-3.5" /></button>
                    <span className="display w-6 text-center text-2xl">{seats}</span>
                    <button type="button" onClick={() => setSeats(Math.min(Math.max(1, left), seats + 1))} className="grid size-8 place-items-center rounded-full ring-1 ring-bg/25" aria-label="More"><Plus className="size-3.5" /></button>
                  </div>
                </div>
                {(["name", "email", "phone"] as const).map((k) => (
                  <input
                    key={k}
                    required={k !== "phone"}
                    type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                    placeholder={k === "name" ? "Name" : k === "email" ? "Email" : "Phone (optional)"}
                    value={form[k]}
                    onChange={(x) => setForm({ ...form, [k]: x.target.value })}
                    className="w-full border-b-2 border-bg/20 bg-transparent py-2 outline-none placeholder:text-bg/35 focus:border-accent"
                  />
                ))}
                {state === "full" && <p className="text-sm text-red-300">Sorry — not enough seats left.</p>}
                <div className="flex items-end justify-between border-t border-bg/20 pt-4">
                  <span className="text-sm">Total</span>
                  <span className="display text-4xl">{e.price ? money(e.price * seats, cur) : "Free"}</span>
                </div>
                <button disabled={left <= 0} className="group flex h-13 w-full items-center justify-center rounded-full bg-accent py-4 font-semibold text-white disabled:opacity-40">
                  <RollText>{left > 0 ? "Reserve my seat" : "Sold out"}</RollText>
                </button>
              </form>
            )}
            <div aria-hidden className="absolute inset-x-0 -bottom-[7px] h-[14px]" style={{ background: "radial-gradient(circle at 7px 7px, var(--bg) 6px, transparent 6.5px) repeat-x", backgroundSize: "14px 14px" }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
