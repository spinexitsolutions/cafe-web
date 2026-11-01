"use client";

import { SplitWords } from "../motion/Reveal";
import { motion } from "framer-motion";

/** Consistent hero for inner pages. */
export function PageHero({ eyebrow, title, italic, intro, children }: { eyebrow: string; title: string; italic?: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pb-14 sm:pt-40">
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow text-accent">
        {eyebrow}
      </motion.p>
      <h1 className="display mt-4 text-[clamp(3.2rem,11vw,8.5rem)]">
        <SplitWords text={title} animateOnMount />
        {italic && (
          <>
            {" "}
            <em className="text-accent">
              <SplitWords text={italic} animateOnMount delay={0.15} />
            </em>
          </>
        )}
      </h1>
      {intro && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          {intro}
        </motion.p>
      )}
      {children}
    </section>
  );
}
