"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LogOut, Menu as MenuIcon, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdmin } from "@/store/admin";
import { useDB } from "@/store/db";
import { cn, money } from "@/lib/utils";
import { Toaster, toast } from "./toast";
import { Toggle } from "./ui";
import { NAV, isActive } from "./nav";
import { RollText } from "../motion/Kit";

function useBadges() {
  const orders = useDB((s) => s.orders.filter((o) => o.status === "pending").length);
  const messages = useDB((s) => s.messages.filter((m) => m.status === "new").length);
  const reservations = useDB((s) => s.reservations.filter((r) => r.status === "pending").length);
  const reviews = useDB((s) => s.reviews.filter((r) => !r.approved).length);
  return { orders, messages, reservations, reviews };
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const badges = useBadges();
  const hydrated = useDB((s) => s.hydrated);
  const short = useDB((s) => s.settings.site.shortName);
  const logout = useAdmin((s) => s.logout);
  const router = useRouter();
  let n = 0;
  return (
    <div className="flex h-full flex-col bg-[var(--ink)] text-[var(--bg)]">
      <Link href="/admin" onClick={onNavigate} className="group flex items-center gap-3 px-5 pb-5 pt-6">
        <span className="grid size-10 place-items-center rounded-[10px] bg-[var(--accent)] text-white transition-transform duration-500 group-hover:-rotate-6">
          <span className="display text-lg leading-none">{short.charAt(0).toUpperCase()}</span>
        </span>
        <span className="min-w-0">
          <span className="display block text-[19px] uppercase leading-none">{short}®</span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">Admin</span>
        </span>
      </Link>
      <div className="mx-5 h-px bg-[color-mix(in_oklab,var(--bg)_14%,transparent)]" />
      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-5">
        {NAV.map((g, gi) => (
          <div key={g.group}>
            <div className="flex items-baseline gap-2 px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.1em]">
              <span className="text-[var(--accent)] brightness-150">({String(gi + 1).padStart(2, "0")})</span>
              <span className="opacity-45">{g.group}</span>
            </div>
            <div className="space-y-px">
              {g.items.map((it) => {
                n += 1;
                const active = isActive(path, it.href);
                const count = it.badge && hydrated ? badges[it.badge] : 0;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] transition-colors",
                      active ? "font-semibold text-white" : "opacity-70 hover:bg-white/[0.06] hover:opacity-100",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={onNavigate ? "nav-pill-m" : "nav-pill"}
                        className="absolute inset-0 rounded-[8px] bg-[var(--accent)]"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <it.icon className="relative size-[17px]" />
                    <span className="relative flex-1">
                      <RollText>{it.label}</RollText>
                    </span>
                    <span className={cn("relative text-[10px] tabular-nums", active ? "opacity-70" : "opacity-30")}>{String(n).padStart(2, "0")}</span>
                    {count > 0 && (
                      <span className={cn("relative min-w-5 rounded-[4px] px-1.5 text-center text-[11px] font-bold leading-5", active ? "bg-white text-[var(--accent)]" : "bg-[var(--accent)] text-white")}>{count}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
          className="group flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-sm opacity-70 hover:bg-white/[0.06] hover:opacity-100"
        >
          <LogOut className="size-[17px]" /> <RollText>Sign out</RollText>
        </button>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const orders = useDB((s) => s.orders);
  const customers = useDB((s) => s.customers);
  const products = useDB((s) => s.products);
  const currency = useDB((s) => s.settings.site.currency);
  const router = useRouter();

  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        ref.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      window.removeEventListener("keydown", k);
    };
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const r: { href: string; title: string; sub: string; kind: string }[] = [];
    orders
      .filter((o) => o.number.toLowerCase().includes(t) || o.customer.name.toLowerCase().includes(t))
      .slice(0, 4)
      .forEach((o) => r.push({ href: `/admin/orders/${o.id}`, title: o.number, sub: `${o.customer.name} · ${money(o.total, currency)}`, kind: "Order" }));
    customers
      .filter((c) => c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t) || c.phone.includes(t))
      .slice(0, 4)
      .forEach((c) => r.push({ href: `/admin/customers/${c.id}`, title: c.name, sub: c.email, kind: "Customer" }));
    products
      .filter((p) => p.name.toLowerCase().includes(t))
      .slice(0, 4)
      .forEach((p) => r.push({ href: `/admin/products/${p.id}`, title: p.name, sub: money(p.price, currency), kind: "Product" }));
    return r;
  }, [q, orders, customers, products, currency]);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--a-muted)]" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search orders, customers, products…"
        className="h-10 w-full border-b border-transparent bg-transparent pl-7 pr-12 text-sm outline-none transition placeholder:text-[var(--a-muted)] focus:border-[var(--accent)]"
      />
      <kbd className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-[4px] border border-[var(--a-line)] px-1.5 text-[10px] text-[var(--a-muted)] sm:block">⌘K</kbd>
      <AnimatePresence>
        {open && q && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-[10px] border border-[var(--a-line)] bg-[var(--surface)] p-1.5 shadow-[0_24px_60px_-20px_rgba(16,18,28,0.35)]"
          >
            {results.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[var(--a-muted)]">No matches for “{q}”</div>
            ) : (
              results.map((r) => (
                <button
                  key={r.href}
                  onClick={() => {
                    router.push(r.href);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2 text-left hover:bg-[var(--bg)]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="truncate text-xs text-[var(--a-muted)]">{r.sub}</div>
                  </div>
                  <span className="a-label rounded-[4px] bg-[var(--bg)] px-1.5 py-0.5 text-[var(--a-muted)]">{r.kind}</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoreToggle() {
  const accepting = useDB((s) => s.settings.site.acceptingOrders);
  const hydrated = useDB((s) => s.hydrated);
  const update = useDB((s) => s.updateSettings);
  if (!hydrated) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--a-line)] py-1 pl-3 pr-1.5">
      <span className={cn("hidden items-center gap-1.5 text-xs font-semibold sm:inline-flex", accepting ? "text-[var(--a-ink)]" : "text-[var(--a-muted)]")}><span className={cn("size-1.5 rounded-full", accepting ? "bg-emerald-500" : "bg-[var(--a-muted)]")} />
        {accepting ? "Taking orders" : "Paused"}
      </span>
      <Toggle
        size="sm"
        checked={accepting}
        onChange={(v) => {
          update("site", { acceptingOrders: v });
          toast(v ? "Store is now accepting orders" : "Online ordering paused");
        }}
      />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();
  return (
    <div className="admin min-h-dvh">
      <Toaster />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] print:!hidden lg:block">
        <Sidebar />
      </aside>
      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--ink)]/40" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              exit={{ clipPath: "inset(0 100% 0 0)" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-y-0 left-0 w-[84%] max-w-[300px]"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-6 z-10 grid size-9 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Close menu">
                <X className="size-5" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[260px] print:!pl-0">
        <header className="sticky top-0 z-30 border-b border-[var(--a-line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur-xl print:hidden">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--a-line)] lg:hidden" aria-label="Open menu">
              <MenuIcon className="size-5" />
            </button>
            <GlobalSearch />
            <div className="ml-auto flex items-center gap-2">
              <StoreToggle />
              <Link href="/" target="_blank" className="group hidden h-9 items-center gap-2 rounded-full bg-[var(--ink)] pl-4 pr-1 text-[13px] font-semibold text-[var(--bg)] transition hover:bg-[var(--accent)] hover:text-white sm:inline-flex">
                <RollText>View site</RollText>
                <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </header>
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pt-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
