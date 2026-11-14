import Storage from 'expo-sqlite/kv-store';

import type { KeyValueStorage } from '@/core/storage/key-value';

/** SQLite-backed key-value store (works in Expo Go and dev builds). Not encrypted yet — see DECISIONS.md. */
export const deviceStorage: KeyValueStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};
