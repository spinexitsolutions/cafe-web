import {
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
  Mail,
  Navigation,
  Package,
  Palette,
  Quote,
  Receipt,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }>; badge?: "orders" | "messages" | "reservations" | "reviews" };
export const NAV: { group: string; items: NavItem[] }[] = [
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
export function isActive(path: string, href: string) {
  if (href === "/admin") return path === "/admin";
  if (path === href) return true;
  // pick the longest matching nav href
  const best = ALL_HREFS.filter((h) => h !== "/admin" && (path === h || path.startsWith(h + "/"))).sort((a, b) => b.length - a.length)[0];
  return best === href;
}


/** Running number + group + label for a path, used by page headers ("(05) Commerce"). */
export function navMeta(path: string) {
  let n = 0;
  for (const g of NAV)
    for (const it of g.items) {
      n += 1;
      if (isActive(path, it.href)) return { n, group: g.group, label: it.label };
    }
  return { n: 0, group: "Admin", label: "" };
}
