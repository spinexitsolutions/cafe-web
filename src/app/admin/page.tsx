"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Inbox, Receipt, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, PageHeader, PageSkeleton, Segmented, StatusPill, Thumb } from "@/components/admin/ui";
import { NEXT_LABEL, dailySeries, nextStatus, periodStats, todayISO, topProducts, valid } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import { cn, money, timeAgo, to12h } from "@/lib/utils";

function Delta({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-bold", up ? "text-[#1f6b42]" : "text-[#a52d24]")}>
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {Math.abs(v).toFixed(1)}%
    </span>
  );
}

function Kpi({ label, value, sub, icon: Icon, i }: { label: string; value: string; sub?: React.ReactNode; icon: React.ComponentType<{ className?: string }>; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.08, duration: 0.6 }}
      className="group relative flex flex-col bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--bg)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="a-label text-[var(--a-muted)]">
          <span className="text-[var(--accent)]">({String(i + 1).padStart(2, "0")})</span> {label}
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--a-line)] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
          <Icon className="size-4" />
        </span>
      </div>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="display a-num mt-6 text-[clamp(1.55rem,3.2vw,2.6rem)] leading-none"
      >
        {value}
      </motion.div>
      {sub && <div className="mt-2 text-xs text-[var(--a-muted)]">{sub}</div>}
    </motion.div>
  );
}

