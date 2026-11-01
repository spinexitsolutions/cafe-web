import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * localStorage wrapper that ignores writes until the store has rehydrated.
 * Without this, any state update that runs before rehydration (e.g. closing
 * the cart drawer on mount) would overwrite the saved data with defaults.
 */
export function guardedStorage() {
  let ready = false;
  const raw: StateStorage = {
    getItem: (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k, v) => {
      if (!ready) return;
      try {
        localStorage.setItem(k, v);
      } catch {}
    },
    removeItem: (k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    },
  };
  return {
    storage: createJSONStorage(() => raw),
    onRehydrateStorage: () => () => {
      ready = true;
    },
  };
}
