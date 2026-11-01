"use client";

import { Reorder } from "framer-motion";
import { Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, IconButton, ImageInput, Input, PageHeader, PageSkeleton, Segmented, Thumb } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { GalleryItem } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function GalleryCMS() {
  const hydrated = useDB((s) => s.hydrated);
  const items = useDB((s) => s.gallery);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const reorder = useDB((s) => s.reorder);
  const [edit, setEdit] = useState<GalleryItem | null>(null);
  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Photos for the homepage mosaic. Drag to reorder."
        actions={
          <Button variant="primary" onClick={() => setEdit({ id: uid("g"), image: "", caption: "", span: "square" })}>
            <Plus className="size-4" /> Add photo
          </Button>
        }
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState icon={<ImageIcon className="size-5" />} title="No photos" />
        </Card>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={(v) => reorder("gallery", v.map((x) => x.id))} className="grid gap-3 sm:grid-cols-2">
          {items.map((g) => (
            <Reorder.Item key={g.id} value={g} className="flex cursor-grab items-center gap-3 rounded-[10px] border border-[var(--a-line)] bg-white p-2 active:cursor-grabbing">
              <Thumb src={g.image} className="aspect-[4/3] w-28" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{g.caption || "No caption"}</div>
                <Badge className="mt-1">{g.span}</Badge>
              </div>
              <IconButton onClick={() => setEdit(g)} aria-label="Edit">
                <Pencil className="size-4" />
              </IconButton>
              <IconButton onClick={() => { remove("gallery", g.id); toast("Photo removed"); }} aria-label="Delete">
                <Trash2 className="size-4" />
              </IconButton>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Photo"
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.image.trim()) return toast("Image URL is required", "error");
                upsert("gallery", edit);
                toast("Photo saved");
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
            <ImageInput value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
            <Field label="Caption">
              <Input value={edit.caption} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} />
            </Field>
            <Field label="Tile shape">
              <Segmented value={edit.span} onChange={(v) => setEdit({ ...edit, span: v })} options={[{ value: "square", label: "Square" }, { value: "tall", label: "Tall" }, { value: "wide", label: "Wide" }]} />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
