import { randomUUID } from 'expo-crypto';

export type IdGenerator = { next(): string };

export const uuidGenerator: IdGenerator = { next: () => randomUUID() };

export function sequentialIds(prefix = 'id'): IdGenerator {
  let n = 0;
  return { next: () => `${prefix}-${++n}` };
}
