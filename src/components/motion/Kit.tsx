"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useRef } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.76, 0, 0.24, 1] as const;
const OUT = [0.22, 1, 0.36, 1] as const;

/** Text whose letters roll up to reveal a copy on hover (parent needs `group` or hover itself). */
export function RollText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("roll", className)} aria-label={children}>
      {children.split("").map((c, i) => (
        <span key={i} aria-hidden style={{ ["--i" as string]: i }}>
          {c}
        </span>
      ))}
    </span>
  );
}

/** A hairline that draws itself from left to right when scrolled into view. */
export function Rule({
  className,
  delay = 0,
  dark,
}: {
  className?: string;
  delay?: number;
  dark?: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
      className={cn(
        "h-px origin-left",
        dark ? "bg-bg/15" : "bg-ink/15",
        className,
      )}
    />
  );
}

/**
 * Editorial section header: a drawn rule, a numbered label in the left
 * column and a wide headline on the right — the grid every section sits on.
 */
/** Home sections are reorderable from the CMS, so their number comes from context. */
export const SectionNo = createContext(0);

/** Small text link with rolling letters and an arrow. */
export function MoreLink({
  href,
  children,
  dark,
}: {
  href: string;
  children: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 border-b pb-1 text-sm font-semibold",
        dark ? "border-bg/30" : "border-ink/25",
      )}
    >
      <RollText>{children}</RollText>
      <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
    </Link>
  );
}

export function SectionHead({
  n,
  label,
  title,
  accent,
  aside,
  dark,
  className,
}: {
  n?: number | string;
  label: string;
  title: string;
  accent?: string;
  aside?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const ctx = useContext(SectionNo);
  const num = n ?? ctx;
  return (
    <div className={className}>
      <Rule dark={dark} />
      <div className="grid grid-cols-12 gap-x-4 gap-y-5 pt-5 sm:pt-6">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: OUT, delay: 0.2 }}
          className="col-span-12 flex items-baseline gap-3 text-[13px] font-semibold md:col-span-3"
        >
          <span className="tabular-nums text-accent">
            ({String(num).padStart(2, "0")})
          </span>
          <span className={dark ? "text-bg/60" : "text-muted"}>{label}</span>
        </motion.p>
        {title && (
          <h2 className="display col-span-12 text-[clamp(2.3rem,8.4vw,6rem)] md:col-span-9 lg:col-span-7">
            <Lines text={title} />
            {accent && (
              <>
                {" "}
                <em>
                  <Lines text={accent} delay={0.12} />
                </em>
              </>
            )}
          </h2>
        )}
        {aside && (
          <div className="col-span-12 self-end md:col-span-9 md:col-start-4 lg:col-span-2 lg:col-start-11 lg:text-right">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}

/** Words slide up out of a mask, staggered, when scrolled into view. */
export function Lines({
  text,
  delay = 0,
  onMount,
}: {
  text: string;
  delay?: number;
  onMount?: boolean;
}) {
  const trigger = onMount
    ? { initial: "h", animate: "s" }
    : {
        initial: "h",
        whileInView: "s",
        viewport: { once: true, margin: "-8%" },
      };
  return (
    <motion.span
      {...trigger}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
      aria-label={text}
    >
      {text.split(" ").map((w, i, a) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              h: { y: "110%" },
              s: { y: "0%", transition: { duration: 1, ease: OUT } },
            }}
          >
            {w}
            {i < a.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Image that is revealed by a curtain wiping downward, then drifts with scroll. */
export function ClipImg({
  src,
  alt,
  className,
  imgClassName,
  eager,
  parallax = 8,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  parallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${parallax}%`, `${parallax}%`],
  );
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.3, ease: EASE }}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[12%]">
        <motion.img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          initial={{ scale: 1.25 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: OUT }}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </motion.div>
    </motion.div>
  );
}
