"use client";

import { Check } from "lucide-react";
import { Card, Field, Input, PageHeader, PageSkeleton, SaveBar, useDraft } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { DisplayFont, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Theme = Settings["theme"];

const PRESETS: { name: string; theme: Omit<Theme, "displayFont" | "radius"> }[] = [
  { name: "Espresso Classic", theme: { accent: "#c2652a", background: "#f6f1ea", ink: "#17120e", surface: "#ffffff" } },
  { name: "Matcha", theme: { accent: "#5c7f3a", background: "#f1f2ea", ink: "#16200f", surface: "#ffffff" } },
  { name: "Midnight", theme: { accent: "#e2a15b", background: "#14110f", ink: "#f3ece3", surface: "#1f1b18" } },
  { name: "Rose", theme: { accent: "#c0566b", background: "#f8efee", ink: "#2a1418", surface: "#ffffff" } },
  { name: "Mono", theme: { accent: "#1d1d1f", background: "#f5f5f7", ink: "#1d1d1f", surface: "#ffffff" } },
];

const FONTS: { id: DisplayFont; name: string; css: string; note: string }[] = [
  { id: "instrument", name: "Instrument Serif", css: "var(--font-instrument)", note: "Editorial, elegant" },
  { id: "fraunces", name: "Fraunces", css: "var(--font-fraunces)", note: "Warm, soft, characterful" },
  { id: "playfair", name: "Playfair Display", css: "var(--font-playfair)", note: "Classic, high contrast" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/10" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" />
      </div>
    </Field>
  );
}

export default function AppearancePage() {
  const hydrated = useDB((s) => s.hydrated);
  const theme = useDB((s) => s.settings.theme);
  const update = useDB((s) => s.updateSettings);
  const { draft: t, setDraft, dirty, reset } = useDraft<Theme>(theme);
  if (!hydrated) return <PageSkeleton />;
  const set = (patch: Partial<Theme>) => setDraft((x) => ({ ...x, ...patch }));
  const font = FONTS.find((f) => f.id === t.displayFont) ?? FONTS[0];

  return (
    <div>
      <PageHeader title="Appearance" subtitle="Brand colours, typography and shape — applied across the whole website instantly." />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Card title="Palettes">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PRESETS.map((p) => {
                const active = p.theme.accent === t.accent && p.theme.background === t.background && p.theme.ink === t.ink;
                return (
                  <button key={p.name} onClick={() => set(p.theme)} className={cn("group rounded-2xl border p-2 text-left transition", active ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]" : "border-[var(--a-line)] hover:border-black/20")}>
                    <div className="relative flex h-16 overflow-hidden rounded-xl" style={{ background: p.theme.background }}>
                      <span className="m-auto font-[family-name:var(--font-instrument)] text-2xl italic" style={{ color: p.theme.ink }}>
                        Aa
                      </span>
                      <span className="absolute bottom-2 right-2 size-4 rounded-full" style={{ background: p.theme.accent }} />
                      {active && (
                        <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-white shadow">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-1 text-xs font-medium">{p.name}</div>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card title="Custom colours">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Accent" value={t.accent} onChange={(v) => set({ accent: v })} />
              <ColorField label="Background" value={t.background} onChange={(v) => set({ background: v })} />
              <ColorField label="Text (ink)" value={t.ink} onChange={(v) => set({ ink: v })} />
              <ColorField label="Surface (cards)" value={t.surface} onChange={(v) => set({ surface: v })} />
            </div>
          </Card>
          <Card title="Display typeface">
            <div className="grid gap-3 sm:grid-cols-3">
              {FONTS.map((f) => (
                <button key={f.id} onClick={() => set({ displayFont: f.id })} className={cn("rounded-2xl border p-4 text-left transition", t.displayFont === f.id ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]" : "border-[var(--a-line)] hover:border-black/20")}>
                  <div className="text-4xl leading-none" style={{ fontFamily: f.css }}>
                    Aa <em>Aa</em>
                  </div>
                  <div className="mt-3 text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-[var(--a-muted)]">{f.note}</div>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Corner radius">
            <div className="flex items-center gap-4">
              <input type="range" min={0} max={40} value={t.radius} onChange={(e) => set({ radius: Number(e.target.value) })} className="flex-1 accent-[var(--accent)]" />
              <span className="w-12 text-right text-sm tabular-nums">{t.radius}px</span>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <Card title="Live preview">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/10" style={{ background: t.background, color: t.ink }}>
              <div className="flex items-center justify-between px-4 py-3">
                <span style={{ fontFamily: font.css }} className="text-xl italic">
                  aura
                </span>
                <span className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: t.ink, color: t.background }}>
                  Order now
                </span>
              </div>
              <div className="px-4 pb-4">
                <div className="text-[9px] uppercase tracking-[0.2em] opacity-60">Specialty coffee</div>
                <div className="mt-1 text-[40px] leading-[0.95] tracking-tight" style={{ fontFamily: font.css }}>
                  Coffee, made <em style={{ color: t.accent }}>slowly.</em>
                </div>
                <div className="mt-4 overflow-hidden p-3 shadow-sm" style={{ background: t.surface, borderRadius: t.radius }}>
                  <div className="aspect-[16/10] bg-cover bg-center" style={{ borderRadius: Math.max(0, t.radius - 8), backgroundImage: "url(https://images.unsplash.com/photo-1514066558159-fc8c737ef259?auto=format&fit=crop&w=600&q=70)" }} />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Aura Flat White</div>
                      <div className="text-xs opacity-60">Cocoa · Hazelnut</div>
                    </div>
                    <span className="rounded-full px-3 py-1.5 text-xs font-medium text-white" style={{ background: t.accent }}>
                      + Add
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <SaveBar
        dirty={dirty}
        onReset={reset}
        onSave={() => {
          update("theme", t);
          toast("Theme applied to website");
        }}
      />
    </div>
  );
}
