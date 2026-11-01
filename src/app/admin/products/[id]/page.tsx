"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { Button, Card, EmptyState, PageSkeleton } from "@/components/admin/ui";
import { useDB } from "@/store/db";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useDB((s) => s.hydrated);
  const product = useDB((s) => s.products.find((p) => p.id === id));
  if (!hydrated) return <PageSkeleton />;
  if (!product)
    return (
      <Card>
        <EmptyState title="Product not found" action={<Link href="/admin/products"><Button>Back to products</Button></Link>} />
      </Card>
    );
  return <ProductEditor key={product.id} initial={product} />;
}
