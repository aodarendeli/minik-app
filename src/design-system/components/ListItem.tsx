import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconName;
  tone?: Tone;
  onPress?: () => void;
  /** Trailing slot, e.g. an IconButton or Badge. */
  trailing?: ReactNode;
  showChevron?: boolean;
  testID?: string;
};

export function ListItem({ title, subtitle, meta, icon, tone = 'brand', onPress, trailing, showChevron, testID }: ListItemProps) {
  const t = useTheme();
  const c = tones[tone];
  const label = [title, subtitle, meta].filter(Boolean).join(', ');
  const a11y = usePressableA11y({ label });
  const content = (
    <>
      {icon ? (
        <View
          style={{
            width: t.size.control.sm,
            height: t.size.control.sm,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors[c.soft],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={icon} size="md" color={c.onSoft} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: t.space.xxs }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text variant="label" color="textSecondary">
          {meta}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? <Icon name="forward" size="md" color="textTertiary" /> : null}
    </>
  );
  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: t.space.md,
    minHeight: t.size.touchTarget,
    paddingVertical: t.space.sm,
  };
  if (!onPress) {
    return (
      <View style={rowStyle} testID={testID} accessible={!trailing} accessibilityLabel={label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, { opacity: pressed ? t.opacity.pressed : 1 }]}>
      {content}
    </Pressable>
  );
}
