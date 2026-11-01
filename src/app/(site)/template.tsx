"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Runs on every navigation: an accent panel wipes off the screen while
 * the new page eases up underneath — a soft, app-like page transition.
 */
let navigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const [first] = useState(() => !navigated);
  useEffect(() => {
    navigated = true;
  }, []);

  return (
    <>
      {!first && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[95] origin-right bg-accent"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: first ? 0 : 0.25 }}
      >
        {children}
      </motion.div>
    </>
  );
}
