"use client";

import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, IconButton, Input, PageHeader, PageSkeleton, Select, Toggle, useConfirm } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Coupon } from "@/lib/types";
import { fmtDate, money, uid } from "@/lib/utils";

export default function CouponsPage() {
  const hydrated = useDB((s) => s.hydrated);
  const coupons = useDB((s) => s.coupons);
  const currency = useDB((s) => s.settings.site.currency);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [edit, setEdit] = useState<Coupon | null>(null);
  const { confirm, node } = useConfirm();
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      {node}
      <PageHeader
        title="Coupons"
        subtitle="Discount codes customers can apply at checkout."
        actions={
          <Button variant="primary" onClick={() => setEdit({ id: uid("cp-"), code: "", type: "percent", value: 10, minOrder: 0, active: true, uses: 0, description: "" })}>
            <Plus className="size-4" /> New coupon
          </Button>
        }
      />
      {coupons.length === 0 ? (
        <Card>
          <EmptyState icon={<Tag className="size-5" />} title="No coupons yet" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <Card key={c.id} className="relative overflow-hidden">
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-[color-mix(in_oklab,var(--accent)_10%,white)]" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="font-mono text-lg font-semibold tracking-wider">{c.code}</div>
                    <div className="text-sm text-[var(--a-muted)]">{c.description || "—"}</div>
                  </div>
                  <Toggle size="sm" checked={c.active} onChange={(v) => { upsert("coupons", { ...c, active: v }); toast(v ? "Coupon activated" : "Coupon paused"); }} />
                </div>
                <div className="relative mt-4 text-3xl font-semibold tracking-tight">
                  {c.type === "percent" ? `${c.value}%` : money(c.value, currency)} <span className="text-base font-normal text-[var(--a-muted)]">off</span>
                </div>
                <div className="relative mt-3 flex flex-wrap gap-1.5">
                  <Badge>{c.uses} uses</Badge>
                  {c.minOrder > 0 && <Badge>Min {money(c.minOrder, currency)}</Badge>}
                  {c.expiresAt && <Badge tone={expired ? "red" : "gray"}>{expired ? "Expired" : `Until ${fmtDate(c.expiresAt, { day: "numeric", month: "short" })}`}</Badge>}
                  {!c.active && <Badge tone="orange">Paused</Badge>}
                </div>
                <div className="relative mt-4 flex justify-end gap-1 border-t border-[var(--a-line)] pt-3">
                  <IconButton onClick={() => setEdit(c)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={async () => {
                      if (await confirm("Delete coupon?", `${c.code} will stop working immediately.`)) {
                        remove("coupons", c.id);
                        toast("Coupon deleted");
                      }
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Coupon"
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit) return;
                const code = edit.code.trim().toUpperCase();
                if (!code) return toast("Code is required", "error");
                if (coupons.some((c) => c.code === code && c.id !== edit.id)) return toast("Code already exists", "error");
                upsert("coupons", { ...edit, code });
                toast("Coupon saved");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Field label="Code">
              <Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase().replace(/\s/g, "") })} className="font-mono uppercase" placeholder="WELCOME15" />
            </Field>
            <Field label="Description">
              <Input value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Coupon["type"] })} options={[{ value: "percent", label: "Percentage" }, { value: "flat", label: `Flat ${currency}` }]} />
              </Field>
              <Field label="Value">
                <Input type="number" value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label={`Minimum order (${currency})`}>
              <Input type="number" value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: Number(e.target.value) })} />
            </Field>
            <Field label="Expires on" hint="Leave empty for no expiry">
              <Input type="date" value={edit.expiresAt?.slice(0, 10) ?? ""} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value ? new Date(e.target.value + "T23:59:59").toISOString() : undefined })} />
            </Field>
            <Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Active" />
          </div>
        )}
      </Drawer>
    </div>
  );
}
