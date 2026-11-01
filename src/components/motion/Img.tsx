"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Plain <img> with a soft fade-in once loaded (works with any CMS URL). */
export function Img({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      data-loaded={loaded}
      ref={(el) => {
        if (el?.complete && el.naturalWidth) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={cn("img-fade", className)}
    />
  );
}
