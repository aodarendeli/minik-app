import { View } from 'react-native';

import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type IconBubbleProps = { icon: IconName; tone?: Tone; size?: 'md' | 'lg' };

/** Decorative icon in a soft, round halo (onboarding heroes, feature lists). Hidden from screen readers. */
export function IconBubble({ icon, tone = 'brand', size = 'md' }: IconBubbleProps) {
  const t = useTheme();
  const c = tones[tone];
  const outer = size === 'lg' ? t.size.avatar.lg * 1.5 : t.size.avatar.md;
  const inner = size === 'lg' ? t.size.avatar.lg : t.size.control.sm;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: outer,
        height: outer,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors[c.soft],
      }}>
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: t.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.colors[c.solid],
        }}>
        <Icon name={icon} size={size === 'lg' ? 'xl' : 'md'} color={c.onSolid} />
      </View>
    </View>
  );
}

/** Step indicator: the current step is a wider pill. Announced as "Step x of y" via `label`. */
export function ProgressDots({ current, total, label }: { current: number; total: number; label: string }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={{ flexDirection: 'row', gap: t.space.xs, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 === current ? t.space.xl : t.space.sm,
            height: t.space.sm,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors[i + 1 <= current ? 'brand' : 'borderDefault'],
          }}
        />
      ))}
    </View>
  );
}
