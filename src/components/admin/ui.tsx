"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, Plus, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------- Layout bits ------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--a-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
  title,
  action,
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  pad?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--a-line)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.06)]",
        pad && "p-5",
        className,
      )}
    >
      {(title || action) && (
        <div className={cn("mb-4 flex items-center justify-between gap-3", !pad && "px-5 pt-5")}>
          {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-black/[0.06]", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-black/[0.04] text-[var(--a-muted)]">{icon}</div>}
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-[var(--a-muted)]">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------------- Buttons --------------------------------- */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-[var(--accent)] text-white shadow-sm hover:brightness-110",
        variant === "dark" && "bg-[#1d1d1f] text-white hover:bg-black",
        variant === "secondary" && "border border-[var(--a-line)] bg-white hover:bg-black/[0.03]",
        variant === "ghost" && "hover:bg-black/[0.05]",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "grid size-9 place-items-center rounded-full text-[var(--a-muted)] transition hover:bg-black/[0.05] hover:text-[var(--a-ink)] active:scale-95 disabled:opacity-30",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* --------------------------------- Inputs ---------------------------------- */

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-[#3a3a3c]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--a-muted)]">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn("a-input", className)} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn("a-input min-h-24 resize-y leading-relaxed", className)} />;
}

export function Select({
  className,
  options,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...rest} className={cn("a-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236e6e73%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-200",
        size === "sm" ? "h-5 w-8" : "h-[26px] w-[44px]",
        checked ? "bg-[#34c759]" : "bg-black/15",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={cn(
          "absolute top-0.5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
          size === "sm" ? "size-4" : "size-[22px]",
          checked ? (size === "sm" ? "left-[14px]" : "left-[20px]") : "left-0.5",
        )}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-[var(--a-muted)]">{description}</div>}
      </div>
      {sw}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-black/[0.05] p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            value === o.value ? "text-[var(--a-ink)]" : "text-[var(--a-muted)] hover:text-[var(--a-ink)]",
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join("")}`}
              className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--a-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="a-input !rounded-full !pl-9" />
    </div>
  );
}

/* ------------------------------ Badges/Pills ------------------------------- */

const TONES: Record<string, string> = {
  gray: "bg-black/[0.05] text-[#3a3a3c]",
  green: "bg-[#34c759]/12 text-[#1f8a3b]",
  blue: "bg-[#0a84ff]/10 text-[#0a6cd6]",
  orange: "bg-[#ff9f0a]/14 text-[#b86e00]",
  red: "bg-[#ff3b30]/10 text-[#d1281e]",
  purple: "bg-[#af52de]/10 text-[#8a3cb3]",
  teal: "bg-[#30b0c7]/12 text-[#1d8296]",
  accent: "bg-[color-mix(in_oklab,var(--accent)_14%,white)] text-[var(--accent)]",
};

export function Badge({ tone = "gray", children, className, dot }: { tone?: keyof typeof TONES | string; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", TONES[tone] ?? TONES.gray, className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<string, string> = {
  pending: "orange",
  confirmed: "blue",
  preparing: "purple",
  ready: "teal",
  "out-for-delivery": "blue",
  completed: "green",
  cancelled: "red",
  seated: "purple",
  "no-show": "red",
  paid: "green",
  refunded: "gray",
  new: "orange",
  read: "gray",
  replied: "green",
  archived: "gray",
  lead: "gray",
  regular: "blue",
  vip: "purple",
  inactive: "red",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? "gray"} dot>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

/* ------------------------------ Overlays ----------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className={cn("absolute inset-y-0 right-0 flex w-full flex-col bg-[#fbfbfd] shadow-2xl", width)}
          >
            <div className="flex items-center justify-between border-b border-[var(--a-line)] px-5 py-4">
              <div className="text-[17px] font-semibold tracking-tight">{title}</div>
              <IconButton onClick={onClose} aria-label="Close">
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-[var(--a-line)] bg-white px-5 py-3">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-end p-0 sm:place-items-center sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            {title && <div className="mb-2 text-lg font-semibold tracking-tight">{title}</div>}
            <div className="text-sm text-[#3a3a3c]">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{ title: string; text: string; danger?: boolean; resolve: (v: boolean) => void } | null>(null);
  const confirm = (title: string, text: string, danger = true) =>
    new Promise<boolean>((resolve) => setState({ title, text, danger, resolve }));
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const node = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={state?.title}
      footer={
        <>
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button variant={state?.danger ? "danger" : "primary"} onClick={() => close(true)}>
            Confirm
          </Button>
        </>
      }
    >
      {state?.text}
    </Modal>
  );
  return { confirm, node };
}

/* ------------------------------ Image + chips ------------------------------ */

export function Thumb({ src, className, alt = "" }: { src?: string; className?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-black/[0.05]", className)}>
      {src && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" onError={() => setErr(true)} loading="lazy" />
      ) : (
        <div className="grid size-full place-items-center text-[var(--a-muted)]">
          <ImageOff className="size-4" />
        </div>
      )}
    </div>
  );
}

export function ImageInput({ label = "Image URL", value, onChange, aspect = "aspect-[4/3]" }: { label?: string; value: string; onChange: (v: string) => void; aspect?: string }) {
  return (
    <div>
      <Field label={label} hint="Paste an Unsplash or any public image URL">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/…" />
      </Field>
      <Thumb src={value} className={cn("mt-2 w-full", aspect)} />
    </div>
  );
}

export function ChipsInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add and press Enter",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="a-input flex min-h-11 flex-wrap items-center gap-1.5 !py-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] py-0.5 pl-2.5 pr-1 text-xs font-medium">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid size-4 place-items-center rounded-full hover:bg-black/10">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-24 flex-1 bg-transparent py-1 text-sm outline-none"
        />
      </div>
      {suggestions.filter((s) => !value.includes(s)).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-black/15 px-2.5 py-0.5 text-xs text-[var(--a-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                <Plus className="size-3" />
                {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/** Editable list of plain strings (e.g. gallery URLs, marquee words). */
export function StringList({ value, onChange, placeholder, addLabel = "Add" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <IconButton type="button" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} aria-label="Move up">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" /></svg>
          </IconButton>
          <IconButton type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
            <X className="size-4" />
          </IconButton>
        </div>
      ))}
      <Button type="button" size="sm" onClick={() => onChange([...value, ""])}>
        <Plus className="size-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

/* --------------------------------- Table ----------------------------------- */

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--a-line)] text-xs text-[var(--a-muted)]">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--a-line)]">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-5 py-3", className)}>{children}</td>;
}

/* ------------------------------ Save bar ----------------------------------- */

export function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed inset-x-0 bottom-4 z-[70] mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-3 rounded-full bg-[#1d1d1f] py-2 pl-5 pr-2 text-white shadow-2xl lg:left-[260px]"
        >
          <span className="text-sm">Unsaved changes</span>
          <div className="flex gap-1.5">
            <button onClick={onReset} className="h-9 rounded-full px-4 text-sm text-white/70 hover:text-white">
              Discard
            </button>
            <button onClick={onSave} className="h-9 rounded-full bg-[var(--accent)] px-5 text-sm font-medium hover:brightness-110">
              Save
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Local draft state for a settings section with dirty tracking. */
export function useDraft<T>(source: T) {
  const [draft, setDraft] = useState<T>(source);
  const [base, setBase] = useState<T>(source);
  useEffect(() => {
    setDraft(source);
    setBase(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(source)]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(base);
  return { draft, setDraft, dirty, reset: () => setDraft(base) };
}

export function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

/* --------------------------------- Avatar ---------------------------------- */

export function Avatar({ name, size = "size-9" }: { name: string; size?: string }) {
  const initials = name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((a, b) => a + b.charCodeAt(0), 0) % 360;
  return (
    <div className={`${size} grid shrink-0 place-items-center rounded-full text-xs font-semibold`} style={{ background: `hsl(${hue} 60% 92%)`, color: `hsl(${hue} 45% 35%)` }}>
      {initials || "?"}
    </div>
  );
}
