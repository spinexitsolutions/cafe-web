"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import Link from "next/link";
import { useDB } from "@/store/db";
import { Reveal } from "../../motion/Reveal";
import { Newsletter } from "../Newsletter";

export function Loyalty() {
  const loyalty = useDB((s) => s.settings.loyalty);
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-accent">Aura rewards</p>
          <h2 className="display mt-3 text-[clamp(2.8rem,7vw,5.5rem)]">
            Every tenth cup <em>is on us.</em>
          </h2>
          <p className="mt-5 max-w-md text-muted">{loyalty.rewardText} Join the list for early access to new roasts and members-only cuppings.</p>
          <div className="mt-8 max-w-md">
            <Newsletter />
          </div>
          <Link href="/account" className="mt-8 inline-block text-sm text-muted underline underline-offset-4">
            Check your points
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <motion.div
            whileHover={{ rotateX: 6, rotateY: -8 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ transformPerspective: 1000 }}
            className="relative mx-auto aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-[28px] bg-ink p-7 text-bg shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/40 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="display text-3xl italic">aura</span>
                <span className="eyebrow text-bg/60">Member</span>
              </div>
              <div>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 400, damping: 15 }}
                      className={`grid aspect-square place-items-center rounded-full ${i < 7 ? "bg-accent" : "ring-1 ring-bg/25"}`}
                    >
                      {i < 7 && <Coffee className="size-2.5 sm:size-3" />}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-bg/50">Balance</p>
                    <p className="display text-4xl">70 pts</p>
                  </div>
                  <p className="text-xs text-bg/50">3 more cups to a free drink</p>
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