function RevenueChart({ data, currency }: { data: { date: Date; revenue: number; orders: number }[]; currency: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 220;
  const pad = { t: 16, b: 28, l: 8, r: 8 };
  const max = Math.max(1, ...data.map((d) => d.revenue)) * 1.15;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  // smooth path (catmull-rom -> bezier)
  const pts = data.map((d, i) => [x(i), y(d.revenue)] as const);
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    line += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  const area = `${line} L ${pts[pts.length - 1][0]} ${H - pad.b} L ${pts[0][0]} ${H - pad.b} Z`;
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full overflow-visible" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + (1 - g) * (H - pad.t - pad.b)} y2={pad.t + (1 - g) * (H - pad.t - pad.b)} stroke="color-mix(in oklab, var(--ink) 10%, transparent)" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={area} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
        <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
        {data.map((d, i) => (
          <rect key={i} x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
        ))}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="color-mix(in oklab, var(--ink) 30%, transparent)" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(data[hover].revenue)} r={5} fill="white" stroke="var(--accent)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-[var(--a-muted)]">
        {data.map((d, i) => (
          <span key={i} className={cn(i % 2 === 1 && "hidden sm:inline")}>
            {d.date.toLocaleDateString("en-IN", { day: "numeric", month: data.length > 7 ? undefined : "short" })}
          </span>
        ))}
      </div>
      {h && (
        <div className="pointer-events-none absolute top-0 rounded-[8px] bg-[var(--ink)] px-3 py-2 text-xs text-white shadow-lg" style={{ left: `clamp(0px, calc(${(x(hover!) / W) * 100}% - 60px), calc(100% - 130px))` }}>
          <div className="font-semibold">{money(h.revenue, currency)}</div>
          <div className="text-white/60">
            {h.orders} orders · {h.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const hydrated = useDB((s) => s.hydrated);
  const orders = useDB((s) => s.orders);
  const reservations = useDB((s) => s.reservations);
  const customers = useDB((s) => s.customers);
  const messages = useDB((s) => s.messages);
  const currency = useDB((s) => s.settings.site.currency);
  const setStatus = useDB((s) => s.setOrderStatus);
  const [range, setRange] = useState<"7" | "14" | "30">("14");

  const stats = useMemo(() => {
    const today = periodStats(orders, 1);
    const week = periodStats(orders, 7);
    const month = periodStats(orders, 30);
    const series = dailySeries(orders, Number(range));
    const top = topProducts(orders.filter((o) => Date.now() - new Date(o.createdAt).getTime() < 30 * 86400000));
    const fulfil = (["delivery", "pickup", "dine-in"] as const).map((f) => ({ f, n: orders.filter((o) => valid(o) && o.fulfillment === f).length }));
    const live = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
    const t = todayISO();
    const upcoming = reservations
      .filter((r) => r.date >= t && !["cancelled", "no-show", "completed"].includes(r.status))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 5);
    const resToday = reservations.filter((r) => r.date === t && r.status !== "cancelled");
    const newCust = customers.filter((c) => Date.now() - new Date(c.createdAt).getTime() < 30 * 86400000).length;
    return { today, week, month, series, top, fulfil, live, upcoming, resToday, newCust };
  }, [orders, reservations, customers, range]);

  if (!hydrated) return <PageSkeleton />;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalF = stats.fulfil.reduce((a, b) => a + b.n, 0) || 1;

  return (
    <div>
      <PageHeader
        title={`${greet}.`}
        subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <Link href="/admin/orders/board">
            <Button variant="dark">
              Open live board <ArrowRight className="size-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[var(--a-line)] bg-[var(--a-line)] xl:grid-cols-4">
        <Kpi i={0} icon={Wallet} label="Revenue today" value={money(stats.today.revenue, currency)} sub={<><Delta v={stats.today.change} /> vs yesterday</>} />
        <Kpi i={1} icon={TrendingUp} label="Last 7 days" value={money(stats.week.revenue, currency)} sub={<><Delta v={stats.week.change} /> vs prev. week</>} />
        <Kpi i={2} icon={Receipt} label="Orders · 30d" value={String(stats.month.count)} sub={<>AOV {money(stats.month.aov, currency)} · <Delta v={stats.month.change} /></>} />
        <Kpi i={3} icon={CalendarDays} label="Tables today" value={String(stats.resToday.length)} sub={`${stats.resToday.reduce((a, b) => a + b.guests, 0)} guests · ${stats.newCust} new customers (30d)`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={
            <div>
              <div>
                <span className="text-[var(--accent)]">(05)</span> Revenue
              </div>
              <div className="display a-num mt-2 text-3xl normal-case tracking-normal">{money(stats.series.reduce((a, b) => a + b.revenue, 0), currency)}</div>
            </div>
          }
          action={<Segmented value={range} onChange={setRange} options={[{ value: "7", label: "7D" }, { value: "14", label: "14D" }, { value: "30", label: "30D" }]} />}
        >
          <RevenueChart key={range} data={stats.series} currency={currency} />
        </Card>
        <Card title={<><span className="text-[var(--accent)]">(06)</span> Fulfilment mix</>}>
          <div className="space-y-4">
            {stats.fulfil.map(({ f, n }, i) => (
              <div key={f}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="capitalize">{f}</span>
                  <span className="tabular-nums text-[var(--a-muted)]">
                    {n} · {Math.round((n / totalF) * 100)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden bg-[var(--a-line)]">
                  <motion.div
                    className="h-full"
                    style={{ background: i === 0 ? "var(--accent)" : i === 1 ? "var(--ink)" : "color-mix(in oklab, var(--ink) 30%, transparent)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / totalF) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-[var(--a-line)] pt-4">
            <div className="a-label mb-3 text-[var(--a-muted)]">Top sellers · 30 days</div>
            <div className="space-y-3">
              {stats.top.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="a-num w-5 text-xs font-bold text-[var(--a-muted)]">{String(i + 1).padStart(2, "0")}</span>
                  <Thumb src={p.image} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-[var(--a-muted)]">{p.qty} sold</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{money(p.revenue, currency)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" pad={false} title={<span className="flex items-center gap-2"><span className="text-[var(--accent)]">(07)</span> Live queue <Badge tone="accent">{stats.live.length}</Badge></span>} action={<Link href="/admin/orders" className="text-sm font-semibold text-[var(--accent)]">All orders ↗</Link>}>
          {stats.live.length === 0 ? (
            <EmptyState icon={<Receipt className="size-5" />} title="All caught up" text="New orders will appear here instantly." />
          ) : (
            <div className="divide-y divide-[var(--a-line)]">
              {stats.live.slice(0, 6).map((o) => {
                const nx = nextStatus(o);
                return (
                  <motion.div layout key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold a-num">{o.number}</span>
                        <StatusPill status={o.status} />
                      </div>
                      <div className="mt-0.5 truncate text-xs text-[var(--a-muted)]">
                        {o.customer.name} · {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </div>
                    </Link>
                    <div className="text-right text-xs text-[var(--a-muted)]">
                      <div className="text-sm font-medium tabular-nums text-[var(--a-ink)]">{money(o.total, currency)}</div>
                      <span className="capitalize">{o.fulfillment}</span> · {timeAgo(o.createdAt)}
                    </div>
                    {nx && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setStatus(o.id, nx);
                          toast(`${o.number} → ${nx.replace(/-/g, " ")}`);
                        }}
                      >
                        {NEXT_LABEL[nx]}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card title={<><span className="text-[var(--accent)]">(08)</span> Upcoming tables</>} action={<Link href="/admin/reservations" className="text-sm font-semibold text-[var(--accent)]">View ↗</Link>}>
            {stats.upcoming.length === 0 ? (
              <p className="text-sm text-[var(--a-muted)]">No upcoming reservations.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcoming.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="grid w-12 shrink-0 rounded-[6px] border border-[var(--a-line)] py-1 text-center">
                      <span className="text-[10px] uppercase text-[var(--a-muted)]">{new Date(r.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                      <span className="display text-lg leading-tight">{new Date(r.date).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-[var(--a-muted)]">
                        {to12h(r.time)} · {r.guests} guests · {r.area}
                      </div>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title={<><span className="text-[var(--accent)]">(09)</span> Inbox</>} action={<Link href="/admin/inbox" className="text-sm font-semibold text-[var(--accent)]">Open ↗</Link>}>
            <div className="space-y-3">
              {messages.slice(0, 3).map((m) => (
                <Link key={m.id} href="/admin/inbox" className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--a-line)] text-sm font-medium">{m.name[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{m.name}</span>
                      {m.status === "new" && <span className="size-2 rounded-full bg-[var(--accent)]" />}
                    </div>
                    <div className="truncate text-xs text-[var(--a-muted)]">{m.subject}</div>
                  </div>
                </Link>
              ))}
              {messages.length === 0 && (
                <p className="flex items-center gap-2 text-sm text-[var(--a-muted)]">
                  <Inbox className="size-4" /> No messages
                </p>
              )}
            </div>
          </Card>
          <Card title={<><span className="text-[var(--accent)]">(10)</span> Customers</>} action={<Link href="/admin/customers" className="text-sm font-semibold text-[var(--accent)]">CRM ↗</Link>}>
            <div className="flex items-center gap-3">
              <Users className="size-5 text-[var(--accent)]" />
              <div className="text-sm">
                <span className="font-semibold">{customers.length}</span> contacts · <span className="font-semibold">{customers.filter((c) => c.stage === "vip").length}</span> VIP
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
