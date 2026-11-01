"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const DEMO_ADMIN = { email: "admin@aura.cafe", password: "aura123" };

interface AdminState {
  authed: boolean;
  email: string | null;
  ready: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setReady: () => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      authed: false,
      email: null,
      ready: false,
      login: (email, password) => {
        const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
        if (ok) set({ authed: true, email: email.trim().toLowerCase() });
        return ok;
      },
      logout: () => set({ authed: false, email: null }),
      setReady: () => set({ ready: true }),
    }),
    {
      name: "aura-admin-v1",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({ authed: s.authed, email: s.email }) as AdminState,
    },
  ),
);
