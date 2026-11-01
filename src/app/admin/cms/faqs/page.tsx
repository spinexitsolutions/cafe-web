"use client";

import { Reorder } from "framer-motion";
import { GripVertical, HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, Drawer, EmptyState, Field, IconButton, Input, PageHeader, PageSkeleton, Textarea } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Faq } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function FaqsCMS() {
  const hydrated = useDB((s) => s.hydrated);
  const faqs = useDB((s) => s.faqs);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const reorder = useDB((s) => s.reorder);
  const [edit, setEdit] = useState<Faq | null>(null);
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        title="FAQs"
        subtitle="Answers shown on the contact page."
        actions={
          <Button variant="primary" onClick={() => setEdit({ id: uid("f"), q: "", a: "" })}>
            <Plus className="size-4" /> Add question
          </Button>
        }
      />
      {faqs.length === 0 ? (
        <Card>
          <EmptyState icon={<HelpCircle className="size-5" />} title="No FAQs" />
        </Card>
      ) : (
        <Reorder.Group axis="y" values={faqs} onReorder={(v) => reorder("faqs", v.map((x) => x.id))} className="space-y-2">
          {faqs.map((f) => (
            <Reorder.Item key={f.id} value={f} className="flex items-start gap-3 rounded-2xl border border-[var(--a-line)] bg-white p-4">
              <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-black/25" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{f.q}</div>
                <div className="mt-1 line-clamp-2 text-sm text-[var(--a-muted)]">{f.a}</div>
              </div>
              <IconButton onClick={() => setEdit(f)} aria-label="Edit">
                <Pencil className="size-4" />
              </IconButton>
              <IconButton onClick={() => { remove("faqs", f.id); toast("FAQ removed"); }} aria-label="Delete">
                <Trash2 className="size-4" />
              </IconButton>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="FAQ"
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.q.trim() || !edit.a.trim()) return toast("Question and answer are required", "error");
                upsert("faqs", edit);
                toast("FAQ saved");
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
            <Field label="Question">
              <Input value={edit.q} onChange={(e) => setEdit({ ...edit, q: e.target.value })} />
            </Field>
            <Field label="Answer">
              <Textarea value={edit.a} onChange={(e) => setEdit({ ...edit, a: e.target.value })} rows={5} />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
