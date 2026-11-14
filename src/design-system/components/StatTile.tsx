import { View } from 'react-native';

import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type StatTileProps = {
  label: string;
  value: string;
  caption?: string;
  icon?: IconName;
  tone?: Tone;
  /** Three tiles per row (smaller value text) instead of two. */
  compact?: boolean;
};

export function StatTile({ label, value, caption, icon, tone = 'brand', compact }: StatTileProps) {
  const t = useTheme();
  const c = tones[tone];
  return (
    <View
      accessible
      accessibilityLabel={[label, value, caption].filter(Boolean).join(', ')}
      style={{
        flexGrow: 1,
        flexBasis: compact ? 0 : '45%',
        minWidth: 0,
        padding: compact ? t.space.md : t.space.lg,
        gap: t.space.xs,
        borderRadius: t.radius.xl,
        backgroundColor: t.colors[c.soft],
      }}>
      <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', gap: t.space.sm }}>
        {icon ? (
          <View
            style={{
              width: t.size.icon.xl,
              height: t.size.icon.xl,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.colors[c.solid],
            }}>
            <Icon name={icon} size="sm" color={c.onSolid} />
          </View>
        ) : null}
        <Text variant="label" color={c.onSoft} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text variant={compact ? 'title2' : 'title1'} color={c.onSoft} numberOfLines={compact ? 2 : 1}>
        {value}
      </Text>
      {caption ? (
        <Text variant="caption" color={c.onSoft} numberOfLines={compact ? 3 : undefined}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** Two-column responsive grid of StatTiles. */
export function StatGrid({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>{children}</View>;
}
