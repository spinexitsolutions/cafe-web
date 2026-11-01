"use client";

import { Copy, Download, Mail, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card, EmptyState, IconButton, PageHeader, PageSkeleton, SearchInput, downloadFile, toCSV } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import { fmtDate } from "@/lib/utils";

export default function SubscribersPage() {
  const hydrated = useDB((s) => s.hydrated);
  const subs = useDB((s) => s.subscribers);
  const remove = useDB((s) => s.remove);
  const [q, setQ] = useState("");
  const list = useMemo(() => subs.filter((s) => s.email.includes(q.trim().toLowerCase())), [subs, q]);
  if (!hydrated) return <PageSkeleton />;
  const thisMonth = subs.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 30 * 86400000).length;

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${subs.length} newsletter subscribers · +${thisMonth} in the last 30 days`}
        actions={
          <>
            <Button onClick={() => { navigator.clipboard?.writeText(subs.map((s) => s.email).join(", ")); toast("Emails copied"); }}>
              <Copy className="size-4" /> Copy all
            </Button>
            <Button variant="primary" onClick={() => downloadFile("subscribers.csv", toCSV(subs.map((s) => ({ email: s.email, subscribed: s.createdAt }))), "text/csv")}>
              <Download className="size-4" /> Export CSV
            </Button>
          </>
        }
      />
      <SearchInput value={q} onChange={setQ} placeholder="Search email" className="mb-4 sm:w-72" />
      <Card pad={false}>
        {list.length === 0 ? (
          <EmptyState icon={<Mail className="size-5" />} title="No subscribers yet" text="Sign-ups from the website footer & homepage appear here." />
        ) : (
          <div className="divide-y divide-[var(--a-line)]">
            {list.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="grid size-9 place-items-center rounded-full bg-black/[0.04]">
                  <Mail className="size-4 text-[var(--a-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.email}</div>
                  <div className="text-xs text-[var(--a-muted)]">Joined {fmtDate(s.createdAt)}</div>
                </div>
                <IconButton onClick={() => { remove("subscribers", s.id); toast("Unsubscribed"); }} aria-label="Remove">
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
