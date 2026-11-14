import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type ActionTileProps = {
  icon: IconName;
  label: string;
  caption?: string;
  tone: Tone;
  onPress: () => void;
  active?: boolean;
  testID?: string;
};

/** Large, thumb-friendly quick action (e.g. "Breast", "Diaper"). */
export function ActionTile({ icon, label, caption, tone, onPress, active, testID }: ActionTileProps) {
  const t = useTheme();
  const c = tones[tone];
  const a11y = usePressableA11y({ label: [label, caption].filter(Boolean).join(', '), selected: active });
  const bg = active ? c.solid : c.soft;
  const fg = active ? c.onSolid : c.onSoft;
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 0,
        minHeight: t.size.control.lg * 1.75,
        paddingVertical: t.space.md,
        paddingHorizontal: t.space.xxs,
        gap: t.space.xs,
        borderRadius: t.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors[bg],
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}>
      <View
        style={{
          width: t.size.control.md,
          height: t.size.control.md,
          borderRadius: t.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.colors[active ? c.onSolid : c.solid],
        }}>
        <Icon name={icon} size="lg" color={active ? c.solid : c.onSolid} />
      </View>
      <Text variant="label" color={fg} align="center" numberOfLines={1} capScale>
        {label}
      </Text>
      {caption ? (
        <Text variant="caption" color={fg} align="center" numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </Pressable>
  );
}
