"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { RollText, SectionHead } from "@/components/motion/Kit";
import { PageHero } from "@/components/site/PageHero";
import { cn, openStatus, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

const SUBJECTS = ["General enquiry", "Catering", "Private event", "Wholesale", "Careers"];
const wrap = "px-5 sm:px-8 lg:px-12";

export default function ContactPage() {
  const site = useDB((s) => s.settings.site);
  const faqs = useDB((s) => s.faqs);
  const sendMessage = useDB((s) => s.sendMessage);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [today, setToday] = useState("");
  useEffect(() => {
    setStatus(openStatus(site.hours));
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  }, [site.hours]);

  const channels: [string, string, string][] = [
    ["Visit", `${site.address}, ${site.city}`, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`],
    ["Call", site.phone, `tel:${site.phone}`],
    ["Email", site.email, `mailto:${site.email}`],
    ["WhatsApp", "Message us", `https://wa.me/${site.whatsapp}`],
    ["Instagram", `@${site.instagram}`, `https://instagram.com/${site.instagram}`],
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title="Say" italic="hello." intro="Catering, collaborations, wholesale or just a question about beans — we read everything and reply within a day." />

      <div className={`${wrap} grid gap-16 pb-8 lg:grid-cols-12 lg:gap-12`}>
        {/* Form */}
        <section className="lg:col-span-7">
          <SectionHead n={1} label="Write to us" title="" />
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-16">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="grid size-14 place-items-center rounded-full bg-accent text-white">
                  <Check className="size-7" />
                </motion.span>
                <p className="display mt-6 text-5xl uppercase">Message sent.</p>
                <p className="mt-3 text-muted">
                  Thanks, {form.name.split(" ")[0]}. We’ll reply to {form.email} within a day.
                </p>
                <button onClick={() => { setSent(false); setForm({ ...form, message: "" }); }} className="group mt-6 border-b border-ink/25 pb-1 text-sm font-semibold">
                  <RollText>Send another</RollText>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message) return;
                  sendMessage({ ...form, phone: form.phone || undefined });
                  setSent(true);
                }}
                className="pt-6"
              >
                <p className="text-[12px] font-semibold text-muted">What’s it about?</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {SUBJECTS.map((s) => (
                    <button type="button" key={s} onClick={() => setForm({ ...form, subject: s })} className={cn("relative pb-1.5 text-[15px] font-semibold transition-colors", form.subject === s ? "text-ink" : "text-muted hover:text-ink")}>
                      {s}
                      {form.subject === s && <motion.span layoutId="subject" className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />}
                    </button>
                  ))}
                </div>
                <div className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                  <input required className="field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className="field" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <input required type="email" className="field sm:col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <textarea required rows={4} className="field sm:col-span-2" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button className="group mt-8 flex h-12 items-center gap-3 rounded-full bg-ink pl-6 pr-1.5 text-sm font-semibold text-bg transition hover:bg-accent">
                  <RollText>Send message</RollText>
                  <span className="grid size-9 place-items-center rounded-full bg-bg/15 transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        {/* Channels + hours */}
        <aside className="lg:col-span-5">
          <SectionHead n={2} label="Find us" title="" />
          <ul className="pt-2">
            {channels.map(([k, v, href]) => (
              <li key={k} className="border-b border-ink/10">
                <a href={href} target="_blank" rel="noreferrer" className="group grid grid-cols-[6rem_1fr_auto] items-center gap-3 py-4">
                  <span className="text-[12px] font-semibold text-muted">{k}</span>
                  <span className="truncate font-semibold transition-colors group-hover:text-accent">{v}</span>
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 bg-ink p-6 text-bg">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("size-2 rounded-full", status?.open ? "bg-emerald-400" : "bg-bg/30")} />
              {status?.label}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {site.hours.map((h) => (
                <li key={h.day} className={cn("flex items-baseline gap-2", h.day === today ? "text-bg" : "text-bg/55")}>
                  <span className={cn(h.day === today && "font-semibold")}>{h.day}</span>
                  <span className="h-0 flex-1 translate-y-[-0.2em] border-b border-dotted border-bg/20" />
                  <span className="tabular-nums">{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-ink/10">
            <iframe title="Map" src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`} className="h-60 w-full grayscale" loading="lazy" />
          </div>
        </aside>
      </div>

      {/* FAQ */}
      <section className={`${wrap} py-24`}>
        <SectionHead n={3} label="FAQ" title="Good" accent="questions." />
        <div className="mt-8">
          {faqs.map((f, i) => (
            <div key={f.id} className="border-b border-ink/10 first:border-t">
              <button onClick={() => setOpen(open === f.id ? null : f.id)} className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5 text-left md:grid-cols-12">
                <span className="text-[12px] font-bold tabular-nums text-muted md:col-span-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg font-semibold transition-colors group-hover:text-accent md:col-span-8 md:text-xl">{f.q}</span>
                <span className={cn("grid size-9 place-items-center rounded-full ring-1 ring-ink/15 transition duration-500 md:col-span-1 md:justify-self-end", open === f.id && "rotate-45 bg-accent text-white ring-accent")}>
                  <Plus className="size-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === f.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="grid pb-6 md:grid-cols-12">
                      <p className="max-w-2xl text-muted md:col-span-8 md:col-start-4">{f.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
