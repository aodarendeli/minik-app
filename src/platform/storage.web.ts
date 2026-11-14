import type { KeyValueStorage } from '@/core/storage/key-value';

/** Web fallback: browser localStorage (expo-sqlite on web needs extra server headers). */
export const deviceStorage: KeyValueStorage = {
  getItem: (key) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key, value) => globalThis.localStorage?.setItem(key, value),
  removeItem: (key) => globalThis.localStorage?.removeItem(key),
};
