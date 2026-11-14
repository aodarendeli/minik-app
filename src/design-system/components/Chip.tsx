import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type ChipProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  tone?: Tone;
  icon?: IconName;
  testID?: string;
};

/** Selectable pill. Selection is shown with fill AND a check icon (never color alone). */
export function Chip({ label, onPress, selected = false, tone = 'brand', icon, testID }: ChipProps) {
  const t = useTheme();
  const c = tones[tone];
  const a11y = usePressableA11y({ label, selected, role: 'button' });
  const fg = selected ? c.onSolid : 'textPrimary';
  const leading = selected ? 'check' : icon;
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: t.size.touchTarget,
        paddingHorizontal: t.space.lg,
        borderRadius: t.radius.pill,
        justifyContent: 'center',
        maxWidth: '100%',
        backgroundColor: t.colors[selected ? c.solid : 'surface'],
        borderWidth: t.size.hairline,
        borderColor: t.colors[selected ? c.solid : 'borderDefault'],
        opacity: pressed ? t.opacity.pressed : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.xs, flexShrink: 1 }}>
        {leading ? <Icon name={leading} size="sm" color={fg} /> : null}
        <Text variant="label" color={fg} capScale numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

/** Wrapping row of chips. */
export function ChipGroup({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>{children}</View>;
}
