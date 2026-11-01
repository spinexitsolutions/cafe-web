"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Img } from "./Img";
import { cn } from "@/lib/utils";

/** Image that drifts within its frame while scrolling. */
export function ParallaxImg({ src, alt, className, amount = 12, eager }: { src: string; alt: string; className?: string; amount?: number; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[15%]">
        <Img src={src} alt={alt} eager={eager} className="h-full w-full object-cover" />
      </motion.div>
    </div>
  );
}
