"use client";

import { Download, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, Input, PageHeader, PageSkeleton, SearchInput, Segmented, Select, StatusPill, Table, Td, downloadFile, toCSV, Avatar } from "@/components/admin/ui";
import { customerStats } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Customer, CustomerStage } from "@/lib/types";
import { money, timeAgo, uid } from "@/lib/utils";

const STAGES: (CustomerStage | "all")[] = ["all", "lead", "new", "regular", "vip", "inactive"];

export default function CustomersPage() {
  const hydrated = useDB((s) => s.hydrated);
  const customers = useDB((s) => s.customers);
  const orders = useDB((s) => s.orders);
  const currency = useDB((s) => s.settings.site.currency);
  const upsert = useDB((s) => s.upsert);
  const router = useRouter();
  const [stage, setStage] = useState<CustomerStage | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [add, setAdd] = useState<Customer | null>(null);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = customers
      .filter((c) => (stage === "all" || c.stage === stage) && (!t || c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t) || c.phone.includes(t) || c.tags.some((x) => x.toLowerCase().includes(t))))
      .map((c) => ({ c, s: customerStats(c, orders) }));
    if (sort === "ltv") r.sort((a, b) => b.s.ltv - a.s.ltv);
    else if (sort === "orders") r.sort((a, b) => b.s.count - a.s.count);
    else if (sort === "points") r.sort((a, b) => b.c.points - a.c.points);
    else r.sort((a, b) => b.c.lastActivity.localeCompare(a.c.lastActivity));
    return r;
  }, [customers, orders, stage, q, sort]);

  if (!hydrated) return <PageSkeleton />;
  const totalLtv = rows.reduce((a, b) => a + b.s.ltv, 0);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} contacts · ${money(totalLtv, currency)} lifetime value in view`}
        actions={
          <>
            <Button
              onClick={() =>
                downloadFile(
                  "customers.csv",
                  toCSV(rows.map(({ c, s }) => ({ name: c.name, email: c.email, phone: c.phone, stage: c.stage, source: c.source, tags: c.tags.join("|"), orders: s.count, ltv: s.ltv, points: c.points, created: c.createdAt }))),
                  "text/csv",
                )
              }
            >
              <Download className="size-4" /> Export CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => setAdd({ id: uid("cu-"), name: "", email: "", phone: "", tags: [], notes: "", stage: "lead", source: "manual", points: 0, createdAt: new Date().toISOString(), lastActivity: new Date().toISOString() })}
            >
              <Plus className="size-4" /> Add customer
            </Button>
          </>
        }
      />

      {/* Pipeline */}
      <div className="mb-4 grid grid-cols-5 gap-2">
        {(["lead", "new", "regular", "vip", "inactive"] as CustomerStage[]).map((s) => {
          const n = customers.filter((c) => c.stage === s).length;
          return (
            <button key={s} onClick={() => setStage(stage === s ? "all" : s)} className={`rounded-[10px] border bg-white p-3 text-left transition ${stage === s ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent)_20%,transparent)]" : "border-[var(--a-line)] hover:border-black/15"}`}>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--a-muted)]">{s}</div>
              <div className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{n}</div>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented value={stage} onChange={setStage} options={STAGES.map((s) => ({ value: s, label: <span className="capitalize">{s}</span> }))} />
        <SearchInput value={q} onChange={setQ} placeholder="Name, email, phone, tag" className="lg:w-72" />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="!w-auto" options={[{ value: "recent", label: "Recent activity" }, { value: "ltv", label: "Highest LTV" }, { value: "orders", label: "Most orders" }, { value: "points", label: "Most points" }]} />
      </div>

      <Card pad={false}>
        {rows.length === 0 ? (
          <EmptyState icon={<Users className="size-5" />} title="No customers found" />
        ) : (
          <>
            <Table head={["Customer", "Stage", "Tags", "Orders", "Lifetime value", "Points", "Last active"]}>
              {rows.map(({ c, s }) => (
                <tr key={c.id} onClick={() => router.push(`/admin/customers/${c.id}`)} className="cursor-pointer hover:bg-[var(--accent)]/[0.02]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-[var(--a-muted)]">{c.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <StatusPill status={c.stage} />
                  </Td>
                  <Td>
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {c.tags.slice(0, 2).map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                      {c.tags.length > 2 && <Badge>+{c.tags.length - 2}</Badge>}
                    </div>
                  </Td>
                  <Td className="tabular-nums">{s.count}</Td>
                  <Td className="font-medium tabular-nums">{money(s.ltv, currency)}</Td>
                  <Td className="tabular-nums">{c.points}</Td>
                  <Td className="text-[var(--a-muted)]">{timeAgo(c.lastActivity)}</Td>
                </tr>
              ))}
            </Table>
            <div className="divide-y divide-[var(--a-line)] md:hidden">
              {rows.map(({ c, s }) => (
                <Link key={c.id} href={`/admin/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="truncate text-xs text-[var(--a-muted)]">
                      {s.count} orders · {money(s.ltv, currency)}
                    </div>
                  </div>
                  <StatusPill status={c.stage} />
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>

      <Drawer
        open={!!add}
        onClose={() => setAdd(null)}
        title="Add customer"
        footer={
          <>
            <Button onClick={() => setAdd(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!add?.name.trim() || !add.email.trim()) return toast("Name and email are required", "error");
                if (customers.some((c) => c.email.toLowerCase() === add.email.trim().toLowerCase())) return toast("A customer with this email exists", "error");
                upsert("customers", { ...add, email: add.email.trim().toLowerCase() });
                toast("Customer added");
                setAdd(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {add && (
          <div className="space-y-4">
            <Field label="Full name">
              <Input value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} autoFocus />
            </Field>
            <Field label="Email">
              <Input type="email" value={add.email} onChange={(e) => setAdd({ ...add, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={add.phone} onChange={(e) => setAdd({ ...add, phone: e.target.value })} />
            </Field>
            <Field label="Stage">
              <Select value={add.stage} onChange={(e) => setAdd({ ...add, stage: e.target.value as CustomerStage })} options={STAGES.slice(1).map((s) => ({ value: s, label: s }))} className="capitalize" />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
