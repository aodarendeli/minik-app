import type { ReactNode } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

import { type ColorToken, type TypeVariant } from '@minik/design-tokens';
import { useTheme } from '../theme/ThemeProvider';

export type TextProps = {
  children?: ReactNode;
  variant?: TypeVariant;
  color?: ColorToken;
  align?: 'start' | 'center' | 'end';
  numberOfLines?: number;
  uppercase?: boolean;
  testID?: string;
  accessibilityRole?: 'header' | 'text' | 'summary';
  accessibilityLabel?: string;
  /** Caps font scaling for fixed-height controls. */
  capScale?: boolean;
};

const alignMap = { start: 'left', center: 'center', end: 'right' } as const;

export function Text({
  children,
  variant = 'body',
  color = 'textPrimary',
  align,
  numberOfLines,
  uppercase,
  testID,
  accessibilityRole,
  accessibilityLabel,
  capScale,
}: TextProps) {
  const t = useTheme();
  const type = t.typography[variant];
  const style: TextStyle = {
    fontSize: type.fontSize,
    lineHeight: type.lineHeight,
    fontWeight: type.fontWeight,
    fontVariant: 'tabular' in type ? ['tabular-nums'] : undefined,
    color: t.colors[color],
    textAlign: align ? alignMap[align] : undefined,
    textTransform: uppercase ? 'uppercase' : undefined,
    letterSpacing: uppercase ? 0.5 : undefined,
  };
  return (
    <RNText
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      maxFontSizeMultiplier={capScale ? t.maxFontSizeMultiplier : undefined}>
      {children}
    </RNText>
  );
}
