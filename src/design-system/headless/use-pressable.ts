import type { AccessibilityRole, AccessibilityState } from 'react-native';

export type PressableA11yInput = {
  label: string;
  hint?: string;
  role?: AccessibilityRole;
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean;
  busy?: boolean;
};

/** Headless: accessibility props for anything pressable. No styles. */
export function usePressableA11y(input: PressableA11yInput) {
  const state: AccessibilityState = {
    disabled: input.disabled,
    selected: input.selected,
    checked: input.checked,
    busy: input.busy,
  };
  return {
    accessible: true,
    accessibilityRole: input.role ?? 'button',
    accessibilityLabel: input.label,
    accessibilityHint: input.hint,
    accessibilityState: state,
    disabled: input.disabled,
  };
}
