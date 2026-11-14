import { View } from 'react-native';

import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { type Tone } from '@minik/design-tokens';
import { Button } from './Button';
import { IconBubble } from './IconBubble';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  body?: string;
  tone?: Tone;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon, title, body, tone = 'brand', action }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: t.space.md, paddingVertical: t.space.xxl, paddingHorizontal: t.space.xl }}>
      <IconBubble icon={icon} tone={tone} size="lg" />
      <Text variant="title2" align="center">
        {title}
      </Text>
      {body ? (
        <Text color="textSecondary" align="center">
          {body}
        </Text>
      ) : null}
      {action ? <Button label={action.label} onPress={action.onPress} tone={tone} /> : null}
    </View>
  );
}
