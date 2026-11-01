"use client";

import { Check, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, EmptyState, PageHeader, PageSkeleton, Segmented, Thumb } from "@/components/admin/ui";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import { cn, timeAgo } from "@/lib/utils";

export default function ReviewsPage() {
  const hydrated = useDB((s) => s.hydrated);
  const reviews = useDB((s) => s.reviews);
  const products = useDB((s) => s.products);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  if (!hydrated) return <PageSkeleton />;
  const list = reviews.filter((r) => tab === "all" || (tab === "pending" ? !r.approved : r.approved));
  const avg = reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews · ${avg.toFixed(1)} average`} />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-4"
        options={[
          { value: "pending", label: `Awaiting approval ${reviews.filter((r) => !r.approved).length}` },
          { value: "approved", label: "Published" },
          { value: "all", label: "All" },
        ]}
      />
      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Star className="size-5" />} title={tab === "pending" ? "Nothing to moderate" : "No reviews"} text="New reviews from product pages land here first." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return (
              <Card key={r.id}>
                <div className="flex items-center gap-3">
                  <Thumb src={p?.image} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <Link href={p ? `/admin/products/${p.id}` : "#"} className="truncate text-sm font-medium hover:text-[var(--accent)]">
                      {p?.name ?? "Deleted product"}
                    </Link>
                    <div className="text-xs text-[var(--a-muted)]">
                      {r.name} · {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-[#ffcc00] text-[#ffcc00]" : "text-black/15")} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed">“{r.text}”</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="danger" onClick={() => { remove("reviews", r.id); toast("Review deleted"); }}>
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                  {r.approved ? (
                    <Button size="sm" onClick={() => { upsert("reviews", { ...r, approved: false }); toast("Review unpublished"); }}>
                      Unpublish
                    </Button>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => { upsert("reviews", { ...r, approved: true }); toast("Review published"); }}>
                      <Check className="size-3.5" /> Approve
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
