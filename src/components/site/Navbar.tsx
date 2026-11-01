"use client";

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Check, Clock, MapPin, Phone, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { img, IMG } from "@/lib/seed";
import { cn, openStatus } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { lockScroll } from "./SmoothScroll";

const spring = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;

const PREVIEWS: Record<string, string> = {
  "/menu": img(IMG.flatWhite, 700),
  "/shop": img(IMG.coffeeBag, 700),
  "/reserve": img(IMG.interiorPlants, 700),
  "/events": img(IMG.cupsCircle, 700),
  "/journal": img(IMG.pourOver, 700),
  "/about": img(IMG.counter, 700),
  "/contact": img(IMG.streetCafe, 700),
  "/account": img(IMG.cheers, 700),
};

export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("display flex items-baseline text-[1.65rem] italic leading-none tracking-tight", className)}>
      {name}
      <span className="ml-0.5 inline-block size-1.5 rounded-full bg-accent" />
    </span>
  );
}

/**
 * The "Island" — a floating, morphing navigation capsule.
 * It compacts on scroll, expands into a full menu, and briefly
 * becomes a live notification whenever something is added to the bag.
 */
export function Navbar() {
  const pathname = usePathname();
  const nav = useDB((s) => s.settings.nav);
  const site = useDB((s) => s.settings.site);
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const lastAdded = useCart((s) => s.lastAdded);
  const setOpen = useCart((s) => s.setOpen);

  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [notify, setNotify] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setCompact(false);
    else if (y > prev + 4) setCompact(true);
    else if (y < prev - 8) setCompact(false);
  });

  useEffect(() => setStatus(openStatus(site.hours)), [site.hours]);
  useEffect(() => setExpanded(false), [pathname]);
  useEffect(() => {
    lockScroll(expanded);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => {
    if (!lastAdded || Date.now() - lastAdded.at > 1500) return;
    setNotify(true);
    const t = setTimeout(() => setNotify(false), 2600);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const mode: "expanded" | "notify" | "compact" | "full" = expanded ? "expanded" : notify ? "notify" : compact ? "compact" : "full";
  const preview = useMemo(() => PREVIEWS[hovered ?? ""] ?? img(IMG.interiorBar, 700), [hovered]);

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <LayoutGroup>
          <motion.nav
            layout
            transition={spring}
            style={{ borderRadius: mode === "expanded" ? 32 : 999 }}
            className={cn(
              "glass-dark pointer-events-auto relative overflow-hidden text-bg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] ring-1 ring-white/10",
              mode === "expanded" ? "w-full max-w-[920px]" : "w-auto",
            )}
            aria-label="Main"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "expanded" ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.12, duration: 0.35 } }}
                  exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.15 } }}
                  className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between pl-3">
                    <Link href="/" onClick={() => setExpanded(false)}>
                      <Logo name={site.shortName} />
                    </Link>
                    <button
                      onClick={() => setExpanded(false)}
                      className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                      aria-label="Close menu"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.25fr_1fr]">
                    <ul className="px-2 sm:px-3" onMouseLeave={() => setHovered(null)}>
                      {[{ id: "home", label: "Home", href: "/" }, ...nav.links, { id: "acc", label: "Account", href: "/account" }].map((l, i) => (
                        <motion.li
                          key={l.id}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                          className="border-b border-white/10 last:border-0"
                        >
                          <Link
                            href={l.href}
                            onMouseEnter={() => setHovered(l.href)}
                            onClick={() => setExpanded(false)}
                            className="group flex items-baseline gap-4 py-2.5 sm:py-3"
                          >
                            <span className="eyebrow w-6 text-white/40">{String(i + 1).padStart(2, "0")}</span>
                            <span
                              className={cn(
                                "display text-[2.4rem] leading-none transition-all duration-500 sm:text-5xl",
                                pathname === l.href ? "italic text-accent" : "group-hover:translate-x-2 group-hover:italic",
                              )}
                            >
                              {l.label}
                            </span>
                            <ArrowUpRight className="ml-auto size-5 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="hidden flex-col gap-3 md:flex">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                        <AnimatePresence mode="popLayout">
                          <motion.img
                            key={preview}
                            src={preview}
                            alt=""
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </AnimatePresence>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                          <p className="eyebrow text-white/70">Today</p>
                          <p className="display mt-1 text-2xl">{site.tagline}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-3xl bg-white/5 p-4 text-sm text-white/75 sm:grid-cols-3">
                    <span className="flex items-center gap-2">
                      <Clock className="size-4 text-accent" /> {status?.label ?? "—"}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4 text-accent" /> {site.address}
                    </span>
                    <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:text-white">
                      <Phone className="size-4 text-accent" /> {site.phone}
                    </a>
                  </div>
                </motion.div>
              ) : mode === "notify" && lastAdded ? (
                <motion.div
                  key="notify"
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { delay: 0.08 } }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)", transition: { duration: 0.12 } }}
                  className="flex items-center gap-3 py-2 pl-2 pr-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lastAdded.image} alt="" className="size-10 rounded-full object-cover" />
                  <div className="min-w-0 pr-2">
                    <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                      <span className="grid size-3.5 place-items-center rounded-full bg-emerald-500">
                        <Check className="size-2.5" strokeWidth={4} />
                      </span>
                      Added to bag
                    </p>
                    <p className="max-w-[46vw] truncate text-sm font-medium sm:max-w-[16rem]">
                      {lastAdded.qty > 1 ? `${lastAdded.qty} × ` : ""}
                      {lastAdded.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNotify(false);
                      setOpen(true);
                    }}
                    className="rounded-full bg-bg px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
                  >
                    View bag
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="bar"
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.06 } }}
                  exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.1 } }}
                  className="flex h-14 items-center gap-1 pl-5 pr-1.5"
                >
                  <motion.div layout="position">
                    <Link href="/" aria-label="Home">
                      <Logo name={site.shortName} />
                    </Link>
                  </motion.div>

                  {mode === "full" && (
                    <ul className="ml-4 hidden items-center lg:flex" onMouseLeave={() => setHovered(null)}>
                      {nav.links.slice(0, 6).map((l) => (
                        <li key={l.id} className="relative">
                          <Link
                            href={l.href}
                            onMouseEnter={() => setHovered(l.href)}
                            className={cn(
                              "relative z-10 block px-3.5 py-2 text-[13px] font-medium transition-colors",
                              pathname.startsWith(l.href) ? "text-bg" : "text-white/65 hover:text-white",
                            )}
                          >
                            {l.label}
                          </Link>
                          {(hovered === l.href || (!hovered && pathname.startsWith(l.href))) && (
                            <motion.span
                              layoutId="nav-hover"
                              className="absolute inset-0 rounded-full bg-white/12"
                              transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {(mode === "compact" || mode === "full") && status && (
                    <span
                      className={cn(
                        "ml-3 items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-white/75",
                        mode === "compact" ? "hidden sm:flex" : "hidden sm:flex lg:hidden",
                      )}
                    >
                      <span className="relative flex size-1.5">
                        {status.open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />}
                        <span className={cn("relative size-1.5 rounded-full", status.open ? "bg-emerald-400" : "bg-white/40")} />
                      </span>
                      {status.label}
                    </span>
                  )}

                  <div className="ml-3 flex items-center gap-1">
                    <button
                      onClick={() => setOpen(true)}
                      className="relative grid size-11 place-items-center rounded-full transition hover:bg-white/10"
                      aria-label={`Open bag, ${count} items`}
                    >
                      <ShoppingBag className="size-[18px]" />
                      <AnimatePresence>
                        {count > 0 && (
                          <motion.span
                            key={count}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-[18px] text-white"
                          >
                            {count}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                    {mode === "full" && (
                      <Link
                        href={nav.ctaHref}
                        className="hidden rounded-full bg-bg px-4 py-2.5 text-[13px] font-medium text-ink transition hover:bg-white lg:block"
                      >
                        {nav.ctaLabel}
                      </Link>
                    )}
                    <button
                      onClick={() => setExpanded(true)}
                      className={cn(
                        "group grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20",
                        mode === "full" && "lg:hidden",
                      )}
                      aria-label="Open menu"
                    >
                      <span className="flex w-4 flex-col gap-[5px]">
                        <span className="h-[1.5px] w-full rounded bg-current transition-all group-hover:w-3/4" />
                        <span className="h-[1.5px] w-3/4 rounded bg-current transition-all group-hover:w-full" />
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </LayoutGroup>
      </header>
    </>
  );
}
