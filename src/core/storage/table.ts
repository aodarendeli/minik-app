import type { KeyValueStorage } from './key-value';

/**
 * A persisted collection of rows keyed by `id`, stored as one JSON document per table.
 * Interim design (see DECISIONS.md): simple and Expo Go compatible; move to real SQLite tables when data grows.
 * The seed runs only when the key has never been written (first launch).
 */
export class Table<T extends { id: string }> {
  private rows = new Map<string, T>();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
    seed: () => readonly T[] = () => [],
  ) {
    const raw = storage.getItem(key);
    if (raw === null) {
      seed().forEach((row) => this.rows.set(row.id, row));
      this.save();
      return;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('not an array');
      (parsed as T[]).filter((r) => typeof r?.id === 'string').forEach((row) => this.rows.set(row.id, row));
    } catch {
      // Keep the unreadable payload for diagnosis instead of silently losing it.
      storage.setItem(`${key}.corrupt`, raw);
      this.save();
    }
  }

  values(): T[] {
    return [...this.rows.values()];
  }

  get(id: string): T | undefined {
    return this.rows.get(id);
  }

  has(id: string): boolean {
    return this.rows.has(id);
  }

  put(row: T): void {
    this.rows.set(row.id, row);
    this.save();
  }

  delete(id: string): void {
    if (this.rows.delete(id)) this.save();
  }

  /** Upserts many rows with a single write. */
  putMany(rows: readonly T[]): void {
    rows.forEach((row) => this.rows.set(row.id, row));
    this.save();
  }

  /** Removes every row matching `predicate` with a single write; returns the removed rows. */
  removeWhere(predicate: (row: T) => boolean): T[] {
    const removed = this.values().filter(predicate);
    if (removed.length === 0) return removed;
    removed.forEach((row) => this.rows.delete(row.id));
    this.save();
    return removed;
  }

  clear(): void {
    this.rows.clear();
    this.save();
  }

  private save(): void {
    this.storage.setItem(this.key, JSON.stringify(this.values()));
  }
}
