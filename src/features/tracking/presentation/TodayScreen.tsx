import { router } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { HOUR_MS, startOfLocalDay, toLocalDate, type Instant } from '@/core/time';
import { babyAgeLabel, babyTone, BabySwitcher } from '@/features/babies';
import { firstName, useSettings } from '@/features/settings';
import {
  ActionTile,
  Avatar,
  Box,
  Card,
  Divider,
  EmptyState,
  HeroCard,
  Icon,
  Inline,
  ScreenContainer,
  SectionHeader,
  Stack,
  StatGrid,
  StatTile,
  Text,
} from '@/design-system';
import { formatAgo, formatDurationShort, formatError } from '@/shared/format';

import { EventRow } from './components/EventRow';
import { SessionBanner } from './components/SessionBanner';
import { describeEvent } from './event-format';
import { useTodayViewModel } from './use-today-view-model';

const RECENT_LIMIT = 5;

function partOfDay(now: Instant): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = Math.floor((now - startOfLocalDay(now)) / HOUR_MS);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function TodayScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useTodayViewModel();
  const parentName = firstName(useSettings().parent?.name ?? '');

  if (!vm.loading && !vm.baby) {
    return (
      <ScreenContainer title={t('today.title')}>
        <EmptyState
          icon="baby"
          title={t('today.noBabyTitle')}
          body={t('today.noBabyBody')}
          action={{ label: t('today.addBaby'), onPress: () => router.push('/babies/new') }}
        />
      </ScreenContainer>
    );
  }

  const o = vm.overview;
  const sessions = o?.sessions ?? [];
  const breastActive = sessions.some((s) => s.kind === 'breastFeeding');
  const sleepActive = sessions.some((s) => s.kind === 'sleep');
  const last = o?.lastFeeding;
  const s = o?.summary;

  const babyName = vm.baby?.name ?? '';
  const lastFeedingText = last
    ? `${formatAgo(vm.now - last.startedAt, i18n)} · ${describeEvent(last, i18n).title}`
    : t('today.noFeedingYet');

  return (
    <ScreenContainer
      title={parentName ? t(`today.greeting.${partOfDay(vm.now)}`, { name: parentName }) : t('today.title')}>
      {vm.baby ? (
        <HeroCard
          title={babyName}
          subtitle={babyAgeLabel(vm.baby, toLocalDate(vm.now), i18n)}
          tone={babyTone(vm.baby.color)}
          media={<Avatar name={babyName} tone={babyTone(vm.baby.color)} size="lg" ring face />}
          accessibilityLabel={t('today.editBaby', { name: babyName })}
          onPress={() => router.push({ pathname: '/babies/new', params: { id: vm.baby?.id ?? '' } })}>
          <Box bg="surface" radius="lg" paddingX="lg" paddingY="md">
            <Inline gap="sm">
              <Icon name="breast" size="sm" color="feeding" />
              <Stack flex shrink gap="none">
                <Text variant="caption" color="textSecondary">
                  {t('today.lastFeeding')}
                </Text>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {lastFeedingText}
                </Text>
              </Stack>
            </Inline>
          </Box>
        </HeroCard>
      ) : null}
      <BabySwitcher />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}

      {sessions.map((session) => (
        <SessionBanner key={session.id} session={session} now={vm.now} />
      ))}

      <Stack gap="md">
        <SectionHeader title={t('today.quickLog')} />
        <Inline gap="xs" align="stretch">
          <ActionTile
            icon="breast"
            tone="feeding"
            label={t('care.breast')}
            caption={breastActive ? t('today.running') : o ? t('today.nextSideShort', { side: t(`care.${o.nextSide}`) }) : undefined}
            active={breastActive}
            onPress={vm.startBreast}
            testID="quick-breast"
          />
          <ActionTile icon="bottle" tone="feeding" label={t('care.bottle')} onPress={() => router.push('/log/bottle')} />
          <ActionTile icon="diaper" tone="diaper" label={t('care.diaper')} onPress={() => router.push('/log/diaper')} testID="quick-diaper" />
          <ActionTile
            icon="sleep"
            tone="sleep"
            label={t('care.sleep')}
            caption={sleepActive ? t('today.running') : undefined}
            active={sleepActive}
            onPress={vm.startSleep}
          />
          <ActionTile icon="solid" tone="health" label={t('care.solid')} onPress={() => router.push('/log/solid')} />
        </Inline>
      </Stack>

      {s ? (
        <Stack gap="md">
          <SectionHeader title={t('today.summary')} />
          <StatGrid>
            <StatTile
              compact
              icon="breast"
              tone="feeding"
              label={t('care.feeding')}
              value={String(s.feeding.total)}
              caption={t('today.feedsCaption', {
                breast: formatDurationShort(s.feeding.breastMs, i18n),
                bottle: `${s.feeding.bottleMl} ${t('units.ml')}`,
              })}
            />
            <StatTile
              compact
              icon="diaper"
              tone="diaper"
              label={t('care.diaper')}
              value={String(s.diaper.total)}
              caption={t('today.diapersCaption', { wet: s.diaper.wet, dirty: s.diaper.dirty, mixed: s.diaper.mixed })}
            />
            <StatTile
              compact
              icon="sleep"
              tone="sleep"
              label={t('care.sleep')}
              value={formatDurationShort(s.sleep.totalMs, i18n)}
              caption={t('today.sleepCaption', { count: s.sleep.count })}
            />
          </StatGrid>
        </Stack>
      ) : null}

      <Stack gap="xs">
        <SectionHeader
          title={t('today.recent')}
          action={{ label: t('common.seeAll'), onPress: () => router.push('/timeline') }}
        />
        {o && o.events.length === 0 ? (
          <EmptyState icon="history" title={t('today.emptyTitle')} body={t('today.emptyBody')} tone="neutral" />
        ) : (
          <Card padding="sm" gap="none">
            {o?.events.slice(0, RECENT_LIMIT).map((e, i) => (
              <Stack key={e.id}>
                {i > 0 ? <Divider /> : null}
                <EventRow event={e} />
              </Stack>
            ))}
          </Card>
        )}
      </Stack>
    </ScreenContainer>
  );
}
