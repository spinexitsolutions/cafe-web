"use client";

import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button, Card, PageHeader, PageSkeleton, downloadFile, useConfirm } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { snapshot, useDB } from "@/store/db";
import type { DB } from "@/lib/types";

export default function DataPage() {
  const hydrated = useDB((s) => s.hydrated);
  const counts = useDB(
    useShallow((s) => ({
    products: s.products.length,
    orders: s.orders.length,
    customers: s.customers.length,
    reservations: s.reservations.length,
    posts: s.posts.length,
    messages: s.messages.length,
  })),
  );
  const importDB = useDB((s) => s.importDB);
  const resetDemo = useDB((s) => s.resetDemo);
  const fileRef = useRef<HTMLInputElement>(null);
  const { confirm, node } = useConfirm();
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      {node}
      <PageHeader title="Data" subtitle="Back up, restore or reset everything — catalogue, orders, CRM and website content." />
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Object.entries(counts).map(([k, v]) => (
          <Card key={k} className="!p-4">
            <div className="text-xl font-semibold tabular-nums">{v}</div>
            <div className="text-xs capitalize text-[var(--a-muted)]">{k}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Export backup">
          <p className="mb-4 text-sm text-[var(--a-muted)]">Download a JSON file with all data and settings.</p>
          <Button variant="dark" onClick={() => { downloadFile(`aura-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(snapshot(), null, 2), "application/json"); toast("Backup downloaded"); }}>
            <Download className="size-4" /> Export JSON
          </Button>
        </Card>
        <Card title="Import backup">
          <p className="mb-4 text-sm text-[var(--a-muted)]">Restore from a previously exported file. This replaces current data.</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                const db = JSON.parse(await f.text()) as DB;
                if (!db.settings || !Array.isArray(db.products)) throw new Error("bad");
                if (await confirm("Replace all data?", `Import “${f.name}”? Current data will be overwritten.`)) {
                  importDB(db);
                  toast("Backup restored");
                }
              } catch {
                toast("That file isn't a valid Aura backup", "error");
              }
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Choose file
          </Button>
        </Card>
        <Card title="Reset demo">
          <p className="mb-4 text-sm text-[var(--a-muted)]">Restore the original demo menu, orders, customers and content.</p>
          <Button
            variant="danger"
            onClick={async () => {
              if (await confirm("Reset all data?", "Every change you've made (products, orders, CMS content, theme) will be lost.")) {
                resetDemo();
                useDB.getState().setHydrated();
                toast("Demo data restored");
              }
            }}
          >
            <RotateCcw className="size-4" /> Reset to demo
          </Button>
        </Card>
      </div>
      <p className="mt-6 text-xs text-[var(--a-muted)]">
        Demo mode: data is stored in this browser (localStorage) and syncs live across open tabs. Connect a database/API to share it across devices.
      </p>
    </div>
  );
}
