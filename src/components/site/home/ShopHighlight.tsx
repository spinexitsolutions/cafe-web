"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useDB } from "@/store/db";
import { ParallaxImg } from "../../motion/Parallax";
import { Reveal } from "../../motion/Reveal";
import { ProductCard } from "../ProductCard";

export function ShopHighlight() {
  const products = useDB((s) => s.products);
  const list = products.filter((p) => p.active && p.type === "shop" && p.featured).slice(0, 4);
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative overflow-hidden rounded-card">
            <ParallaxImg src={list[0]?.gallery[0] ?? list[0]?.image ?? ""} alt="Freshly roasted coffee beans" className="aspect-[4/5] sm:aspect-[16/11]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <p className="eyebrow text-white/70">The roastery shop</p>
              <h2 className="display mt-3 text-5xl sm:text-7xl">
                Take the café <em>home.</em>
              </h2>
              <Link href="/shop" className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-1.5 text-sm font-medium text-ink">
                Shop beans & gear
                <span className="grid size-9 place-items-center rounded-full bg-accent text-white transition group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-card bg-accent-soft p-7 sm:p-10">
            <Reveal>
              <p className="display text-4xl leading-tight sm:text-5xl">Roasted twice a week. Shipped within 48 hours of roasting.</p>
            </Reveal>
            <ul className="space-y-3 text-sm">
              {["Free shipping above ₹799", "Brewing notes on every bag", "Subscribe & save 15%"].map((t) => (
                <li key={t} className="flex items-center gap-3 border-t border-ink/10 pt-3">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
