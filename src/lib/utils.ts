import clsx, { type ClassValue } from "clsx";

export const cn = (...c: ClassValue[]) => clsx(c);

export const uid = (prefix = "") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const money = (n: number, currency = "₹") =>
  `${currency}${Math.round(n).toLocaleString("en-IN")}`;

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-IN", opts);

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(iso, { day: "numeric", month: "short" });
};

export const to12h = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${ap}`;
};

/** Is the café open right now, according to settings hours */
export function openStatus(hours: { day: string; open: string; close: string; closed: boolean }[]) {
  const d = new Date();
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const today = hours.find((h) => h.day === dayName);
  if (!today || today.closed) return { open: false, label: "Closed today" };
  const mins = d.getHours() * 60 + d.getMinutes();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const o = oh * 60 + om;
  const c = ch * 60 + cm;
  if (mins < o) return { open: false, label: `Opens at ${to12h(today.open)}` };
  if (mins >= c) return { open: false, label: "Closed for the day" };
  return { open: true, label: `Open · until ${to12h(today.close)}` };
}
