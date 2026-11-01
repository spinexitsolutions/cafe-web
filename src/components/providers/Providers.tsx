"use client";

import { useEffect } from "react";
import { useDB } from "@/store/db";
import { useCart } from "@/store/cart";

const FONT_VAR = {
  bricolage: "var(--font-bricolage)",
  funnel: "var(--font-funnel-display)",
  unbounded: "var(--font-unbounded)",
} as const;

/** Applies CMS theme settings as CSS variables on <html>. */
function ThemeApplier() {
  const theme = useDB((s) => s.settings.theme);
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", theme.accent);
    r.setProperty("--bg", theme.background);
    r.setProperty("--ink", theme.ink);
    r.setProperty("--surface", theme.surface);
    r.setProperty("--radius", `${theme.radius}px`);
    r.setProperty("--font-display-active", FONT_VAR[theme.displayFont] ?? FONT_VAR.bricolage);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.background);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Promise.resolve(useDB.persist.rehydrate()).then(() => useDB.getState().setHydrated());
    useCart.persist.rehydrate();
  }, []);
  return (
    <>
      <ThemeApplier />
      {children}
    </>
  );
}
