"use client";

import { motion } from "framer-motion";
import { Lines, Rule } from "../motion/Kit";

/** Inner-page header on the editorial grid: label column + wide headline. */
export function PageHero({ eyebrow, title, italic, intro, children }: { eyebrow: string; title: string; italic?: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="px-5 pb-10 pt-20 sm:px-8 sm:pb-14 lg:px-12 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        <Rule />
        <div className="grid grid-cols-12 gap-x-4 gap-y-6 pt-5">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-12 text-[13px] font-semibold md:col-span-3"
          >
            <span className="text-accent">(●)</span> <span className="text-muted">{eyebrow}</span>
          </motion.p>
          <h1 className="display col-span-12 text-[clamp(2.6rem,10vw,7.5rem)] uppercase md:col-span-9">
            <Lines text={title} onMount delay={0.1} />
            {italic && (
              <>
                {" "}
                <em>
                  <Lines text={italic} onMount delay={0.25} />
                </em>
              </>
            )}
          </h1>
          {intro && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 max-w-xl text-lg leading-relaxed text-muted md:col-span-6 md:col-start-4"
            >
              {intro}
            </motion.p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
