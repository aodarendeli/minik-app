import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: t.space.sm,
        paddingVertical: t.space.xxs,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors[tones[tone].soft],
        alignSelf: 'flex-start',
      }}>
      <Text variant="caption" color={tones[tone].onSoft} capScale>
        {label}
      </Text>
    </View>
  );
}
