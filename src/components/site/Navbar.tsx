"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Coffee, House, LayoutGrid, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { img, IMG } from "@/lib/seed";
import { cn, openStatus } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useDB } from "@/store/db";
import { RollText } from "../motion/Kit";
import { lockScroll } from "./SmoothScroll";

const WIPE = [0.76, 0, 0.24, 1] as const;

const PREVIEWS: Record<string, string> = {
  "/": img(IMG.interiorBar, 900),
  "/menu": img(IMG.flatWhite, 900),
  "/shop": img(IMG.coffeeBag, 900),
  "/reserve": img(IMG.interiorPlants, 900),
  "/events": img(IMG.cupsCircle, 900),
  "/journal": img(IMG.pourOver, 900),
  "/about": img(IMG.counter, 900),
  "/contact": img(IMG.streetCafe, 900),
  "/account": img(IMG.cheers, 900),
};

function useStatus() {
  const hours = useDB((s) => s.settings.site.hours);
  const [st, setSt] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => setSt(openStatus(hours)), [hours]);
  return st;
}

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/* ---------------------------------------------------------------- Overlay */

function Overlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useDB((s) => s.settings.nav);
  const site = useDB((s) => s.settings.site);
  const pathname = usePathname();
  const status = useStatus();
  const [hover, setHover] = useState<string | null>(null);
  const links = [{ id: "home", label: "Home", href: "/" }, ...nav.links, { id: "acc", label: "Account", href: "/account" }];
  const preview = PREVIEWS[hover ?? pathname] ?? PREVIEWS["/"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[80] flex bg-ink text-bg"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          exit={{ clipPath: "inset(0 0 0 100%)" }}
          transition={{ duration: 0.9, ease: WIPE }}
        >
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-10 lg:pb-8 lg:pl-[calc(76px+3rem)]" data-lenis-prevent>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-bg/50">({String(links.length).padStart(2, "0")}) Index</span>
              <button onClick={onClose} className="group flex items-center gap-2 rounded-full bg-bg/10 py-2 pl-4 pr-2 text-sm font-semibold transition hover:bg-accent">
                <RollText>Close</RollText>
                <span className="grid size-8 place-items-center rounded-full bg-bg text-ink">
                  <X className="size-4" />
                </span>
              </button>
            </div>

            <ul className="mt-8 flex-1" onMouseLeave={() => setHover(null)}>
              {links.map((l, i) => (
                <li key={l.id} className="overflow-hidden border-b border-bg/10">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.045 }}
                  >
                    <Link
                      href={l.href}
                      onClick={onClose}
                      onMouseEnter={() => setHover(l.href)}
                      className="group flex items-center gap-4 py-2 sm:py-2.5"
                    >
                      <span className="w-8 text-[12px] font-semibold tabular-nums text-bg/40">{String(i + 1).padStart(2, "0")}</span>
                      <span
                        className={cn(
                          "display text-[clamp(2rem,7.5vw,4.6rem)] uppercase leading-none transition-colors duration-300",
                          isActive(pathname, l.href) ? "text-accent" : "group-hover:text-accent",
                        )}
                      >
                        <RollText>{l.label}</RollText>
                      </span>
                      <ArrowUpRight className="ml-auto size-6 -translate-x-3 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 grid gap-4 text-sm text-bg/70 sm:grid-cols-3"
            >
              <div>
                <p className="text-[12px] font-semibold text-bg/40">Now</p>
                <p className="mt-1 flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", status?.open ? "bg-emerald-400" : "bg-bg/30")} />
                  {status?.label}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-bg/40">Visit</p>
                <p className="mt-1">
                  {site.address}, {site.city}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-bg/40">Talk</p>
                <a href={`tel:${site.phone}`} className="mt-1 block hover:text-bg">
                  {site.phone}
                </a>
                <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="block hover:text-bg">
                  @{site.instagram}
                </a>
              </div>
            </motion.div>
          </div>

          <div className="relative hidden w-[38%] overflow-hidden lg:block">
            <AnimatePresence initial={false}>
              <motion.img
                key={preview}
                src={preview}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.2 }}
                animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                transition={{ duration: 0.9, ease: WIPE }}
              />
            </AnimatePresence>
            <p className="vtext absolute bottom-8 left-6 text-[12px] font-semibold uppercase tracking-[0.3em] text-white mix-blend-difference">
              {site.tagline}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------- Added toast */

function AddedToast() {
  const lastAdded = useCart((s) => s.lastAdded);
  const setOpen = useCart((s) => s.setOpen);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!lastAdded || Date.now() - lastAdded.at > 1500) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(t);
  }, [lastAdded]);

  return (
    <AnimatePresence>
      {show && lastAdded && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[65] flex items-center gap-3 rounded-[14px] bg-ink p-2 pr-2 text-bg shadow-2xl sm:left-auto sm:right-5 sm:w-[360px] lg:bottom-5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lastAdded.image} alt="" className="size-12 rounded-[10px] object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-accent">Added to bag</p>
            <p className="truncate text-sm font-semibold">
              {lastAdded.qty > 1 ? `${lastAdded.qty} × ` : ""}
              {lastAdded.name}
            </p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              setOpen(true);
            }}
            className="h-10 rounded-[10px] bg-accent px-4 text-sm font-semibold text-white"
          >
            View
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------- Bag count */

