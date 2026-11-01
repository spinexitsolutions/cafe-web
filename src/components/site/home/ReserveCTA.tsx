"use client";

import { ArrowRight, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDB } from "@/store/db";
import { ParallaxImg } from "../../motion/Parallax";
import { SplitWords } from "../../motion/Reveal";

export function ReserveCTA() {
  const story = useDB((s) => s.settings.experience[1]?.image ?? s.settings.story.image);
  const router = useRouter();
  const [guests, setGuests] = useState(2);
  const [when, setWhen] = useState("today");
  return (
    <section className="px-3 sm:px-5">
      <div className="relative overflow-hidden rounded-card text-white">
        <ParallaxImg src={story} alt="Garden seating" className="absolute inset-0" amount={10} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-end gap-10 px-5 py-14 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-3xl text-[clamp(3.2rem,10vw,8rem)] leading-[0.9]">
            <SplitWords text="Save me" /> <em className="text-accent"><SplitWords text="a seat." delay={0.1} /></em>
          </h2>
          <div className="w-full max-w-sm rounded-[28px] bg-white/12 p-5 backdrop-blur-xl ring-1 ring-white/20">
            <p className="eyebrow text-white/70">Quick booking</p>
            <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-black/20 p-1 text-sm">
              {["today", "tomorrow", "weekend"].map((w) => (
                <button key={w} onClick={() => setWhen(w)} className={`rounded-full py-2 capitalize transition ${when === w ? "bg-white text-ink" : "text-white/80"}`}>
                  {w}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
              <span className="text-sm">Guests</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid size-8 place-items-center rounded-full bg-white/15" aria-label="Fewer guests">
                  <Minus className="size-3.5" />
                </button>
                <span className="w-4 text-center tabular-nums">{guests}</span>
                <button onClick={() => setGuests(Math.min(12, guests + 1))} className="grid size-8 place-items-center rounded-full bg-white/15" aria-label="More guests">
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => router.push(`/reserve?guests=${guests}&when=${when}`)}
              className="group mt-4 flex h-14 w-full items-center justify-between rounded-full bg-white pl-6 pr-2 font-medium text-ink"
            >
              Find a table
              <span className="grid size-10 place-items-center rounded-full bg-accent text-white transition group-hover:translate-x-0.5">
                <ArrowRight className="size-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
