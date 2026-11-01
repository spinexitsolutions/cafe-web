"use client";

import { Pencil, Plus, Quote, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, Drawer, EmptyState, Field, IconButton, ImageInput, Input, PageHeader, PageSkeleton, Textarea, Thumb, useConfirm } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Testimonial } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

export default function TestimonialsCMS() {
  const hydrated = useDB((s) => s.hydrated);
  const items = useDB((s) => s.testimonials);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [edit, setEdit] = useState<Testimonial | null>(null);
  const { confirm, node } = useConfirm();
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      {node}
      <PageHeader
        title="Testimonials"
        subtitle="Guest quotes shown in the homepage carousel."
        actions={
          <Button variant="primary" onClick={() => setEdit({ id: uid("t"), name: "", role: "", quote: "", avatar: "", rating: 5 })}>
            <Plus className="size-4" /> Add testimonial
          </Button>
        }
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState icon={<Quote className="size-5" />} title="No testimonials" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <Quote className="size-6 text-[var(--accent)]" />
              <p className="mt-3 flex-1 text-[15px] leading-relaxed">{t.quote}</p>
              <div className="mt-4 flex items-center gap-3">
                <Thumb src={t.avatar} className="size-10 !rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-[var(--a-muted)]">{t.role}</div>
                </div>
                <IconButton onClick={() => setEdit(t)} aria-label="Edit">
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  onClick={async () => {
                    if (await confirm("Delete testimonial?", `Quote from ${t.name} will be removed.`)) {
                      remove("testimonials", t.id);
                      toast("Deleted");
                    }
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Testimonial"
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.name.trim() || !edit.quote.trim()) return toast("Name and quote are required", "error");
                upsert("testimonials", edit);
                toast("Testimonial saved");
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
            <Field label="Quote">
              <Textarea value={edit.quote} onChange={(e) => setEdit({ ...edit, quote: e.target.value })} rows={4} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </Field>
              <Field label="Role / context">
                <Input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} />
              </Field>
            </div>
            <Field label="Rating">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setEdit({ ...edit, rating: n })}>
                    <Star className={cn("size-6", n <= edit.rating ? "fill-[#ffcc00] text-[#ffcc00]" : "text-black/15")} />
                  </button>
                ))}
              </div>
            </Field>
            <ImageInput label="Avatar" value={edit.avatar} onChange={(v) => setEdit({ ...edit, avatar: v })} aspect="aspect-square max-w-32" />
          </div>
        )}
      </Drawer>
    </div>
  );
}