function BagCount({ className }: { className?: string }) {
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className={cn("grid min-w-[19px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[19px] text-white", className)}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ Nav */

export function Navbar() {
  const pathname = usePathname();
  const nav = useDB((s) => s.settings.nav);
  const site = useDB((s) => s.settings.site);
  const setBag = useCart((s) => s.setOpen);
  const status = useStatus();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const railLinks = nav.links.slice(0, 5);
  const tabs = [
    { href: "/", label: "Home", icon: House },
    { href: "/menu", label: "Menu", icon: Coffee },
    { href: "#bag", label: "Bag", icon: ShoppingBag },
    { href: "/reserve", label: "Reserve", icon: CalendarDays },
    { href: "#more", label: "More", icon: LayoutGrid },
  ];

  return (
    <>
      {/* ---------- Desktop: vertical rail ---------- */}
      <motion.aside
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: WIPE, delay: 0.2 }}
        className="fixed inset-y-0 left-0 z-[85] hidden w-[76px] flex-col items-center justify-between border-r border-ink/10 bg-bg py-5 lg:flex"
      >
        <Link href="/" aria-label="Home" className="group flex flex-col items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[12px] bg-accent text-white transition-transform duration-500 group-hover:rotate-[-8deg]">
            <span className="display text-xl leading-none">{site.shortName.charAt(0).toUpperCase()}</span>
          </span>
          <span className="vtext display text-[15px] uppercase tracking-[0.06em]">{site.shortName}®</span>
        </Link>

        <nav aria-label="Main" className="flex flex-col items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="group mb-5 grid size-11 place-items-center rounded-full ring-1 ring-ink/15 transition hover:bg-ink hover:text-bg"
            aria-label="Open menu"
          >
            <span className="flex w-4 flex-col gap-[4px]">
              <span className="h-[2px] rounded bg-current transition-all duration-500 group-hover:w-2" />
              <span className="h-[2px] rounded bg-current" />
              <span className="ml-auto h-[2px] w-2 rounded bg-current transition-all duration-500 group-hover:w-4" />
            </span>
          </button>
          {railLinks.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link key={l.id} href={l.href} className={cn("group relative px-3 py-3 text-[13px] font-semibold transition-colors", active ? "text-accent" : "text-ink/60 hover:text-ink")}>
                {active && <motion.span layoutId="rail-active" className="absolute -left-px top-2 bottom-2 w-[3px] rounded-r bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="vtext block transition-[letter-spacing] duration-500 group-hover:tracking-[0.12em]">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <span className="vtext flex items-center gap-2 text-[11px] font-semibold text-ink/50">
            <span className={cn("size-1.5 rounded-full", status?.open ? "bg-emerald-500" : "bg-ink/30")} />
            {status?.label}
          </span>
          <button onClick={() => setBag(true)} className="relative grid size-11 place-items-center rounded-full bg-ink text-bg transition hover:bg-accent" aria-label="Open bag">
            <ShoppingBag className="size-[18px]" />
            <BagCount className="absolute -right-1 -top-1" />
          </button>
        </div>
      </motion.aside>

      {/* Desktop: order CTA, top-right */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: WIPE, delay: 0.5 }}
        className="fixed right-5 top-5 z-[60] hidden lg:block"
      >
        <Link href={nav.ctaHref} className="group flex h-11 items-center gap-2 rounded-full bg-accent pl-5 pr-1.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]">
          <RollText>{nav.ctaLabel}</RollText>
          <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </Link>
      </motion.div>

      {/* ---------- Mobile: top bar (scrolls away, blends with any background) ---------- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] text-white mix-blend-difference lg:hidden">
        <Link href="/" className="pointer-events-auto display text-[22px] uppercase tracking-[0.02em]">
          {site.shortName}®
        </Link>
        <span className="flex items-center gap-2 text-[12px] font-semibold">
          <span className="size-1.5 rounded-full bg-white" />
          {status?.label}
        </span>
      </header>

      {/* ---------- Mobile: bottom tab bar ---------- */}
      <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-[70] border-t border-ink/10 bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.href.startsWith("/") && isActive(pathname, t.href);
            const inner = (
              <>
                {t.href === "#bag" ? (
                  <span className="relative -mt-6 grid size-14 place-items-center rounded-full bg-accent text-white shadow-[0_10px_25px_-8px_var(--accent)] ring-4 ring-bg">
                    <Icon className="size-5" />
                    <BagCount className="absolute -right-0.5 -top-0.5 bg-ink" />
                  </span>
                ) : (
                  <Icon className={cn("size-[21px] transition-transform duration-300", active && "-translate-y-0.5")} strokeWidth={active ? 2.4 : 1.8} />
                )}
                <span className={cn("text-[10.5px] font-semibold", t.href === "#bag" && "mt-0.5")}>{t.label}</span>
                {active && <motion.span layoutId="tab-active" className="absolute top-0 h-[3px] w-8 rounded-b bg-accent" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
              </>
            );
            const cls = cn("relative flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors", active ? "text-ink" : "text-ink/50");
            return (
              <li key={t.label} className="flex justify-center">
                {t.href === "#bag" ? (
                  <button className={cls} onClick={() => setBag(true)} aria-label="Open bag">
                    {inner}
                  </button>
                ) : t.href === "#more" ? (
                  <button className={cls} onClick={() => setOpen(true)} aria-label="Open menu">
                    {inner}
                  </button>
                ) : (
                  <Link href={t.href} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Overlay open={open} onClose={() => setOpen(false)} />
      <AddedToast />
    </>
  );
}
