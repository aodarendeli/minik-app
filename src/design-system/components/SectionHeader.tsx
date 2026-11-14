import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

export type SectionHeaderProps = { title: string; action?: { label: string; onPress: () => void } };

export function SectionHeader({ title, action }: SectionHeaderProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space.sm }}>
      <Text variant="title2" accessibilityRole="header">
        {title}
      </Text>
      {action ? <Button label={action.label} onPress={action.onPress} variant="ghost" size="sm" /> : null}
    </View>
  );
}
