import { createDepsContext } from '@/core/di';

import type { SettingsUseCases } from '../domain';

export type SettingsDepsValue = SettingsUseCases & {
  /** Wipes all locally stored data; resolves to an `undo` for the snackbar window. */
  clearAllData: () => Promise<() => Promise<void>>;
  /** Development only: loads sample data. */
  loadDemoData: () => void;
  /** App version shown in About (from the native build config). */
  appVersion: string;
  /** Support address shown in the legal texts. */
  supportEmail: string;
};

export const SettingsDeps = createDepsContext<SettingsDepsValue>('settings');
