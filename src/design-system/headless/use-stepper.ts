export type StepperOptions = { value: number; onChange: (next: number) => void; step: number; min: number; max: number };

export function clampStep(value: number, delta: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value + delta));
}

/** Headless: increment/decrement logic with bounds. */
export function useStepper({ value, onChange, step, min, max }: StepperOptions) {
  return {
    value,
    canDecrement: value - step >= min,
    canIncrement: value + step <= max,
    decrement: () => onChange(clampStep(value, -step, min, max)),
    increment: () => onChange(clampStep(value, step, min, max)),
  };
}
