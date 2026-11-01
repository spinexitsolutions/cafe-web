"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdmin } from "@/store/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const authed = useAdmin((s) => s.authed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve(useAdmin.persist.rehydrate()).then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!authed && path !== "/admin/login") router.replace("/admin/login");
    if (authed && path === "/admin/login") router.replace("/admin");
  }, [ready, authed, path, router]);

  if (path === "/admin/login") return <div className="admin min-h-dvh">{children}</div>;
  if (!ready || !authed)
    return (
      <div className="admin grid min-h-dvh place-items-center">
        <div className="size-6 animate-spin rounded-full border-2 border-black/10 border-t-[var(--accent)]" />
      </div>
    );
  return <AdminShell>{children}</AdminShell>;
}
