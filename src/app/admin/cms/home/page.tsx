"use client";

import { Reorder } from "framer-motion";
import { ArrowDown, ArrowUp, ExternalLink, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, IconButton, ImageInput, Input, PageHeader, PageSkeleton, SaveBar, Select, StringList, Textarea, Toggle, useDraft } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Settings } from "@/lib/types";

type Draft = Pick<Settings, "hero" | "story" | "marquee" | "experience" | "announcement" | "sections">;

export default function HomeCMS() {
  const hydrated = useDB((s) => s.hydrated);
  const settings = useDB((s) => s.settings);
  const products = useDB((s) => s.products);
  const update = useDB((s) => s.updateSettings);
  const { draft, setDraft, dirty, reset } = useDraft<Draft>({
    hero: settings.hero,
    story: settings.story,
    marquee: settings.marquee,
    experience: settings.experience,
    announcement: settings.announcement,
    sections: settings.sections,
  });

  if (!hydrated) return <PageSkeleton />;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const hero = draft.hero;
  const story = draft.story;

  const save = () => {
    (Object.keys(draft) as (keyof Draft)[]).forEach((k) => update(k, draft[k] as never));
    toast("Homepage published");
  };

  const moveSection = (i: number, d: -1 | 1) => {
    const n = [...draft.sections];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    set("sections", n);
  };

  return (
    <div>
      <PageHeader
        title="Homepage"
        subtitle="Every word and image on the homepage. Changes go live when you save."
        actions={
          <a href="/" target="_blank">
            <Button>
              <ExternalLink className="size-4" /> Preview
            </Button>
          </a>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="Announcement bar">
            <Toggle checked={draft.announcement.enabled} onChange={(v) => set("announcement", { ...draft.announcement, enabled: v })} label="Show announcement" description="Thin bar above the navbar" />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
              <Field label="Text">
                <Input value={draft.announcement.text} onChange={(e) => set("announcement", { ...draft.announcement, text: e.target.value })} />
              </Field>
              <Field label="Link">
                <Input value={draft.announcement.href} onChange={(e) => set("announcement", { ...draft.announcement, href: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card title="Hero">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" className="sm:col-span-2">
                <Input value={hero.eyebrow} onChange={(e) => set("hero", { ...hero, eyebrow: e.target.value })} />
              </Field>
              <Field label="Headline">
                <Input value={hero.title} onChange={(e) => set("hero", { ...hero, title: e.target.value })} />
              </Field>
              <Field label="Headline (accent part)">
                <Input value={hero.titleItalic} onChange={(e) => set("hero", { ...hero, titleItalic: e.target.value })} />
              </Field>
              <div className="rounded-2xl bg-black/[0.03] px-5 py-6 sm:col-span-2">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--a-muted)]">{hero.eyebrow}</div>
                <div className="mt-2 font-[family-name:var(--font-display-active)] text-4xl leading-none tracking-tight sm:text-5xl">
                  {hero.title} <em className="text-[var(--accent)]">{hero.titleItalic}</em>
                </div>
              </div>
              <Field label="Subtitle" className="sm:col-span-2">
                <Textarea value={hero.subtitle} onChange={(e) => set("hero", { ...hero, subtitle: e.target.value })} />
              </Field>
              <ImageInput label="Main image" value={hero.image} onChange={(v) => set("hero", { ...hero, image: v })} />
              <ImageInput label="Secondary image" value={hero.secondaryImage} onChange={(v) => set("hero", { ...hero, secondaryImage: v })} />
              <Field label="Primary button">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={hero.ctaPrimary.label} onChange={(e) => set("hero", { ...hero, ctaPrimary: { ...hero.ctaPrimary, label: e.target.value } })} placeholder="Label" />
                  <Input value={hero.ctaPrimary.href} onChange={(e) => set("hero", { ...hero, ctaPrimary: { ...hero.ctaPrimary, href: e.target.value } })} placeholder="/menu" />
                </div>
              </Field>
              <Field label="Secondary button">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={hero.ctaSecondary.label} onChange={(e) => set("hero", { ...hero, ctaSecondary: { ...hero.ctaSecondary, label: e.target.value } })} placeholder="Label" />
                  <Input value={hero.ctaSecondary.href} onChange={(e) => set("hero", { ...hero, ctaSecondary: { ...hero.ctaSecondary, href: e.target.value } })} placeholder="/reserve" />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Hero drinks — the hero recolours for each one">
            <div className="space-y-3">
              {(hero.slides ?? []).map((sl, k) => {
                const slides = hero.slides ?? [];
                const setSlide = (patch: Partial<typeof sl>) => set("hero", { ...hero, slides: slides.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
                return (
                  <div key={sl.id} className="rounded-2xl border border-[var(--a-line)] p-3" style={{ background: sl.bg, color: sl.ink }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-xs font-semibold opacity-60">{String(k + 1).padStart(2, "0")}</span>
                      <Select
                        value={sl.productId}
                        onChange={(e) => setSlide({ productId: e.target.value })}
                        options={products.filter((p) => p.type === "menu").map((p) => ({ value: p.id, label: p.name }))}
                        className="flex-1 !text-[var(--a-ink)]"
                      />
                      <IconButton onClick={() => k > 0 && set("hero", { ...hero, slides: slides.map((x, j) => (j === k - 1 ? slides[k] : j === k ? slides[k - 1] : x)) })} aria-label="Move up">
                        <ArrowUp className="size-4" />
                      </IconButton>
                      <IconButton onClick={() => set("hero", { ...hero, slides: slides.filter((_, j) => j !== k) })} aria-label="Remove">
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 pl-8 text-xs font-medium">
                      {(["bg", "ink", "pop"] as const).map((key) => (
                        <label key={key} className="flex items-center gap-2 rounded-xl bg-white/70 p-1.5 pr-2 text-[var(--a-ink)]">
                          <span className="relative size-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10" style={{ background: sl[key] }}>
                            <input type="color" value={sl[key]} onChange={(e) => setSlide({ [key]: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
                          </span>
                          {key === "bg" ? "Background" : key === "ink" ? "Text" : "Accent"}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    set("hero", {
                      ...hero,
                      slides: [...(hero.slides ?? []), { id: `hs${Date.now()}`, productId: products.find((p) => p.type === "menu")?.id ?? "", bg: "#f4f2ee", ink: "#14110f", pop: "#e8432d" }],
                    })
                  }
                >
                  <Plus className="size-4" /> Add drink
                </Button>
                <label className="flex items-center gap-2 text-sm">
                  Autoplay every
                  <Input type="number" min={0} max={20} value={hero.autoplay ?? 5} onChange={(e) => set("hero", { ...hero, autoplay: Number(e.target.value) })} className="!w-20" />
                  sec (0 = off)
                </label>
              </div>
            </div>
          </Card>

          <Card title="Story section">
            <div className="grid gap-4">
              <Field label="Eyebrow">
                <Input value={story.eyebrow} onChange={(e) => set("story", { ...story, eyebrow: e.target.value })} />
              </Field>
              <Field label="Statement" hint="Revealed word-by-word as visitors scroll">
                <Textarea value={story.statement} onChange={(e) => set("story", { ...story, statement: e.target.value })} />
              </Field>
              <Field label="Body">
                <Textarea value={story.body} onChange={(e) => set("story", { ...story, body: e.target.value })} rows={4} />
              </Field>
              <ImageInput value={story.image} onChange={(v) => set("story", { ...story, image: v })} aspect="aspect-[16/9]" />
              <div>
                <div className="mb-1.5 text-[13px] font-medium text-[#3a3a3c]">Stats</div>
                <div className="space-y-2">
                  {story.stats.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input className="!w-28" value={s.value} onChange={(e) => set("story", { ...story, stats: story.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} placeholder="12" />
                      <Input value={s.label} onChange={(e) => set("story", { ...story, stats: story.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="Label" />
                      <IconButton onClick={() => set("story", { ...story, stats: story.stats.filter((_, j) => j !== i) })} aria-label="Remove">
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  ))}
                  <Button size="sm" onClick={() => set("story", { ...story, stats: [...story.stats, { value: "", label: "" }] })}>
                    <Plus className="size-3.5" /> Add stat
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Experience cards">
            <div className="space-y-4">
              {draft.experience.map((x, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-[var(--a-line)] p-3 sm:grid-cols-[1fr_200px]">
                  <div className="space-y-2">
                    <Input value={x.title} onChange={(e) => set("experience", draft.experience.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} placeholder="Title" className="font-medium" />
                    <Textarea value={x.text} onChange={(e) => set("experience", draft.experience.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))} className="!min-h-16" />
                    <Button size="sm" variant="danger" onClick={() => set("experience", draft.experience.filter((_, j) => j !== i))}>
                      <Trash2 className="size-3.5" /> Remove
                    </Button>
                  </div>
                  <ImageInput label="Image" value={x.image} onChange={(v) => set("experience", draft.experience.map((y, j) => (j === i ? { ...y, image: v } : y)))} />
                </div>
              ))}
              <Button size="sm" onClick={() => set("experience", [...draft.experience, { title: "", text: "", image: "" }])}>
                <Plus className="size-3.5" /> Add card
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Sections" action={<span className="text-xs text-[var(--a-muted)]">Drag or use arrows</span>}>
            <Reorder.Group axis="y" values={draft.sections} onReorder={(v) => set("sections", v)} className="space-y-1.5">
              {draft.sections.map((s, i) => (
                <Reorder.Item key={s.key} value={s} className="flex cursor-grab items-center gap-2 rounded-xl border border-[var(--a-line)] bg-white px-2 py-2 active:cursor-grabbing">
                  <GripVertical className="size-4 shrink-0 text-black/25" />
                  <span className={`flex-1 text-sm ${s.enabled ? "" : "text-[var(--a-muted)] line-through"}`}>{s.label}</span>
                  <IconButton className="!size-7" disabled={i === 0} onClick={() => moveSection(i, -1)} aria-label="Up">
                    <ArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton className="!size-7" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, 1)} aria-label="Down">
                    <ArrowDown className="size-3.5" />
                  </IconButton>
                  <Toggle size="sm" checked={s.enabled} onChange={(v) => set("sections", draft.sections.map((x) => (x.key === s.key ? { ...x, enabled: v } : x)))} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <p className="mt-3 text-xs text-[var(--a-muted)]">Hero always appears first.</p>
          </Card>
          <Card title="Marquee words">
            <StringList value={draft.marquee} onChange={(v) => set("marquee", v)} placeholder="Single origin" addLabel="Add word" />
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
