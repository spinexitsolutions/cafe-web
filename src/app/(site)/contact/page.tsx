"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Mail, MapPin, MessageCircle, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { cn, openStatus, to12h } from "@/lib/utils";
import { useDB } from "@/store/db";

export default function ContactPage() {
  const site = useDB((s) => s.settings.site);
  const faqs = useDB((s) => s.faqs);
  const sendMessage = useDB((s) => s.sendMessage);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "General enquiry", message: "" });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => {
    setStatus(openStatus(site.hours).label);
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  }, [site.hours]);

  return (
    <>
      <PageHero eyebrow="Contact" title="Say" italic="hello." intro="Catering, collaborations, wholesale or just a question about beans — we read everything and reply within a day." />
      <div className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal className="rounded-card bg-surface p-6 ring-1 ring-line sm:p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="grid size-16 place-items-center rounded-full bg-emerald-500 text-white"><Check className="size-8" /></span>
                <p className="display mt-6 text-5xl">Message sent.</p>
                <p className="mt-2 text-muted">Thanks, {form.name.split(" ")[0]}. We’ll get back to you at {form.email}.</p>
                <button onClick={() => { setSent(false); setForm({ ...form, message: "" }); }} className="mt-6 text-sm underline underline-offset-4">Send another</button>
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
                className="grid gap-3 sm:grid-cols-2"
              >
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  {["General enquiry", "Catering", "Private event", "Wholesale", "Careers"].map((s) => (
                    <button type="button" key={s} onClick={() => setForm({ ...form, subject: s })} className={cn("rounded-full px-4 py-2 text-sm ring-1 transition", form.subject === s ? "bg-ink text-bg ring-ink" : "ring-line")}>{s}</button>
                  ))}
                </div>
                <input required className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="field" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input required type="email" className="field sm:col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <textarea required className="field min-h-40 sm:col-span-2" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button className="h-14 rounded-full bg-ink font-medium text-bg transition hover:bg-accent sm:col-span-2">Send message</button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.05} className="overflow-hidden rounded-card ring-1 ring-line">
            <iframe
              title="Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
              className="h-64 w-full grayscale-[40%]"
              loading="lazy"
            />
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-3">
            {[
              [MapPin, `${site.address}, ${site.city}`, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`],
              [Phone, site.phone, `tel:${site.phone}`],
              [Mail, site.email, `mailto:${site.email}`],
              [MessageCircle, "WhatsApp us", `https://wa.me/${site.whatsapp}`],
            ].map(([Icon, t, href]) => {
              const I = Icon as React.ElementType;
              return (
                <a key={t as string} href={href as string} target="_blank" rel="noreferrer" className="rounded-2xl bg-surface p-4 text-sm ring-1 ring-line transition hover:ring-accent">
                  <I className="size-5 text-accent" />
                  <p className="mt-3 break-words">{t as string}</p>
                </a>
              );
            })}
          </Reveal>
          <Reveal delay={0.15} className="rounded-card bg-surface p-5 ring-1 ring-line">
            <p className="flex items-center gap-2 font-medium"><Clock className="size-4 text-accent" /> {status}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {site.hours.map((h) => (
                <li key={h.day} className={cn("flex justify-between", h.day === today ? "font-medium text-ink" : "text-muted")}>
                  <span>{h.day}</span>
                  <span>{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:pb-28">
        <h2 className="display text-[clamp(2.8rem,7vw,5rem)]">Good <em>questions</em></h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.id}>
              <button onClick={() => setOpen(open === f.id ? null : f.id)} className="flex w-full items-center justify-between gap-4 py-6 text-left">
                <span className="text-lg font-medium">{f.q}</span>
                <Plus className={cn("size-5 shrink-0 transition duration-500", open === f.id && "rotate-45 text-accent")} />
              </button>
              <AnimatePresence initial={false}>
                {open === f.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-muted">{f.a}</p>
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
