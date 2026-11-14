import { router } from 'expo-router';

import { useI18n } from '@/core/i18n';
import type { Instant } from '@/core/time';
import { Card, Icon, Inline, Stack, Text, TimerDisplay } from '@/design-system';

import { currentSide, elapsedMs, type ActiveSession } from '../../domain';

/** Running timer card on Today; tapping opens the full timer. */
export function SessionBanner({ session, now }: { session: ActiveSession; now: Instant }) {
  const { t } = useI18n();
  const isSleep = session.kind === 'sleep';
  const side = currentSide(session);
  const title = isSleep
    ? t('today.sessionSleep')
    : t('today.sessionBreast', { side: side ? t(`care.${side}`) : '' });
  const ms = elapsedMs(session, now);
  return (
    <Card
      tone={isSleep ? 'sleep' : 'feeding'}
      onPress={() => router.push(isSleep ? '/log/sleep' : '/log/breast')}
      accessibilityLabel={`${title}, ${t('today.openTimer')}`}>
      <Inline gap="md">
        <Icon name={isSleep ? 'sleep' : 'breast'} color={isSleep ? 'onSleepSoft' : 'onFeedingSoft'} />
        <Stack flex shrink>
          <Text variant="bodyStrong" color={isSleep ? 'onSleepSoft' : 'onFeedingSoft'}>
            {title}
          </Text>
          {session.status === 'paused' ? (
            <Text variant="caption" color={isSleep ? 'onSleepSoft' : 'onFeedingSoft'}>
              {t('today.sessionPaused')}
            </Text>
          ) : null}
        </Stack>
        <TimerDisplay elapsedMs={ms} size="sm" accessibilityLabel={t('timer.elapsed', { time: String(Math.round(ms / 60000)) })} />
      </Inline>
    </Card>
  );
}
