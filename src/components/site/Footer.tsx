"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { to12h } from "@/lib/utils";
import { useDB } from "@/store/db";
import { Newsletter } from "./Newsletter";

export function Footer() {
  const site = useDB((s) => s.settings.site);
  const nav = useDB((s) => s.settings.nav);
  const note = useDB((s) => s.settings.footer.note);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["35%", "0%"]);
  const weekday = site.hours.slice(0, 5);
  const allSame = weekday.every((h) => h.open === weekday[0].open && h.close === weekday[0].close);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink text-bg">
      <div className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="eyebrow text-bg/50">The Aura letter</p>
            <h3 className="display mt-4 max-w-sm text-4xl sm:text-5xl">
              New roasts, events & <em className="text-accent">small joys</em>, monthly.
            </h3>
            <div className="mt-6 max-w-md">
              <Newsletter dark />
            </div>
          </div>
          <div>
            <p className="eyebrow text-bg/50">Visit</p>
            <p className="mt-4 leading-relaxed text-bg/80">
              {site.address}
              <br />
              {site.city}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-accent"
            >
              Get directions <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <div>
            <p className="eyebrow text-bg/50">Hours</p>
            <ul className="mt-4 space-y-1.5 text-sm text-bg/80">
              {allSame ? (
                <li className="flex justify-between gap-4">
                  <span>Mon – Fri</span>
                  <span>
                    {to12h(weekday[0].open)} – {to12h(weekday[0].close)}
                  </span>
                </li>
              ) : (
                weekday.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day.slice(0, 3)}</span>
                    <span>{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                  </li>
                ))
              )}
              {site.hours.slice(5).map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day.slice(0, 3)}</span>
                  <span>{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-bg/50">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-bg/80 lg:grid-cols-1">
              {nav.links.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="transition hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="transition hover:text-accent">
                  My account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bg/10 py-6 text-xs text-bg/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {note}
          </p>
          <div className="flex flex-wrap gap-5">
            <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="hover:text-bg">
              Instagram
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-bg">
              WhatsApp
            </a>
            <a href={`mailto:${site.email}`} className="hover:text-bg">
              {site.email}
            </a>
            <Link href="/admin" className="hover:text-bg">
              Admin
            </Link>
          </div>
        </div>
      </div>
      <motion.div style={{ y }} aria-hidden className="pointer-events-none select-none px-3 pb-2">
        <p className="display text-center text-[34vw] leading-[0.78] text-bg/[0.07]">{site.shortName}</p>
      </motion.div>
    </footer>
  );
}
