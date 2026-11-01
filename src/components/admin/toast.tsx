"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, CircleAlert } from "lucide-react";
import { create } from "zustand";

interface T {
  id: number;
  text: string;
  tone: "ok" | "error";
}
const useToasts = create<{ list: T[]; push: (text: string, tone?: T["tone"]) => void; drop: (id: number) => void }>((set) => ({
  list: [],
  push: (text, tone = "ok") => {
    const id = Date.now() + Math.random();
    set((s) => ({ list: [...s.list, { id, text, tone }] }));
    setTimeout(() => set((s) => ({ list: s.list.filter((t) => t.id !== id) })), 2600);
  },
  drop: (id) => set((s) => ({ list: s.list.filter((t) => t.id !== id) })),
}));

export const toast = (text: string, tone: T["tone"] = "ok") => useToasts.getState().push(text, tone);

export function Toaster() {
  const list = useToasts((s) => s.list);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1d1d1f]/92 py-2.5 pl-3 pr-4 text-sm text-white shadow-xl backdrop-blur"
          >
            {t.tone === "ok" ? <CircleCheck className="size-4 text-[#34c759]" /> : <CircleAlert className="size-4 text-[#ff453a]" />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
