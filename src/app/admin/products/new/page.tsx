"use client";

import { useState } from "react";
import { ProductEditor, blankProduct } from "@/components/admin/ProductEditor";
import { PageSkeleton } from "@/components/admin/ui";
import { useDB } from "@/store/db";

export default function NewProduct() {
  const hydrated = useDB((s) => s.hydrated);
  const [initial] = useState(() => blankProduct());
  if (!hydrated) return <PageSkeleton />;
  return <ProductEditor initial={initial} isNew />;
}
