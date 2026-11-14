import { useState } from 'react';

/** Headless: supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage. */
export function useControllableState<T>(opts: { value?: T; defaultValue: T; onChange?: (next: T) => void }) {
  const [inner, setInner] = useState(opts.defaultValue);
  const controlled = opts.value !== undefined;
  const value = controlled ? (opts.value as T) : inner;
  const setValue = (next: T) => {
    if (!controlled) setInner(next);
    opts.onChange?.(next);
  };
  return [value, setValue] as const;
}
