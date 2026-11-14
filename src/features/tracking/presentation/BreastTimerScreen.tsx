import { useI18n } from '@/core/i18n';
import { ActionTile, Badge, Button, Inline, Notice, ScreenContainer, Stack, Text, TimerDisplay } from '@/design-system';
import { formatDurationShort, formatError } from '@/shared/format';

import { SideCard } from './components/SideCard';
import { StartedLatePicker } from './components/StartedLatePicker';
import { useSessionViewModel, useSuggestedSide } from './use-session-view-model';

export function BreastTimerScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useSessionViewModel('breastFeeding');
  const suggested = useSuggestedSide();

  if (!vm.loading && !vm.session) {
    return (
      <ScreenContainer>
        <Text variant="title2" align="center">
          {t('timer.startPrompt')}
        </Text>
        <Inline gap="md" align="stretch">
          {(['left', 'right'] as const).map((side) => (
            <ActionTile
              key={side}
              icon="breast"
              tone="feeding"
              label={t(`care.${side}`)}
              caption={side === suggested ? t('timer.suggested') : undefined}
              active={side === suggested}
              onPress={() => vm.start(side)}
            />
          ))}
        </Inline>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      footer={
        <>
          <Button label={t('timer.finishFeeding')} icon="check" tone="feeding" size="lg" fullWidth onPress={vm.finish} loading={vm.busy} />
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
      <Stack gap="sm" align="center" paddingY="xl">
        <TimerDisplay elapsedMs={vm.elapsed} accessibilityLabel={t('timer.elapsed', { time: formatDurationShort(vm.elapsed, i18n) })} />
        {vm.running && vm.side ? (
          <Badge label={t('timer.runningSide', { side: t(`care.${vm.side}`) })} tone="feeding" />
        ) : (
          <Badge label={t('timer.paused')} tone="neutral" />
        )}
      </Stack>
      <Inline gap="md" align="stretch">
        <SideCard side="left" ms={vm.sides.leftMs} active={vm.running && vm.side === 'left'} onPress={() => vm.switchTo('left')} />
        <SideCard side="right" ms={vm.sides.rightMs} active={vm.running && vm.side === 'right'} onPress={() => vm.switchTo('right')} />
      </Inline>
      <Text variant="caption" color="textTertiary" align="center">
        {t('timer.tapToSwitch')}
      </Text>
      {vm.canCorrectSide && vm.side ? (
        <Button
          label={t('timer.wrongSide', { side: t(`care.${vm.side === 'left' ? 'right' : 'left'}`) })}
          icon="swap"
          variant="soft"
          tone="feeding"
          onPress={() => vm.correctSide(vm.side === 'left' ? 'right' : 'left')}
        />
      ) : null}
      <StartedLatePicker options={[2, 5, 10, 15]} onPick={vm.startedMinutesAgo} />
      <Notice text={t('timer.notificationHint')} icon="info" tone="neutral" />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
    </ScreenContainer>
  );
}
