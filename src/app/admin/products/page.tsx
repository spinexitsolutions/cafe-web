"use client";

import { AlertTriangle, Package, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, PageHeader, PageSkeleton, SearchInput, Segmented, Select, Table, Td, Thumb, Toggle } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import { cn, money } from "@/lib/utils";

export default function ProductsPage() {
  const hydrated = useDB((s) => s.hydrated);
  const products = useDB((s) => s.products);
  const categories = useDB((s) => s.categories);
  const currency = useDB((s) => s.settings.site.currency);
  const upsert = useDB((s) => s.upsert);
  const router = useRouter();
  const [type, setType] = useState<"all" | "menu" | "shop">("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [stock, setStock] = useState("all");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (type === "all" || p.type === type) &&
        (cat === "all" || p.categoryId === cat) &&
        (stock === "all" || (stock === "low" ? p.stock > 0 && p.stock < 10 : stock === "out" ? p.stock === 0 : !p.active)) &&
        (!t || p.name.toLowerCase().includes(t) || p.tags.join(" ").includes(t)),
    );
  }, [products, type, cat, q, stock]);

  if (!hydrated) return <PageSkeleton />;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const lowCount = products.filter((p) => p.stock < 10).length;

  const stockCell = (n: number) =>
    n >= 999 ? (
      <span className="text-[var(--a-muted)]">∞</span>
    ) : n === 0 ? (
      <Badge tone="red">Out of stock</Badge>
    ) : n < 10 ? (
      <Badge tone="orange">{n} left</Badge>
    ) : (
      <span className="tabular-nums">{n}</span>
    );

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.filter((p) => p.type === "menu").length} menu items · ${products.filter((p) => p.type === "shop").length} shop products`}
        actions={
          <Link href="/admin/products/new">
            <Button variant="primary">
              <Plus className="size-4" /> Add product
            </Button>
          </Link>
        }
      />
      {lowCount > 0 && (
        <button onClick={() => setStock("low")} className="mb-4 flex w-full items-center gap-2 rounded-[8px] border border-[#b0861f]/30 bg-[#b0861f]/[0.07] px-4 py-3 text-left text-sm font-semibold text-[#6b5013]">
          <AlertTriangle className="size-4" /> {lowCount} products are low or out of stock — review inventory
        </button>
      )}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented value={type} onChange={(v) => { setType(v); setCat("all"); }} options={[{ value: "all", label: "All" }, { value: "menu", label: "Café menu" }, { value: "shop", label: "Shop" }]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search products or tags" className="lg:w-72" />
        <div className="flex gap-2">
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="!w-auto" options={[{ value: "all", label: "All categories" }, ...categories.filter((c) => type === "all" || c.type === type).map((c) => ({ value: c.id, label: c.name }))]} />
          <Select value={stock} onChange={(e) => setStock(e.target.value)} className="!w-auto" options={[{ value: "all", label: "Any stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Out of stock" }, { value: "hidden", label: "Hidden" }]} />
        </div>
      </div>
      <Card pad={false}>
        {list.length === 0 ? (
          <EmptyState icon={<Package className="size-5" />} title="No products found" />
        ) : (
          <>
            <Table head={["Product", "Category", "Price", "Stock", "Featured", "Visible", ""]}>
              {list.map((p) => (
                <tr key={p.id} className={cn("transition hover:bg-[var(--accent)]/[0.02]", !p.active && "opacity-55")}>
                  <Td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <Thumb src={p.image} className="size-11" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="flex gap-1 pt-0.5">
                          {p.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[11px] text-[var(--a-muted)]">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </Td>
                  <Td className="text-[var(--a-muted)]">
                    {catName(p.categoryId)} <Badge className="ml-1">{p.type}</Badge>
                  </Td>
                  <Td className="tabular-nums">
                    {money(p.price, currency)}
                    {p.comparePrice && <span className="ml-1.5 text-xs text-[var(--a-muted)] line-through">{money(p.comparePrice, currency)}</span>}
                  </Td>
                  <Td>{stockCell(p.stock)}</Td>
                  <Td>
                    <button onClick={() => { upsert("products", { ...p, featured: !p.featured }); toast(p.featured ? "Removed from featured" : "Marked as featured"); }} aria-label="Toggle featured">
                      <Star className={cn("size-5 transition", p.featured ? "fill-[#ffcc00] text-[#ffcc00]" : "text-black/20 hover:text-black/40")} />
                    </button>
                  </Td>
                  <Td>
                    <Toggle size="sm" checked={p.active} onChange={(v) => { upsert("products", { ...p, active: v }); toast(v ? "Product visible" : "Product hidden"); }} />
                  </Td>
                  <Td className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/products/${p.id}`)}>
                      Edit
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
            <div className="divide-y divide-[var(--a-line)] md:hidden">
              {list.map((p) => (
                <div key={p.id} className={cn("flex items-center gap-3 px-4 py-3", !p.active && "opacity-55")}>
                  <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Thumb src={p.image} className="size-14" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--a-muted)]">
                        {money(p.price, currency)} · {catName(p.categoryId)}
                      </div>
                      <div className="mt-1">{stockCell(p.stock)}</div>
                    </div>
                  </Link>
                  <Toggle size="sm" checked={p.active} onChange={(v) => upsert("products", { ...p, active: v })} />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
