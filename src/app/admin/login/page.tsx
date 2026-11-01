"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ADMIN, useAdmin } from "@/store/admin";
import { IMG, img } from "@/lib/seed";

export default function LoginPage() {
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const login = useAdmin((s) => s.login);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) router.replace("/admin");
    else {
      setError("Incorrect email or password");
      setShake((n) => n + 1);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(IMG.interiorBar, 1600)} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="font-[family-name:var(--font-display-active)] text-5xl leading-[1.05]">
            Run the whole café <em>from one calm place.</em>
          </p>
          <p className="mt-4 max-w-md text-sm text-white/70">Orders, reservations, customers, menu and every word on the website — all managed here.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <motion.form
          key={shake}
          onSubmit={submit}
          initial={shake ? { x: 0 } : { opacity: 0, y: 16 }}
          animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 grid size-14 place-items-center rounded-2xl bg-[var(--accent)] font-[family-name:var(--font-display-active)] text-3xl text-white shadow-lg">a</div>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in to Aura</h1>
          <p className="mt-1.5 text-sm text-[var(--a-muted)]">Admin console · CRM · CMS</p>

          <div className="mt-8 space-y-3">
            <input className="a-input !h-12 !rounded-xl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="username" />
            <input className="a-input !h-12 !rounded-xl" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] font-medium text-white transition hover:bg-black active:scale-[0.99]">
            Continue <ArrowRight className="size-4" />
          </button>
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-black/5">
            <Lock className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
            <div>
              <div className="font-medium">Demo credentials</div>
              <div className="mt-0.5 text-[var(--a-muted)]">
                {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
