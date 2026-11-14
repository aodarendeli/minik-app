import { Text } from '../primitives/Text';

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export type TimerDisplayProps = { elapsedMs: number; size?: 'lg' | 'sm'; accessibilityLabel: string };

/** Tabular-number elapsed time. Parent re-renders at <=1 Hz. */
export function TimerDisplay({ elapsedMs, size = 'lg', accessibilityLabel }: TimerDisplayProps) {
  return (
    <Text variant={size === 'lg' ? 'timer' : 'timerSm'} align="center" accessibilityLabel={accessibilityLabel} capScale>
      {formatDuration(elapsedMs)}
    </Text>
  );
}
