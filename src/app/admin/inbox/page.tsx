"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Archive, ArrowLeft, Inbox, Mail, Phone, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Button, Card, EmptyState, PageHeader, PageSkeleton, Segmented, StatusPill } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Message } from "@/lib/types";
import { cn, fmtDate, fmtTime, timeAgo } from "@/lib/utils";

export default function InboxPage() {
  const hydrated = useDB((s) => s.hydrated);
  const messages = useDB((s) => s.messages);
  const customers = useDB((s) => s.customers);
  const siteName = useDB((s) => s.settings.site.name);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [tab, setTab] = useState<"inbox" | "new" | "archived">("inbox");
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(
    () => messages.filter((m) => (tab === "archived" ? m.status === "archived" : tab === "new" ? m.status === "new" : m.status !== "archived")),
    [messages, tab],
  );

  if (!hydrated) return <PageSkeleton />;
  const current = messages.find((m) => m.id === sel) ?? null;
  const contact = current && customers.find((c) => c.email.toLowerCase() === current.email.toLowerCase());

  const open = (m: Message) => {
    setSel(m.id);
    if (m.status === "new") upsert("messages", { ...m, status: "read" });
  };
  const setStatus = (m: Message, status: Message["status"], msg: string) => {
    upsert("messages", { ...m, status });
    toast(msg);
  };

  return (
    <div>
      <PageHeader title="Inbox" subtitle={`${messages.filter((m) => m.status === "new").length} unread · contact form & enquiries`} />
      <Segmented value={tab} onChange={(v) => { setTab(v); setSel(null); }} className="mb-4" options={[{ value: "inbox", label: "Inbox" }, { value: "new", label: "Unread" }, { value: "archived", label: "Archived" }]} />
      <Card pad={false} className="overflow-hidden">
        <div className="grid min-h-[560px] lg:grid-cols-[360px_1fr]">
          <div className={cn("border-[var(--a-line)] lg:border-r", current && "hidden lg:block")}>
            {list.length === 0 ? (
              <EmptyState icon={<Inbox className="size-5" />} title="Nothing here" text="Messages from the contact page arrive here." />
            ) : (
              <div className="divide-y divide-[var(--a-line)]">
                {list.map((m) => (
                  <button key={m.id} onClick={() => open(m)} className={cn("flex w-full gap-3 px-4 py-3.5 text-left transition", sel === m.id ? "bg-[color-mix(in_oklab,var(--accent)_8%,white)]" : "hover:bg-black/[0.02]")}>
                    <div className="relative">
                      <Avatar name={m.name} />
                      {m.status === "new" && <span className="absolute -left-1 top-0 size-2.5 rounded-full bg-[var(--accent)] ring-2 ring-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", m.status === "new" ? "font-semibold" : "font-medium")}>{m.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--a-muted)]">{timeAgo(m.createdAt)}</span>
                      </div>
                      <div className="truncate text-[13px]">{m.subject}</div>
                      <div className="truncate text-xs text-[var(--a-muted)]">{m.message}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={cn(!current && "hidden lg:block")}>
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div key={current.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-5 sm:p-7">
                  <button onClick={() => setSel(null)} className="mb-4 flex items-center gap-1 text-sm text-[var(--a-muted)] lg:hidden">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{current.subject}</h2>
                      <div className="mt-1 text-sm text-[var(--a-muted)]">
                        {fmtDate(current.createdAt, { weekday: "short", day: "numeric", month: "short" })} at {fmtTime(current.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={current.status} />
                  </div>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-black/[0.03] p-3">
                    <Avatar name={current.name} />
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="font-medium">{current.name}</div>
                      <div className="flex flex-wrap gap-x-3 text-xs text-[var(--a-muted)]">
                        <span className="flex items-center gap-1"><Mail className="size-3" /> {current.email}</span>
                        {current.phone && <span className="flex items-center gap-1"><Phone className="size-3" /> {current.phone}</span>}
                      </div>
                    </div>
                    {contact && (
                      <Link href={`/admin/customers/${contact.id}`} className="text-sm text-[var(--accent)]">
                        CRM profile
                      </Link>
                    )}
                  </div>
                  <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed">{current.message}</p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${current.email}?subject=${encodeURIComponent("Re: " + current.subject)}&body=${encodeURIComponent(`Hi ${current.name.split(" ")[0]},\n\nThanks for reaching out to ${siteName}.\n\n`)}`}
                      onClick={() => setStatus(current, "replied", "Marked as replied")}
                    >
                      <Button variant="primary">
                        <Reply className="size-4" /> Reply by email
                      </Button>
                    </a>
                    {current.status !== "replied" && <Button onClick={() => setStatus(current, "replied", "Marked as replied")}>Mark replied</Button>}
                    {current.status !== "new" && <Button onClick={() => setStatus(current, "new", "Marked unread")}>Mark unread</Button>}
                    {current.status !== "archived" ? (
                      <Button onClick={() => { setStatus(current, "archived", "Archived"); setSel(null); }}>
                        <Archive className="size-4" /> Archive
                      </Button>
                    ) : (
                      <Button onClick={() => setStatus(current, "read", "Moved to inbox")}>Unarchive</Button>
                    )}
                    <Button variant="danger" onClick={() => { remove("messages", current.id); setSel(null); toast("Message deleted"); }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <EmptyState icon={<Mail className="size-5" />} title="Select a message" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
}
