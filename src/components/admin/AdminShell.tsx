"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Columns3,
  Database,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Navigation,
  Package,
  Palette,
  Quote,
  Receipt,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useAdmin } from "@/store/admin";
import { useDB } from "@/store/db";
import { cn, money } from "@/lib/utils";
import { Toaster, toast } from "./toast";
import { Toggle } from "./ui";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }>; badge?: "orders" | "messages" | "reservations" | "reviews" };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Receipt, badge: "orders" },
      { href: "/admin/orders/board", label: "Live board", icon: Columns3 },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
      { href: "/admin/reviews", label: "Reviews", icon: Star, badge: "reviews" },
    ],
  },
  {
    group: "Bookings",
    items: [
      { href: "/admin/reservations", label: "Reservations", icon: CalendarDays, badge: "reservations" },
      { href: "/admin/events", label: "Events", icon: Ticket },
    ],
  },
  {
    group: "CRM",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, badge: "messages" },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    group: "CMS",
    items: [
      { href: "/admin/cms/home", label: "Homepage", icon: FileText },
      { href: "/admin/cms/appearance", label: "Appearance", icon: Palette },
      { href: "/admin/cms/intro", label: "Intro animation", icon: Sparkles },
      { href: "/admin/cms/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/cms/journal", label: "Journal", icon: BookOpen },
      { href: "/admin/cms/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/cms/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/cms/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/settings", label: "Store settings", icon: SettingsIcon },
      { href: "/admin/settings/data", label: "Data", icon: Database },
    ],
  },
];

const ALL_HREFS = NAV.flatMap((g) => g.items.map((i) => i.href));
function isActive(path: string, href: string) {
  if (href === "/admin") return path === "/admin";
  if (path === href) return true;
  // pick the longest matching nav href
  const best = ALL_HREFS.filter((h) => h !== "/admin" && (path === h || path.startsWith(h + "/"))).sort((a, b) => b.length - a.length)[0];
  return best === href;
}

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
  const name = useDB((s) => s.settings.site.name);
  const logout = useAdmin((s) => s.logout);
  const router = useRouter();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <div className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] font-[family-name:var(--font-instrument)] text-xl italic text-white">a</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="text-xs text-[var(--a-muted)]">Admin console</div>
        </div>
      </div>
      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--a-muted)]/80">{g.group}</div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(path, it.href);
                const count = it.badge && hydrated ? badges[it.badge] : 0;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors",
                      active ? "font-medium text-[var(--a-ink)]" : "text-[#48484a] hover:bg-black/[0.035]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={onNavigate ? "nav-pill-m" : "nav-pill"}
                        className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <it.icon className={cn("relative size-[18px]", active ? "text-[var(--accent)]" : "text-[#8e8e93]")} />
                    <span className="relative flex-1">{it.label}</span>
                    {count > 0 && (
                      <span className="relative min-w-5 rounded-full bg-[var(--accent)] px-1.5 text-center text-[11px] font-semibold leading-5 text-white">{count}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-[var(--a-line)] p-3">
        <button
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#48484a] hover:bg-black/[0.04]"
        >
          <LogOut className="size-[18px] text-[#8e8e93]" /> Sign out
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
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--a-muted)]" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search orders, customers, products…"
        className="h-10 w-full rounded-full border border-transparent bg-black/[0.045] pl-9 pr-12 text-sm outline-none transition focus:border-[var(--accent)] focus:bg-white"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-black/10 px-1.5 text-[10px] text-[var(--a-muted)] sm:block">⌘K</kbd>
      <AnimatePresence>
        {open && q && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-[var(--a-line)] bg-white p-1.5 shadow-2xl"
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
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-black/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="truncate text-xs text-[var(--a-muted)]">{r.sub}</div>
                  </div>
                  <span className="text-[11px] text-[var(--a-muted)]">{r.kind}</span>
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
    <div className="flex items-center gap-2 rounded-full bg-black/[0.045] py-1 pl-3 pr-1.5">
      <span className={cn("hidden text-xs font-medium sm:inline", accepting ? "text-[#1f8a3b]" : "text-[var(--a-muted)]")}>{accepting ? "Taking orders" : "Paused"}</span>
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] print:!hidden border-r border-[var(--a-line)] bg-[#f5f5f7]/80 backdrop-blur-xl lg:block">
        <Sidebar />
      </aside>
      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="absolute inset-y-0 left-0 w-[84%] max-w-[300px] bg-[#f5f5f7] shadow-2xl"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 grid size-8 place-items-center rounded-full hover:bg-black/5" aria-label="Close menu">
                <X className="size-5" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[260px] print:!pl-0">
        <header className="sticky top-0 z-30 print:hidden border-b border-[var(--a-line)] bg-[#f5f5f7]/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-black/5 lg:hidden" aria-label="Open menu">
              <MenuIcon className="size-5" />
            </button>
            <GlobalSearch />
            <div className="ml-auto flex items-center gap-2">
              <StoreToggle />
              <Link href="/" target="_blank" className="hidden h-9 items-center gap-1 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white hover:bg-black sm:inline-flex">
                View site <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </header>
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
