"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Field, PageHeader, PageSkeleton, SaveBar, StringList, Toggle, useDraft } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { IntroStyle, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Intro = Settings["intro"];

const STYLES: { id: IntroStyle; name: string; text: string }[] = [
  { id: "curtain", name: "Curtain", text: "Words cycle, then the screen lifts like a curtain." },
  { id: "counter", name: "Counter", text: "A 0→100 loader with a big counter and progress line." },
  { id: "minimal", name: "Minimal", text: "Logo fades in and dissolves. Quick and quiet." },
];

/** Small in-admin simulation of the intro so you can see changes before saving. */
function MiniPreview({ intro, run }: { intro: Intro; run: number }) {
  const theme = useDB((s) => s.settings.theme);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => {
    setI(0);
    setDone(false);
    setCount(0);
    const total = intro.duration * 1000;
    const words = Math.max(1, intro.words.length);
    const step = setInterval(() => setI((x) => Math.min(x + 1, words - 1)), total / words);
    const c = setInterval(() => setCount((x) => Math.min(100, x + 2)), total / 50);
    const t = setTimeout(() => setDone(true), total);
    return () => {
      clearInterval(step);
      clearInterval(c);
      clearTimeout(t);
    };
  }, [run, intro.duration, intro.words.length]);

  return (
    <div className="relative aspect-[9/14] overflow-hidden rounded-[10px] ring-1 ring-[var(--a-line)] sm:aspect-[4/3]" style={{ background: theme.background }}>
      <div className="absolute inset-0 grid place-items-center" style={{ color: theme.ink, fontFamily: "var(--font-display-active)" }}>
        <span className="display text-3xl uppercase">
          Coffee is <span style={{ color: theme.accent }}>a fruit.</span>
        </span>
      </div>
      <AnimatePresence>
        {!done && (
          <motion.div
            key={run}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: theme.ink, color: theme.background }}
            exit={intro.style === "curtain" ? { y: "-100%" } : { opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {intro.style === "counter" ? (
              <div className="absolute inset-x-6 bottom-6">
                <div className="text-6xl tabular-nums" style={{ fontFamily: "var(--font-display-active)" }}>{count}</div>
                <div className="mt-2 h-px w-full bg-white/20">
                  <div className="h-px" style={{ width: `${count}%`, background: theme.accent }} />
                </div>
              </div>
            ) : intro.style === "minimal" ? (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-5xl" style={{ fontFamily: "var(--font-display-active)" }}>
                aura
              </motion.span>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={i}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-5xl"
                  style={{ fontFamily: "var(--font-display-active)" }}
                >
                  {intro.words[i] ?? ""}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntroPage() {
  const hydrated = useDB((s) => s.hydrated);
  const intro = useDB((s) => s.settings.intro);
  const update = useDB((s) => s.updateSettings);
  const { draft, setDraft, dirty, reset } = useDraft<Intro>(intro);
  const [run, setRun] = useState(0);
  if (!hydrated) return <PageSkeleton />;
  const set = (p: Partial<Intro>) => setDraft((x) => ({ ...x, ...p }));

  return (
    <div>
      <PageHeader
        title="Intro animation"
        subtitle="The first thing visitors see when they land on the website."
        actions={
          <Button
            variant="dark"
            onClick={() => {
              if (dirty) {
                update("intro", draft);
                toast("Saved — opening preview");
              }
              try {
                sessionStorage.removeItem("aura-intro-seen");
              } catch {}
              window.open("/", "_blank");
            }}
          >
            <Play className="size-4" /> Preview on site
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <Toggle checked={draft.enabled} onChange={(v) => set({ enabled: v })} label="Show intro animation" description="Turn off to load the homepage straight away" />
            <div className="my-3 border-t border-[var(--a-line)]" />
            <Toggle checked={draft.oncePerSession} onChange={(v) => set({ oncePerSession: v })} label="Only once per visit" description="Don't replay when navigating back to the homepage" />
          </Card>
          <Card title="Style">
            <div className="grid gap-3 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => { set({ style: s.id }); setRun((r) => r + 1); }} className={cn("rounded-[10px] border p-4 text-left transition", draft.style === s.id ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]" : "border-[var(--a-line)] hover:border-[var(--ink)]")}>
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-1 text-xs text-[var(--a-muted)]">{s.text}</div>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Words" action={<span className="text-xs text-[var(--a-muted)]">Used by the curtain style</span>}>
            <StringList value={draft.words} onChange={(v) => set({ words: v })} placeholder="Brew." addLabel="Add word" />
          </Card>
          <Card title="Duration">
            <Field label={`${draft.duration.toFixed(1)} seconds`}>
              <input type="range" min={1} max={6} step={0.1} value={draft.duration} onChange={(e) => set({ duration: Number(e.target.value) })} onMouseUp={() => setRun((r) => r + 1)} onTouchEnd={() => setRun((r) => r + 1)} className="w-full accent-[var(--accent)]" />
            </Field>
          </Card>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card title="Preview" action={<Button size="sm" onClick={() => setRun((r) => r + 1)}><Play className="size-3.5" /> Replay</Button>}>
            {draft.enabled ? <MiniPreview intro={draft} run={run} /> : <div className="grid aspect-[4/3] place-items-center rounded-[10px] bg-[var(--a-line)] text-sm text-[var(--a-muted)]">Intro disabled</div>}
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty} onReset={reset} onSave={() => { update("intro", draft); toast("Intro animation saved"); }} />
    </div>
  );
}
