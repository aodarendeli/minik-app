import type { ReactNode } from 'react';
import { View, type AccessibilityRole, type ViewStyle } from 'react-native';

import { type ColorToken, type RadiusToken, type SpaceToken } from '@minik/design-tokens';
import { useTheme } from '../theme/ThemeProvider';

const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' } as const;
const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} as const;

export type BoxProps = {
  children?: ReactNode;
  direction?: 'row' | 'column';
  gap?: SpaceToken;
  padding?: SpaceToken;
  paddingX?: SpaceToken;
  paddingY?: SpaceToken;
  paddingTop?: SpaceToken;
  paddingBottom?: SpaceToken;
  marginTop?: SpaceToken;
  bg?: ColorToken;
  radius?: RadiusToken;
  borderColor?: ColorToken;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  wrap?: boolean;
  flex?: boolean;
  shrink?: boolean;
  fullWidth?: boolean;
  clip?: boolean;
  testID?: string;
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
};

/** Layout primitive. All values are token keys; there is no style escape hatch outside the design system. */
export function Box(props: BoxProps) {
  const t = useTheme();
  const s = (k?: SpaceToken) => (k === undefined ? undefined : t.space[k]);
  const style: ViewStyle = {
    flexDirection: props.direction,
    gap: s(props.gap),
    padding: s(props.padding),
    paddingHorizontal: s(props.paddingX),
    paddingVertical: s(props.paddingY),
    paddingTop: s(props.paddingTop),
    paddingBottom: s(props.paddingBottom),
    marginTop: s(props.marginTop),
    backgroundColor: props.bg ? t.colors[props.bg] : undefined,
    borderRadius: props.radius ? t.radius[props.radius] : undefined,
    borderWidth: props.borderColor ? t.size.hairline : undefined,
    borderColor: props.borderColor ? t.colors[props.borderColor] : undefined,
    alignItems: props.align ? alignMap[props.align] : undefined,
    justifyContent: props.justify ? justifyMap[props.justify] : undefined,
    flexWrap: props.wrap ? 'wrap' : undefined,
    flex: props.flex ? 1 : undefined,
    flexShrink: props.shrink ? 1 : undefined,
    minWidth: props.shrink ? 0 : undefined,
    alignSelf: props.fullWidth ? 'stretch' : undefined,
    overflow: props.clip ? 'hidden' : undefined,
  };
  return (
    <View
      style={style}
      testID={props.testID}
      accessible={props.accessible}
      accessibilityRole={props.accessibilityRole}
      accessibilityLabel={props.accessibilityLabel}>
      {props.children}
    </View>
  );
}

export type StackProps = Omit<BoxProps, 'direction'>;

/** Vertical layout. */
export function Stack(props: StackProps) {
  return <Box direction="column" {...props} />;
}

/** Horizontal layout; vertically centered by default. */
export function Inline(props: StackProps) {
  return <Box direction="row" align="center" {...props} />;
}

/** Fills remaining space in a row or column. */
export function Spacer() {
  return <Box flex />;
}
