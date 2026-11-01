"use client";

import { ArrowDown, ArrowUp, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, IconButton, Input, PageHeader, PageSkeleton, Segmented, Select, useConfirm } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { CatalogType, Category } from "@/lib/types";
import { slugify, uid } from "@/lib/utils";

export default function CategoriesPage() {
  const hydrated = useDB((s) => s.hydrated);
  const categories = useDB((s) => s.categories);
  const products = useDB((s) => s.products);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [type, setType] = useState<CatalogType>("menu");
  const [edit, setEdit] = useState<Category | null>(null);
  const { confirm, node } = useConfirm();

  if (!hydrated) return <PageSkeleton />;
  const list = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);

  const swap = (i: number, j: number) => {
    const a = list[i];
    const b = list[j];
    if (!a || !b) return;
    upsert("categories", { ...a, order: b.order });
    upsert("categories", { ...b, order: a.order });
  };

  return (
    <div>
      {node}
      <PageHeader
        title="Categories"
        subtitle="Group your menu and shop. Order here = order on the website."
        actions={
          <Button variant="primary" onClick={() => setEdit({ id: uid("c-"), name: "", slug: "", type, order: (list.at(-1)?.order ?? 0) + 1 })}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />
      <Segmented value={type} onChange={setType} className="mb-4" options={[{ value: "menu", label: "Café menu" }, { value: "shop", label: "Shop" }]} />
      <Card pad={false}>
        {list.length === 0 ? (
          <EmptyState icon={<Layers className="size-5" />} title="No categories yet" />
        ) : (
          <div className="divide-y divide-[var(--a-line)]">
            {list.map((c, i) => {
              const count = products.filter((p) => p.categoryId === c.id).length;
              return (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex flex-col">
                    <IconButton className="!size-6" disabled={i === 0} onClick={() => swap(i, i - 1)} aria-label="Up">
                      <ArrowUp className="size-3.5" />
                    </IconButton>
                    <IconButton className="!size-6" disabled={i === list.length - 1} onClick={() => swap(i, i + 1)} aria-label="Down">
                      <ArrowDown className="size-3.5" />
                    </IconButton>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-[var(--a-muted)]">/{c.slug}</div>
                  </div>
                  <Badge>{count} products</Badge>
                  <IconButton onClick={() => setEdit(c)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={async () => {
                      if (count > 0) return toast("Move or delete its products first", "error");
                      if (await confirm("Delete category?", `“${c.name}” will be removed.`)) {
                        remove("categories", c.id);
                        toast("Category deleted");
                      }
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit && categories.some((c) => c.id === edit.id) ? "Edit category" : "New category"}
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.name.trim()) return toast("Name is required", "error");
                upsert("categories", { ...edit, slug: edit.slug || slugify(edit.name) });
                toast("Category saved");
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
            <Field label="Name">
              <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: slugify(e.target.value) })} autoFocus />
            </Field>
            <Field label="Slug">
              <Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
            </Field>
            <Field label="Type">
              <Select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as CatalogType })} options={[{ value: "menu", label: "Café menu" }, { value: "shop", label: "Shop" }]} />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
