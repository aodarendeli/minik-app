import { memoryStorage, type KeyValueStorage } from '@/core/storage/key-value';

import { DEFAULT_SETTINGS, type Settings, type SettingsRepository } from '../domain';

export class LocalSettingsRepository implements SettingsRepository {
  constructor(
    private readonly storage: KeyValueStorage = memoryStorage(),
    private readonly key = 'settings',
  ) {}

  async get(): Promise<Settings> {
    const raw = this.storage.getItem(this.key);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async save(settings: Settings) {
    this.storage.setItem(this.key, JSON.stringify(settings));
  }
}
