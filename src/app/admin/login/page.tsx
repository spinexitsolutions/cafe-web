"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import { Lines, RollText, Rule } from "@/components/motion/Kit";
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
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        className="relative hidden overflow-hidden bg-[var(--ink)] lg:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(IMG.interiorBar, 1600)} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/20 to-transparent" />
        <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
          <span className="grid size-10 place-items-center rounded-[10px] bg-[var(--accent)]">
            <span className="display text-lg leading-none">A</span>
          </span>
          <span className="display text-xl uppercase">Aura®</span>
        </div>
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="display text-[clamp(2.4rem,4.6vw,4.6rem)] uppercase leading-[0.9]">
            <Lines text="Run the café" onMount delay={0.4} />
            <span className="block text-[#93a4ff]">
              <Lines text="from one place." onMount delay={0.55} />
            </span>
          </p>
          <div className="mt-6 h-px bg-white/20" />
          <p className="mt-4 grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
            <span>(01) Orders</span>
            <span>(02) CRM</span>
            <span>(03) CMS</span>
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--a-muted)]">
          <span>
            <span className="text-[var(--accent)]">(●)</span> Admin console
          </span>
          <a href="/" className="hover:text-[var(--a-ink)]">
            ← Back to site
          </a>
        </div>
        <div className="flex flex-1 items-center">
          <motion.form
            key={shake}
            onSubmit={submit}
            initial={shake ? { x: 0 } : { opacity: 0, y: 16 }}
            animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md py-12"
          >
            <Rule />
            <h1 className="display mt-6 text-[clamp(2.6rem,7vw,4.2rem)] uppercase">
              <Lines text="Sign" onMount /> <em><Lines text="in." onMount delay={0.1} /></em>
            </h1>
            <p className="mt-3 text-sm text-[var(--a-muted)]">Orders, reservations, customers and every word on the website.</p>

            <div className="mt-10 space-y-6">
              <label className="block">
                <span className="a-label text-[var(--a-muted)]">Email</span>
                <input className="mt-1 w-full border-b-2 border-[var(--a-line)] bg-transparent py-2.5 text-lg outline-none transition-colors focus:border-[var(--accent)]" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="username" />
              </label>
              <label className="block">
                <span className="a-label text-[var(--a-muted)]">Password</span>
                <input className="mt-1 w-full border-b-2 border-[var(--a-line)] bg-transparent py-2.5 text-lg outline-none transition-colors focus:border-[var(--accent)]" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button className="group mt-8 flex h-14 w-full items-center justify-between rounded-full bg-[var(--accent)] pl-6 pr-2 font-semibold text-white transition active:scale-[0.99]">
              <RollText>Continue</RollText>
              <span className="grid size-10 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
            <div className="mt-6 flex items-start gap-3 border-t border-[var(--a-line)] pt-4 text-sm">
              <Lock className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
              <div>
                <div className="font-semibold">Demo credentials</div>
                <div className="mt-0.5 text-[var(--a-muted)]">
                  {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
