"use client";

import { ArrowLeft, Copy, ExternalLink, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, ChipsInput, Field, IconButton, ImageInput, Input, PageHeader, Select, StringList, Textarea, Toggle, useConfirm } from "./ui";
import { toast } from "./toast";
import { useDB } from "@/store/db";
import type { Product, VariantGroup } from "@/lib/types";
import { slugify, uid } from "@/lib/utils";

const TAGS = ["bestseller", "new", "vegan", "seasonal", "signature", "gluten-free"];

export function blankProduct(categoryId = "c-espresso"): Product {
  return {
    id: uid("p-"),
    slug: "",
    name: "",
    type: "menu",
    categoryId,
    price: 0,
    description: "",
    longDescription: "",
    image: "",
    gallery: [],
    tags: [],
    stock: 999,
    featured: false,
    active: true,
    rating: 5,
    reviewCount: 0,
    variants: [],
    createdAt: new Date().toISOString(),
  };
}

export function ProductEditor({ initial, isNew }: { initial: Product; isNew?: boolean }) {
  const [p, setP] = useState<Product>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const categories = useDB((s) => s.categories);
  const products = useDB((s) => s.products);
  const currency = useDB((s) => s.settings.site.currency);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const router = useRouter();
  const { confirm, node } = useConfirm();

  useEffect(() => setP(initial), [initial]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const cats = categories.filter((c) => c.type === p.type).sort((a, b) => a.order - b.order);

  const save = () => {
    if (!p.name.trim()) return toast("Give the product a name", "error");
    const slug = p.slug || slugify(p.name);
    if (products.some((x) => x.slug === slug && x.id !== p.id)) return toast("That URL slug is already used", "error");
    upsert("products", { ...p, slug });
    toast(isNew ? "Product created" : "Product saved");
    if (isNew) router.replace(`/admin/products/${p.id}`);
  };

  const setGroup = (i: number, g: VariantGroup) => set("variants", p.variants.map((x, j) => (j === i ? g : x)));

  return (
    <div>
      {node}
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--a-muted)] hover:text-[var(--a-ink)]">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <PageHeader
        title={isNew ? "New product" : p.name || "Untitled"}
        subtitle={!isNew && `/${p.type === "shop" ? "product" : "product"}/${p.slug}`}
        actions={
          <>
            {!isNew && (
              <>
                <a href={`/product/${p.slug}`} target="_blank">
                  <Button>
                    <ExternalLink className="size-4" /> View
                  </Button>
                </a>
                <Button
                  onClick={() => {
                    const copy = { ...p, id: uid("p-"), name: `${p.name} (copy)`, slug: `${p.slug}-copy-${Date.now().toString(36).slice(-3)}`, createdAt: new Date().toISOString() };
                    upsert("products", copy);
                    toast("Product duplicated");
                    router.push(`/admin/products/${copy.id}`);
                  }}
                >
                  <Copy className="size-4" /> Duplicate
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (await confirm("Delete product?", `“${p.name}” will be removed from the menu and shop.`)) {
                      remove("products", p.id);
                      toast("Product deleted");
                      router.replace("/admin/products");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
            <Button variant="primary" onClick={save}>
              {isNew ? "Create product" : "Save changes"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input
                  value={p.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setP((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugify(name) }));
                  }}
                  placeholder="e.g. Honey Cinnamon Latte"
                />
              </Field>
              <Field label="URL slug" hint={`/product/${p.slug || "…"}`}>
                <Input
                  value={p.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Type">
                <Select
                  value={p.type}
                  onChange={(e) => {
                    const type = e.target.value as Product["type"];
                    const first = categories.find((c) => c.type === type);
                    setP((x) => ({ ...x, type, categoryId: first?.id ?? x.categoryId }));
                  }}
                  options={[{ value: "menu", label: "Café menu item" }, { value: "shop", label: "Shop product" }]}
                />
              </Field>
              <Field label="Short description" className="sm:col-span-2">
                <Input value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="One line shown on cards" />
              </Field>
              <Field label="Long description" className="sm:col-span-2">
                <Textarea value={p.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={4} />
              </Field>
              <Field label="Tasting notes / origin">
                <Input value={p.notes ?? ""} onChange={(e) => set("notes", e.target.value || undefined)} placeholder="Cocoa · Hazelnut · Honey" />
              </Field>
              <Field label="Calories">
                <Input type="number" value={p.calories ?? ""} onChange={(e) => set("calories", e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
            </div>
          </Card>

          <Card title="Media">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageInput label="Main image" value={p.image} onChange={(v) => set("image", v)} />
              <div>
                <div className="mb-1.5 text-[13px] font-medium text-[var(--a-muted)]">Gallery images</div>
                <StringList value={p.gallery} onChange={(v) => set("gallery", v)} placeholder="https://…" addLabel="Add image" />
              </div>
            </div>
          </Card>

          <Card
            title="Variants & add-ons"
            action={
              <Button size="sm" onClick={() => set("variants", [...p.variants, { id: uid("v-"), name: "New option", options: [{ id: uid("o-"), label: "Option", priceDelta: 0 }] }])}>
                <Plus className="size-3.5" /> Add group
              </Button>
            }
          >
            {p.variants.length === 0 && <p className="text-sm text-[var(--a-muted)]">No variants. Add groups like Size, Milk or Grind — each option can change the price.</p>}
            <div className="space-y-4">
              {p.variants.map((g, gi) => (
                <div key={g.id} className="rounded-[8px] border border-[var(--a-line)] p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <Input value={g.name} onChange={(e) => setGroup(gi, { ...g, name: e.target.value })} className="font-medium" />
                    <IconButton onClick={() => set("variants", p.variants.filter((_, j) => j !== gi))} aria-label="Remove group">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                  <div className="space-y-2">
                    {g.options.map((o, oi) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <Input value={o.label} onChange={(e) => setGroup(gi, { ...g, options: g.options.map((x, j) => (j === oi ? { ...x, label: e.target.value } : x)) })} placeholder="Label" />
                        <div className="relative w-32 shrink-0">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--a-muted)]">+{currency}</span>
                          <Input type="number" className="!pl-9" value={o.priceDelta} onChange={(e) => setGroup(gi, { ...g, options: g.options.map((x, j) => (j === oi ? { ...x, priceDelta: Number(e.target.value) } : x)) })} />
                        </div>
                        <IconButton disabled={g.options.length < 2} onClick={() => setGroup(gi, { ...g, options: g.options.filter((_, j) => j !== oi) })} aria-label="Remove option">
                          <X className="size-4" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => setGroup(gi, { ...g, options: [...g.options, { id: uid("o-"), label: "", priceDelta: 0 }] })}>
                    <Plus className="size-3.5" /> Option
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Visibility">
            <Toggle checked={p.active} onChange={(v) => set("active", v)} label="Visible on site" description="Hidden products can't be ordered" />
            <div className="my-3 border-t border-[var(--a-line)]" />
            <Toggle checked={p.featured} onChange={(v) => set("featured", v)} label="Featured" description="Shown on the homepage" />
          </Card>
          <Card title="Pricing & stock">
            <div className="space-y-4">
              <Field label={`Price (${currency})`}>
                <Input type="number" value={p.price} onChange={(e) => set("price", Number(e.target.value))} />
              </Field>
              <Field label="Compare-at price" hint="Shows a strike-through sale price">
                <Input type="number" value={p.comparePrice ?? ""} onChange={(e) => set("comparePrice", e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
              <Field label="Stock" hint="Use 999 for unlimited (made to order)">
                <Input type="number" value={p.stock} onChange={(e) => set("stock", Number(e.target.value))} />
              </Field>
            </div>
          </Card>
          <Card title="Organisation">
            <div className="space-y-4">
              <Field label="Category">
                <Select value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)} options={cats.map((c) => ({ value: c.id, label: c.name }))} />
              </Field>
              <Field label="Tags">
                <ChipsInput value={p.tags} onChange={(v) => set("tags", v)} suggestions={TAGS} />
              </Field>
            </div>
          </Card>
          <Card title="Ratings">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating">
                <Input type="number" step="0.1" min={0} max={5} value={p.rating} onChange={(e) => set("rating", Number(e.target.value))} />
              </Field>
              <Field label="Reviews">
                <Input type="number" value={p.reviewCount} onChange={(e) => set("reviewCount", Number(e.target.value))} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
