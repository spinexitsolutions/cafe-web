"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { to12h } from "@/lib/utils";
import { useDB } from "@/store/db";
import { RollText, Rule } from "../motion/Kit";
import { Newsletter } from "./Newsletter";

export function Footer() {
  const site = useDB((s) => s.settings.site);
  const nav = useDB((s) => s.settings.nav);
  const note = useDB((s) => s.settings.footer.note);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0.4, 1], ["60%", "0%"]);
  const ctaX = useTransform(scrollYProgress, [0, 0.6], ["-8%", "0%"]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink text-bg">
      {/* Big call to action */}
      <Link href="/menu" className="group block px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <p className="text-[13px] font-semibold text-bg/50">
          <span className="text-accent">(→)</span> Hungry already?
        </p>
        <motion.p style={{ x: ctaX }} className="display mt-4 flex flex-wrap items-center gap-x-6 text-[clamp(2.6rem,10vw,9rem)] uppercase leading-[0.9]">
          <span className="transition-colors duration-500 group-hover:text-accent">
            <RollText>Order</RollText>
          </span>
          <span className="transition-colors duration-500 group-hover:text-accent">
            <RollText>ahead</RollText>
          </span>
          <span className="grid size-[0.9em] place-items-center rounded-full bg-accent text-white transition-transform duration-700 group-hover:rotate-45">
            <ArrowUpRight className="size-1/2" strokeWidth={2.5} />
          </span>
        </motion.p>
      </Link>

      <div className="px-5 sm:px-8 lg:px-12">
        <Rule dark />
        <div className="grid grid-cols-2 lg:grid-cols-12">
          <div className="col-span-2 border-bg/15 py-8 lg:col-span-4 lg:border-r lg:pr-10">
            <p className="text-[12px] font-semibold text-bg/50">Newsletter</p>
            <p className="mt-3 max-w-sm text-xl font-semibold leading-snug">New roasts, events and small joys — once a month.</p>
            <div className="mt-5 max-w-md">
              <Newsletter dark />
            </div>
          </div>
          <div className="border-bg/15 py-8 pr-4 lg:col-span-3 lg:border-r lg:px-8">
            <p className="text-[12px] font-semibold text-bg/50">Visit</p>
            <p className="mt-3 leading-relaxed text-bg/80">
              {site.address}
              <br />
              {site.city}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent"
            >
              <RollText>Directions</RollText> <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <div className="border-bg/15 py-8 lg:col-span-3 lg:border-r lg:px-8">
            <p className="text-[12px] font-semibold text-bg/50">Hours</p>
            <ul className="mt-3 space-y-1 text-sm text-bg/80">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3">
                  <span>{h.day.slice(0, 3)}</span>
                  <span className="tabular-nums">{h.closed ? "Closed" : `${to12h(h.open)}–${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 py-8 lg:col-span-2 lg:pl-8">
            <p className="text-[12px] font-semibold text-bg/50">Index</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm lg:grid-cols-1">
              {[...nav.links, { id: "acc", label: "Account", href: "/account" }].map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="group text-bg/80 hover:text-bg">
                    <RollText>{l.label}</RollText>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Rule dark />
        <div className="flex flex-col gap-3 py-5 text-[12px] text-bg/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} — {note}
          </p>
          <div className="flex flex-wrap gap-5">
            <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="hover:text-bg">Instagram</a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-bg">WhatsApp</a>
            <a href={`mailto:${site.email}`} className="hover:text-bg">{site.email}</a>
            <Link href="/admin" className="hover:text-bg">Admin</Link>
          </div>
        </div>
      </div>

      {/* Wordmark rising out of the floor */}
      <div aria-hidden className="pointer-events-none overflow-hidden">
        <motion.p style={{ y: wordY }} className="display select-none whitespace-nowrap text-center text-[27vw] uppercase leading-[0.74] text-accent lg:text-[24vw]">
          {site.shortName}
        </motion.p>
      </div>
    </footer>
  );
}
