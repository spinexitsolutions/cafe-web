"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDB } from "@/store/db";

export function Newsletter({ dark }: { dark?: boolean }) {
  const subscribe = useDB((s) => s.subscribe);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "dupe">("idle");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return;
        setState(subscribe(email) ? "done" : "dupe");
        setEmail("");
      }}
      className={cn(
        "relative flex h-14 items-center rounded-full p-1.5 pl-5 ring-1 transition focus-within:ring-accent",
        dark ? "bg-bg/5 ring-bg/15" : "bg-surface ring-line",
      )}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setState("idle");
        }}
        placeholder="you@email.com"
        aria-label="Email address"
        className={cn("min-w-0 flex-1 bg-transparent text-sm outline-none", dark ? "placeholder:text-bg/40" : "placeholder:text-muted")}
      />
      <button type="submit" className="flex h-full items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition active:scale-95">
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.span key="d" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5">
              <Check className="size-4" /> Subscribed
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5">
              Join <ArrowRight className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {state === "dupe" && <p className="absolute -bottom-6 left-5 text-xs text-accent">You’re already on the list ✦</p>}
    </form>
  );
}
