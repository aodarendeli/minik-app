import { SymbolView } from 'expo-symbols';

import { type ColorToken, type IconSize } from '@minik/design-tokens';
import { useTheme } from '../theme/ThemeProvider';
import { iconRegistry, type IconName } from './icons';

export type IconProps = {
  name: IconName;
  size?: IconSize;
  color?: ColorToken;
  /** Design-system internal: an exact token value (e.g. a palette preview), overrides `color`. */
  rawColor?: string;
  /** Decorative icons are hidden from screen readers; pass a label to make the icon meaningful. */
  accessibilityLabel?: string;
};

export function Icon({ name, size = 'lg', color = 'textPrimary', rawColor, accessibilityLabel }: IconProps) {
  const t = useTheme();
  const entry = iconRegistry[name];
  const px = t.size.icon[size];
  return (
    <SymbolView
      name={{ ios: entry.ios, android: entry.android, web: entry.android }}
      size={px}
      tintColor={rawColor ?? t.colors[color]}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}
