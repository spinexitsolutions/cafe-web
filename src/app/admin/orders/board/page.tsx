"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Store, Truck, Utensils } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, PageHeader, PageSkeleton, Toggle } from "@/components/admin/ui";
import { FLOW, NEXT_LABEL, nextStatus } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Order, OrderStatus } from "@/lib/types";
import { cn, money, timeAgo } from "@/lib/utils";

const COL_TONE: Record<string, string> = {
  pending: "#ff9f0a",
  confirmed: "#0a84ff",
  preparing: "#af52de",
  ready: "#30b0c7",
  "out-for-delivery": "#5e5ce6",
  completed: "#34c759",
};

function prevStatus(o: Order): OrderStatus | null {
  const flow = o.fulfillment === "delivery" ? FLOW : FLOW.filter((s) => s !== "out-for-delivery");
  const i = flow.indexOf(o.status);
  return i > 0 ? flow[i - 1] : null;
}

export default function Board() {
  const hydrated = useDB((s) => s.hydrated);
  const orders = useDB((s) => s.orders);
  const currency = useDB((s) => s.settings.site.currency);
  const setStatus = useDB((s) => s.setOrderStatus);
  const [showDone, setShowDone] = useState(false);
  const [, tick] = useState(0);

  // re-render every 30s for relative timers + pick up orders placed in other tabs (storage sync)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!hydrated) return <PageSkeleton />;
  const cols = showDone ? FLOW : FLOW.filter((c) => c !== "completed");
  const todayDone = orders.filter((o) => o.status === "completed" && Date.now() - new Date(o.timeline.at(-1)!.at).getTime() < 86400000);

  const move = (o: Order, s: OrderStatus | null) => {
    if (!s) return;
    setStatus(o.id, s);
    toast(`${o.number} → ${s.replace(/-/g, " ")}`);
  };

  return (
    <div>
      <PageHeader
        title="Live board"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34c759] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#34c759]" />
            </span>
            Live · new orders from the website appear here automatically
          </span>
        }
        actions={<Toggle checked={showDone} onChange={setShowDone} label={<span className="text-[13px]">Show completed</span>} />}
      />
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {cols.map((c) => {
          const list = (c === "completed" ? todayDone : orders.filter((o) => o.status === c)).slice(0, 30);
          return (
            <div key={c} className="flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col rounded-2xl bg-black/[0.035] p-2 sm:w-[280px]">
              <div className="flex items-center gap-2 px-2 py-2">
                <span className="size-2.5 rounded-full" style={{ background: COL_TONE[c] }} />
                <span className="text-sm font-semibold capitalize">{c.replace(/-/g, " ")}</span>
                <span className="ml-auto rounded-full bg-white px-2 text-xs font-medium tabular-nums shadow-sm">{list.length}</span>
              </div>
              <div className="min-h-32 space-y-2">
                <AnimatePresence initial={false}>
                  {list.map((o) => {
                    const nx = nextStatus(o);
                    const pv = prevStatus(o);
                    const FIcon = o.fulfillment === "delivery" ? Truck : o.fulfillment === "pickup" ? Store : Utensils;
                    const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
                    return (
                      <motion.div
                        key={o.id}
                        layout
                        layoutId={o.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
                      >
                        <div className="flex items-center justify-between">
                          <Link href={`/admin/orders/${o.id}`} className="text-sm font-semibold hover:text-[var(--accent)]">
                            {o.number}
                          </Link>
                          <span className={cn("text-[11px] tabular-nums", c !== "completed" && mins > 20 ? "font-semibold text-[#d1281e]" : "text-[var(--a-muted)]")}>{timeAgo(o.createdAt)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--a-muted)]">
                          <FIcon className="size-3.5" />
                          <span className="capitalize">{o.fulfillment}</span>
                          {o.tableNo && <Badge>Table {o.tableNo}</Badge>}
                          <span className="ml-auto font-medium text-[var(--a-ink)]">{money(o.total, currency)}</span>
                        </div>
                        <ul className="mt-2 space-y-0.5 text-[13px]">
                          {o.items.map((it, i) => (
                            <li key={i} className="flex gap-1.5">
                              <span className="font-semibold tabular-nums">{it.qty}×</span>
                              <span className="truncate">{it.name}</span>
                            </li>
                          ))}
                        </ul>
                        {o.notes && <p className="mt-2 rounded-lg bg-[#ff9f0a]/10 px-2 py-1 text-xs text-[#8a5300]">“{o.notes}”</p>}
                        <div className="mt-3 flex items-center gap-1.5">
                          <button disabled={!pv || c === "completed"} onClick={() => move(o, pv)} className="grid size-8 place-items-center rounded-full bg-black/[0.04] disabled:opacity-30" aria-label="Move back">
                            <ChevronLeft className="size-4" />
                          </button>
                          {nx ? (
                            <Button size="sm" variant="primary" className="flex-1" onClick={() => move(o, nx)}>
                              {NEXT_LABEL[nx]} <ChevronRight className="size-3.5" />
                            </Button>
                          ) : (
                            <span className="flex-1 text-center text-xs text-[var(--a-muted)]">Done</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {list.length === 0 && <div className="grid h-24 place-items-center rounded-xl border border-dashed border-black/10 text-xs text-[var(--a-muted)]">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
