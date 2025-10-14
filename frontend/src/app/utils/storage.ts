// src/utils/storage.ts

type StorageType = "local" | "session";

export const storage = {
  get: <T>(key: string, type: StorageType = "local"): T | null => {
    if (typeof window === "undefined") return null;

    const store = type === "local" ? localStorage : sessionStorage;
    const value = store.getItem(key);

    if (!value || value === "undefined" || value === "null") return null;

    try {
      return JSON.parse(value) as T;
    } catch (err) {
      console.warn(`Failed to parse ${type}Storage key "${key}"`, err);
      return null;
    }
  },

  set: <T>(key: string, value: T, type: StorageType = "local") => {
    if (typeof window === "undefined") return;
    const store = type === "local" ? localStorage : sessionStorage;
    if (value === undefined || value === null) {
      store.removeItem(key);
    } else {
      store.setItem(key, JSON.stringify(value));
    }
  },

  remove: (key: string, type: StorageType = "local") => {
    if (typeof window === "undefined") return;
    const store = type === "local" ? localStorage : sessionStorage;
    store.removeItem(key);
  },
};
