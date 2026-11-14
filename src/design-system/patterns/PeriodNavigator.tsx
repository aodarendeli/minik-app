import { View } from 'react-native';

import { IconButton } from '../components/IconButton';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type PeriodNavigatorProps = {
  label: string;
  caption?: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  previousLabel: string;
  nextLabel: string;
};

/** "‹ 12 Nov – 18 Nov ›" style range switcher. */
export function PeriodNavigator({ label, caption, onPrevious, onNext, canGoNext, previousLabel, nextLabel }: PeriodNavigatorProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.surface,
        borderWidth: t.size.hairline,
        borderColor: t.colors.borderSubtle,
        padding: t.space.xxs,
      }}>
      <IconButton icon="back" label={previousLabel} onPress={onPrevious} />
      <View style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLiveRegion="polite">
        <Text variant="bodyStrong" align="center" numberOfLines={1}>
          {label}
        </Text>
        {caption ? (
          <Text variant="caption" color="textSecondary" align="center" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
      <IconButton icon="forward" label={nextLabel} onPress={onNext} disabled={!canGoNext} />
    </View>
  );
}
