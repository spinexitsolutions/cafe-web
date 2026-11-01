"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDB } from "@/store/db";
import { lockScroll } from "./SmoothScroll";

export const INTRO_KEY = "aura-intro-seen";
const ease = [0.76, 0, 0.24, 1] as const;

export function Intro() {
  const hydrated = useDB((s) => s.hydrated);
  const intro = useDB((s) => s.settings.intro);
  const name = useDB((s) => s.settings.site.shortName);
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0);

  // decide whether to play once settings are hydrated
  useEffect(() => {
    if (!hydrated || phase !== "pending") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    if (!intro.enabled || (intro.oncePerSession && seen)) setPhase("done");
    else setPhase("playing");
  }, [hydrated, intro, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    lockScroll(true);
    const total = Math.max(1, intro.duration) * 1000;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      // ease-out counter
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      setWord(Math.min(intro.words.length - 1, Math.floor(p * intro.words.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          try {
            sessionStorage.setItem(INTRO_KEY, "1");
          } catch {}
          setPhase("done");
          lockScroll(false);
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, intro.duration, intro.words.length]);

  const words = intro.words.length ? intro.words : [name];

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col bg-ink text-bg"
          exit={
            intro.style === "minimal"
              ? { opacity: 0, transition: { duration: 0.7 } }
              : { clipPath: "inset(0 0 100% 0)", transition: { duration: 1.1, ease } }
          }
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          {phase === "playing" && intro.style !== "minimal" && (
            <>
              <div className="flex items-center justify-between px-5 pt-6 sm:px-10">
                <span className="eyebrow opacity-60">{name} · coffee atelier</span>
                <span className="eyebrow opacity-60">est. 2019</span>
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden px-5">
                <AnimatePresence mode="popLayout">
                  <motion.h1
                    key={word}
                    initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
                    animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="display text-center text-[22vw] italic leading-none sm:text-[13vw]"
                  >
                    {words[word]}
                  </motion.h1>
                </AnimatePresence>
              </div>
              <div className="px-5 pb-8 sm:px-10">
                <div className="flex items-end justify-between">
                  <span className="eyebrow max-w-[14rem] opacity-60">
                    {intro.style === "counter" ? "Brewing your experience" : "Slow coffee for fast cities"}
                  </span>
                  <span className="display text-6xl tabular-nums sm:text-8xl">
                    {count}
                    <span className="text-accent">%</span>
                  </span>
                </div>
                <div className="mt-5 h-px w-full bg-bg/15">
                  <div className="h-px bg-accent transition-[width] duration-100" style={{ width: `${count}%` }} />
                </div>
              </div>
            </>
          )}
          {phase === "playing" && intro.style === "minimal" && (
            <div className="flex flex-1 items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="display text-7xl italic sm:text-9xl">{name}</div>
                <div className="mx-auto mt-6 h-px w-40 overflow-hidden bg-bg/15">
                  <div className="h-px bg-accent" style={{ width: `${count}%` }} />
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
