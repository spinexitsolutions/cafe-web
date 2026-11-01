"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDB } from "@/store/db";

/** A floating, dismissible announcement capsule (CMS-controlled). */
export function AnnouncementBar() {
  const a = useDB((s) => s.settings.announcement);
  const hydrated = useDB((s) => s.hydrated);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("aura-announce") === a.text;
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 4200);
    return () => clearTimeout(t);
  }, [hydrated, a.text]);

  const close = () => {
    setShow(false);
    try {
      sessionStorage.setItem("aura-announce", a.text);
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && a.enabled && a.text && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3 right-3 z-30 sm:right-auto sm:max-w-md lg:bottom-5 lg:left-[96px]"
        >
          <div className="flex items-center gap-3 rounded-[22px] bg-surface p-2 pr-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] ring-1 ring-line">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Sparkles className="size-[18px]" />
            </span>
            <Link href={a.href || "#"} onClick={close} className="group min-w-0 flex-1 text-[13px] leading-snug">
              {a.text}
              <ArrowRight className="ml-1 inline size-3.5 text-accent transition group-hover:translate-x-1" />
            </Link>
            <button onClick={close} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-soft" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
