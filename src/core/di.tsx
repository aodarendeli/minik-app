import { createContext, use, type ReactNode } from 'react';

/**
 * Typed dependency context. Each feature exposes one so presentation receives use-cases
 * from the composition root without importing data/platform code.
 */
export function createDepsContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    return <Context value={value}>{children}</Context>;
  }

  function useDeps(): T {
    const value = use(Context);
    if (value === null) throw new Error(`${name} dependencies are not provided`);
    return value;
  }

  return { Provider, useDeps };
}
