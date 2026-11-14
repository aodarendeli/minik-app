import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type BarDatum = { key: string; label: string; value: number; valueLabel: string };

export type BarChartProps = {
  data: readonly BarDatum[];
  tone?: Tone;
  accessibilityLabel: string;
  /** Dashed reference line, e.g. the period average ("ort. 7"). */
  average?: { value: number; label: string };
};

/**
 * Lightweight bar chart drawn with views (no chart dependency). Capsule bars with a soft gradient; the latest
 * bar is highlighted and its value sits in a bubble. Every value is also in the accessibility label.
 */
export function BarChart({ data, tone = 'brand', accessibilityLabel, average }: BarChartProps) {
  const t = useTheme();
  const c = tones[tone];
  const max = Math.max(1, average?.value ?? 0, ...data.map((d) => d.value));
  const height = t.size.chartHeight;
  const bubble = t.size.icon.xl;
  const summary = data.map((d) => `${d.label}: ${d.valueLabel}`).join(', ');
  const solid = t.colors[c.solid];
  const soft = t.colors[c.soft];
  const last = data.length - 1;
  return (
    <View accessible accessibilityLabel={[accessibilityLabel, summary, average?.label].filter(Boolean).join('. ')} style={{ gap: t.space.sm }}>
      <View style={{ height: height + bubble, justifyContent: 'flex-end' }}>
        {average && average.value > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              start: 0,
              end: 0,
              bottom: (average.value / max) * height,
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space.xs,
            }}>
            <View style={{ flex: 1, borderTopWidth: t.size.hairline, borderStyle: 'dashed', borderColor: t.colors.borderStrong }} />
            <View style={{ paddingHorizontal: t.space.xs, borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceSunken }}>
              <Text variant="caption" color="textSecondary" capScale>
                {average.label}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t.space.xs }}>
          {data.map((d, i) => {
            const isLast = i === last;
            const barHeight = d.value > 0 ? Math.max(t.space.md, (d.value / max) * height) : 0;
            return (
              <View key={d.key} style={{ flex: 1, alignItems: 'center', gap: t.space.xs }}>
                {isLast && d.value > 0 ? (
                  <View style={{ paddingHorizontal: t.space.sm, paddingVertical: t.space.xxs, borderRadius: t.radius.pill, backgroundColor: solid }}>
                    <Text variant="caption" color={c.onSolid} numberOfLines={1} capScale>
                      {d.valueLabel}
                    </Text>
                  </View>
                ) : (
                  <Text variant="caption" color="textTertiary" numberOfLines={1} capScale>
                    {d.valueLabel}
                  </Text>
                )}
                {barHeight > 0 ? (
                  <View
                    style={{
                      width: '100%',
                      maxWidth: t.size.icon.lg,
                      height: barHeight,
                      borderRadius: t.radius.pill,
                      backgroundColor: solid,
                      experimental_backgroundImage: `linear-gradient(to top, ${solid}, ${isLast ? solid : soft})`,
                      opacity: isLast ? 1 : 0.85,
                    }}
                  />
                ) : (
                  <View style={{ width: t.space.sm, height: t.space.sm, borderRadius: t.radius.pill, backgroundColor: t.colors.borderDefault }} />
                )}
              </View>
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: t.space.xs }}>
        {data.map((d, i) => (
          <View key={d.key} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" color={i === last ? 'textPrimary' : 'textSecondary'} numberOfLines={1} capScale>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
