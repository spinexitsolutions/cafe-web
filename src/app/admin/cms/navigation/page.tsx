"use client";

import { Reorder } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, IconButton, Input, PageHeader, PageSkeleton, SaveBar, useDraft } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Settings } from "@/lib/types";
import { uid } from "@/lib/utils";

const PAGES = ["/", "/menu", "/shop", "/reserve", "/events", "/journal", "/about", "/contact", "/account", "/checkout"];

export default function NavigationPage() {
  const hydrated = useDB((s) => s.hydrated);
  const nav = useDB((s) => s.settings.nav);
  const update = useDB((s) => s.updateSettings);
  const { draft, setDraft, dirty, reset } = useDraft<Settings["nav"]>(nav);
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      <PageHeader title="Navigation" subtitle="Links in the floating navbar and full-screen menu. Drag to reorder." />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card title="Menu links">
          <datalist id="pages">
            {PAGES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <Reorder.Group axis="y" values={draft.links} onReorder={(links) => setDraft({ ...draft, links })} className="space-y-2">
            {draft.links.map((l) => (
              <Reorder.Item key={l.id} value={l} className="flex items-center gap-2 rounded-xl border border-[var(--a-line)] bg-white p-2">
                <GripVertical className="size-4 shrink-0 cursor-grab text-black/25" />
                <Input value={l.label} onChange={(e) => setDraft({ ...draft, links: draft.links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) })} placeholder="Label" />
                <Input list="pages" value={l.href} onChange={(e) => setDraft({ ...draft, links: draft.links.map((x) => (x.id === l.id ? { ...x, href: e.target.value } : x)) })} placeholder="/page" className="font-mono text-[13px]" />
                <IconButton onClick={() => setDraft({ ...draft, links: draft.links.filter((x) => x.id !== l.id) })} aria-label="Remove">
                  <Trash2 className="size-4" />
                </IconButton>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <Button size="sm" className="mt-3" onClick={() => setDraft({ ...draft, links: [...draft.links, { id: uid("n"), label: "New link", href: "/" }] })}>
            <Plus className="size-3.5" /> Add link
          </Button>
        </Card>
        <div className="space-y-4">
          <Card title="Call to action button">
            <div className="space-y-3">
              <Field label="Label">
                <Input value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
              </Field>
              <Field label="Link">
                <Input list="pages" value={draft.ctaHref} onChange={(e) => setDraft({ ...draft, ctaHref: e.target.value })} />
              </Field>
            </div>
          </Card>
          <Card title="Preview">
            <div className="flex items-center justify-between rounded-full bg-[#1d1d1f] py-1.5 pl-4 pr-1.5 text-white">
              <span className="font-[family-name:var(--font-display-active)] text-lg italic">aura</span>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-medium">{draft.ctaLabel}</span>
            </div>
            <div className="mt-3 space-y-1">
              {draft.links.map((l, i) => (
                <div key={l.id} className="flex items-baseline gap-3 font-[family-name:var(--font-display-active)] text-2xl">
                  <span className="font-mono text-[10px] text-[var(--a-muted)]">0{i + 1}</span>
                  {l.label}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty} onReset={reset} onSave={() => { update("nav", draft); toast("Navigation updated"); }} />
    </div>
  );
}
