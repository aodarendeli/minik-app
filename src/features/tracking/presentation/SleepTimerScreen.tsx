import { useI18n } from '@/core/i18n';
import { Badge, Button, EmptyState, Inline, Notice, ScreenContainer, Stack, Text, TimerDisplay } from '@/design-system';
import { formatDurationShort, formatError, formatTime } from '@/shared/format';

import { StartedLatePicker } from './components/StartedLatePicker';
import { useSessionViewModel } from './use-session-view-model';

export function SleepTimerScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useSessionViewModel('sleep');

  if (!vm.loading && !vm.session) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="sleep"
          tone="sleep"
          title={t('timer.sleepTitle')}
          body={t('timer.sleepPrompt')}
          action={{ label: t('timer.startSleep'), onPress: () => vm.start() }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      footer={
        <>
          <Button label={t('timer.finishSleep')} icon="check" tone="sleep" size="lg" fullWidth onPress={vm.finish} loading={vm.busy} />
          <Inline gap="sm">
            <Stack flex>
              <Button
                label={vm.running ? t('timer.pause') : t('timer.resume')}
                icon={vm.running ? 'pause' : 'play'}
                variant="soft"
                tone="neutral"
                fullWidth
                onPress={vm.togglePause}
              />
            </Stack>
            <Stack flex>
              <Button label={t('timer.discard')} icon="delete" variant="ghost" tone="danger" fullWidth onPress={vm.discard} />
            </Stack>
          </Inline>
        </>
      }>
      <Stack gap="md" align="center" paddingY="xxl">
        <TimerDisplay elapsedMs={vm.elapsed} accessibilityLabel={t('timer.elapsed', { time: formatDurationShort(vm.elapsed, i18n) })} />
        <Badge label={vm.running ? t('today.sessionSleep') : t('timer.paused')} tone={vm.running ? 'sleep' : 'neutral'} />
        {vm.session ? (
          <Text color="textSecondary">
            {t('timer.startedAt', { time: formatTime(vm.session.startedAt, i18n) })}
          </Text>
        ) : null}
      </Stack>
      <StartedLatePicker options={[5, 10, 15, 30]} onPick={vm.startedMinutesAgo} />
      <Notice text={t('timer.notificationHint')} icon="info" tone="neutral" />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
    </ScreenContainer>
  );
}
