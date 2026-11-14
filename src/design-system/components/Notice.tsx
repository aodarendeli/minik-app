import { View } from 'react-native';

import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type NoticeProps = { text: string; tone?: Tone; icon?: IconName };

/** Inline informational banner (e.g. the medical disclaimer). */
export function Notice({ text, tone = 'info', icon = 'info' }: NoticeProps) {
  const t = useTheme();
  const c = tones[tone];
  return (
    <View
      accessible
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        gap: t.space.sm,
        padding: t.space.md,
        borderRadius: t.radius.md,
        backgroundColor: t.colors[c.soft],
      }}>
      <Icon name={icon} size="md" color={c.onSoft} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" color={c.onSoft}>
          {text}
        </Text>
      </View>
    </View>
  );
}
