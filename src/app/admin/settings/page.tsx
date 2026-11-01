"use client";

import { Card, Field, Input, PageHeader, PageSkeleton, SaveBar, Textarea, Toggle, useDraft } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Draft = Pick<Settings, "site" | "loyalty" | "seo" | "footer">;

export default function StoreSettings() {
  const hydrated = useDB((s) => s.hydrated);
  const settings = useDB((s) => s.settings);
  const update = useDB((s) => s.updateSettings);
  const { draft, setDraft, dirty, reset } = useDraft<Draft>({ site: settings.site, loyalty: settings.loyalty, seo: settings.seo, footer: settings.footer });
  if (!hydrated) return <PageSkeleton />;
  const site = draft.site;
  const setSite = (p: Partial<Settings["site"]>) => setDraft((d) => ({ ...d, site: { ...d.site, ...p } }));
  const text = (k: keyof Settings["site"], label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <Input value={String(site[k])} onChange={(e) => setSite({ [k]: e.target.value } as Partial<Settings["site"]>)} />
    </Field>
  );
  const num = (k: keyof Settings["site"], label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <Input type="number" value={Number(site[k])} onChange={(e) => setSite({ [k]: Number(e.target.value) } as Partial<Settings["site"]>)} />
    </Field>
  );

  return (
    <div>
      <PageHeader title="Store settings" subtitle="Business details, checkout rules, hours, loyalty and SEO." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Business">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("name", "Café name")}
            {text("shortName", "Short name / logo text")}
            <div className="sm:col-span-2">{text("tagline", "Tagline")}</div>
            {text("email", "Email")}
            {text("phone", "Phone")}
            {text("whatsapp", "WhatsApp number", "Digits only, with country code")}
            {text("instagram", "Instagram handle")}
            {text("address", "Address")}
            {text("city", "City & PIN")}
            <div className="sm:col-span-2">{text("mapQuery", "Google Maps search", "Used for the embedded map")}</div>
          </div>
        </Card>

        <Card title="Checkout & delivery">
          <Toggle checked={site.acceptingOrders} onChange={(v) => setSite({ acceptingOrders: v })} label="Accepting online orders" description="Turn off to pause checkout (e.g. when the kitchen is full)" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("currency", "Currency symbol")}
            {num("taxRate", "Tax rate (%)", "GST applied on subtotal after discount")}
            {num("deliveryFee", "Delivery fee")}
            {num("freeDeliveryAbove", "Free delivery above")}
            {num("minOrder", "Minimum order value")}
          </div>
        </Card>

        <Card title="Opening hours">
          <div className="space-y-2">
            {site.hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3">
                <span className={cn("w-24 text-sm", h.closed && "text-[var(--a-muted)]")}>{h.day}</span>
                <Input type="time" value={h.open} disabled={h.closed} onChange={(e) => setSite({ hours: site.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)) })} className="!py-1.5 disabled:opacity-40" />
                <span className="text-[var(--a-muted)]">–</span>
                <Input type="time" value={h.close} disabled={h.closed} onChange={(e) => setSite({ hours: site.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)) })} className="!py-1.5 disabled:opacity-40" />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-[var(--a-muted)] sm:inline">Open</span>
                  <Toggle size="sm" checked={!h.closed} onChange={(v) => setSite({ hours: site.hours.map((x, j) => (j === i ? { ...x, closed: !v } : x)) })} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Loyalty programme">
          <Toggle checked={draft.loyalty.enabled} onChange={(v) => setDraft((d) => ({ ...d, loyalty: { ...d.loyalty, enabled: v } }))} label="Enable Aura points" description="Customers earn points on every order" />
          <div className="mt-4 space-y-4">
            <Field label={`Points per ${site.currency}100 spent`}>
              <Input type="number" value={draft.loyalty.pointsPer100} onChange={(e) => setDraft((d) => ({ ...d, loyalty: { ...d.loyalty, pointsPer100: Number(e.target.value) } }))} />
            </Field>
            <Field label="Reward description">
              <Textarea value={draft.loyalty.rewardText} onChange={(e) => setDraft((d) => ({ ...d, loyalty: { ...d.loyalty, rewardText: e.target.value } }))} className="!min-h-16" />
            </Field>
          </div>
        </Card>

        <Card title="SEO & footer">
          <div className="space-y-4">
            <Field label="Meta title" hint={`${draft.seo.title.length}/60`}>
              <Input value={draft.seo.title} onChange={(e) => setDraft((d) => ({ ...d, seo: { ...d.seo, title: e.target.value } }))} />
            </Field>
            <Field label="Meta description" hint={`${draft.seo.description.length}/160`}>
              <Textarea value={draft.seo.description} onChange={(e) => setDraft((d) => ({ ...d, seo: { ...d.seo, description: e.target.value } }))} className="!min-h-16" />
            </Field>
            <div className="rounded-xl bg-black/[0.03] p-3">
              <div className="truncate text-[15px] text-[#1a0dab]">{draft.seo.title}</div>
              <div className="text-xs text-[#006621]">auracoffee.in</div>
              <div className="line-clamp-2 text-xs text-[#545454]">{draft.seo.description}</div>
            </div>
            <Field label="Footer note">
              <Input value={draft.footer.note} onChange={(e) => setDraft((d) => ({ ...d, footer: { note: e.target.value } }))} />
            </Field>
          </div>
        </Card>
      </div>
      <SaveBar
        dirty={dirty}
        onReset={reset}
        onSave={() => {
          (Object.keys(draft) as (keyof Draft)[]).forEach((k) => update(k, draft[k] as never));
          toast("Settings saved");
        }}
      />
    </div>
  );
}
