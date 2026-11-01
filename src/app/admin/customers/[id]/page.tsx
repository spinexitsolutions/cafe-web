"use client";

import { ArrowLeft, CalendarDays, Coins, Mail, MessageCircle, Phone, Receipt, StickyNote, Trash2, Ticket, Inbox, Gift } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Button, Card, ChipsInput, EmptyState, Field, Input, PageSkeleton, Select, StatusPill, Textarea, useConfirm } from "@/components/admin/ui";
import { customerStats } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Customer, CustomerStage } from "@/lib/types";
import { fmtDate, money, timeAgo, to12h } from "@/lib/utils";

const ACT_ICON = { order: Receipt, reservation: CalendarDays, message: Inbox, note: StickyNote, event: Ticket, newsletter: Mail, points: Coins };

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useDB((s) => s.hydrated);
  const customer = useDB((s) => s.customers.find((c) => c.id === id));
  const orders = useDB((s) => s.orders);
  const reservations = useDB((s) => s.reservations);
  const activities = useDB((s) => s.activities);
  const settings = useDB((s) => s.settings);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const addNote = useDB((s) => s.addCustomerNote);
  const adjustPoints = useDB((s) => s.adjustPoints);
  const [draft, setDraft] = useState<Customer | null>(null);
  const [note, setNote] = useState("");
  const [pts, setPts] = useState(10);
  const { confirm, node } = useConfirm();

  useEffect(() => {
    if (customer) setDraft(customer);
  }, [customer]);

  const data = useMemo(() => {
    if (!customer) return null;
    const s = customerStats(customer, orders);
    const res = reservations.filter((r) => r.email.toLowerCase() === customer.email.toLowerCase());
    const acts = activities.filter((a) => a.customerId === customer.id);
    return { ...s, res, acts };
  }, [customer, orders, reservations, activities]);

  if (!hydrated) return <PageSkeleton />;
  if (!customer || !draft || !data)
    return (
      <Card>
        <EmptyState title="Customer not found" action={<Link href="/admin/customers"><Button>Back</Button></Link>} />
      </Card>
    );

  const cur = settings.site.currency;
  const dirty = JSON.stringify(draft) !== JSON.stringify(customer);
  const phoneDigits = customer.phone.replace(/\D/g, "");
  const rewardAt = 100;

  return (
    <div>
      {node}
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--a-muted)] hover:text-[var(--a-ink)]">
        <ArrowLeft className="size-4" /> Customers
      </Link>

      <Card className="mb-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar name={customer.name} size="size-16 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
              <StatusPill status={customer.stage} />
              <Badge>via {customer.source}</Badge>
            </div>
            <div className="mt-1 text-sm text-[var(--a-muted)]">
              Customer since {fmtDate(customer.createdAt, { month: "long", year: "numeric" })} · last active {timeAgo(customer.lastActivity)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${customer.email}`}>
                <Button size="sm"><Mail className="size-3.5" /> Email</Button>
              </a>
              {customer.phone && (
                <>
                  <a href={`tel:${customer.phone}`}>
                    <Button size="sm"><Phone className="size-3.5" /> Call</Button>
                  </a>
                  <a href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hi ${customer.name.split(" ")[0]}! It's ${settings.site.name} ☕`)}`} target="_blank">
                    <Button size="sm"><MessageCircle className="size-3.5" /> WhatsApp</Button>
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-[380px]">
            {[
              ["Lifetime value", money(data.ltv, cur)],
              ["Orders", String(data.count)],
              ["Avg. order", money(data.aov, cur)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-[10px] bg-[var(--a-line)] p-3">
                <div className="text-[11px] text-[var(--a-muted)]">{l}</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card
            title="Profile"
            action={
              dirty && (
                <Button size="sm" variant="primary" onClick={() => { upsert("customers", draft); toast("Customer updated"); }}>
                  Save
                </Button>
              )
            }
          >
            <div className="space-y-3">
              <Field label="Name">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stage">
                  <Select value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value as CustomerStage })} className="capitalize" options={["lead", "new", "regular", "vip", "inactive"].map((s) => ({ value: s, label: s }))} />
                </Field>
                <Field label="Birthday">
                  <Input type="date" value={draft.birthday ?? ""} onChange={(e) => setDraft({ ...draft, birthday: e.target.value || undefined })} />
                </Field>
              </div>
              <Field label="Tags">
                <ChipsInput value={draft.tags} onChange={(v) => setDraft({ ...draft, tags: v })} suggestions={["oat milk", "works from café", "wholesale", "allergy", "influencer", "corporate"]} />
              </Field>
              <Field label="Private notes">
                <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Preferences, allergies, favourite seat…" />
              </Field>
            </div>
          </Card>

          <Card title="Loyalty">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold tabular-nums">{customer.points}</div>
                <div className="text-xs text-[var(--a-muted)]">Aura points</div>
              </div>
              <Gift className="size-8 text-[var(--accent)]" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--a-line)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, ((customer.points % rewardAt) / rewardAt) * 100)}%` }} />
            </div>
            <div className="mt-1.5 text-xs text-[var(--a-muted)]">
              {Math.floor(customer.points / rewardAt)} free drinks available · {rewardAt - (customer.points % rewardAt)} pts to next
            </div>
            <div className="mt-4 flex gap-2">
              <Input type="number" value={pts} onChange={(e) => setPts(Number(e.target.value))} className="!w-24" />
              <Button size="sm" className="!h-10" onClick={() => { adjustPoints(customer.id, pts, "Manual adjustment"); toast(`+${pts} points`); }}>
                Add
              </Button>
              <Button size="sm" className="!h-10" onClick={() => { adjustPoints(customer.id, -rewardAt, "Redeemed free drink"); toast("Reward redeemed"); }} disabled={customer.points < rewardAt}>
                Redeem
              </Button>
            </div>
          </Card>

          <Button
            variant="danger"
            className="w-full"
            onClick={async () => {
              if (await confirm("Delete customer?", "Their orders stay in the system, but the CRM profile and notes are removed.")) {
                remove("customers", customer.id);
                toast("Customer deleted");
                router.replace("/admin/customers");
              }
            }}
          >
            <Trash2 className="size-4" /> Delete customer
          </Button>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card title="Activity">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addNote(customer.id, note.trim());
                setNote("");
                toast("Note added");
              }}
              className="mb-5 flex gap-2"
            >
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, note or follow-up…" />
              <Button variant="dark" className="!h-10 shrink-0">Add note</Button>
            </form>
            {data.acts.length === 0 ? (
              <p className="text-sm text-[var(--a-muted)]">No activity yet.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-[var(--a-line)] pl-6">
                {data.acts.slice(0, 30).map((a) => {
                  const Icon = ACT_ICON[a.type] ?? StickyNote;
                  return (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[37px] grid size-6 place-items-center rounded-full bg-white ring-1 ring-[var(--a-line)]">
                        <Icon className="size-3 text-[var(--accent)]" />
                      </span>
                      <div className="text-sm">{a.text}</div>
                      <div className="text-xs text-[var(--a-muted)]">{timeAgo(a.at)}</div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card title={`Orders (${data.orders.length})`} pad={false}>
            {data.orders.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--a-muted)]">No orders yet.</p>
            ) : (
              <div className="divide-y divide-[var(--a-line)]">
                {data.orders.slice(0, 12).map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--accent)]/[0.02]">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{o.number}</div>
                      <div className="truncate text-xs text-[var(--a-muted)]">
                        {fmtDate(o.createdAt, { day: "numeric", month: "short" })} · {o.items.map((i) => i.name).join(", ")}
                      </div>
                    </div>
                    <StatusPill status={o.status} />
                    <span className="w-20 text-right text-sm font-medium tabular-nums">{money(o.total, cur)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Reservations (${data.res.length})`}>
            {data.res.length === 0 ? (
              <p className="text-sm text-[var(--a-muted)]">No reservations.</p>
            ) : (
              <div className="space-y-2">
                {data.res.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>
                      {fmtDate(r.date + "T00:00", { day: "numeric", month: "short" })} · {to12h(r.time)} · {r.guests} guests · <span className="capitalize">{r.area}</span>
                    </span>
                    <StatusPill status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
