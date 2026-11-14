import { router } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { toLocalDate } from '@/core/time';
import { Badge, Button, Card, Divider, EmptyState, Inline, ListItem, Notice, SectionHeader, Stack } from '@/design-system';
import { formatDate } from '@/shared/format';

import type { MedEntry, MedKind } from '../../domain';
import { HealthDeps } from '../deps';
import { useMedsQuery } from '../use-records';

const ICON = { vaccine: 'syringe', medication: 'pill' } as const;
const TONE = { vaccine: 'info', medication: 'health' } as const;

export function MedsPanel() {
  const i18n = useI18n();
  const { t } = i18n;
  const { clock } = HealthDeps.useDeps();
  const today = toLocalDate(clock.now());
  const query = useMedsQuery();
  const entries = query.data ?? [];
  const add = (kind: MedKind) => router.push({ pathname: '/meds/new', params: { kind } });
  const open = (e: MedEntry) => router.push({ pathname: '/meds/new', params: { id: e.id } });
  const upcoming = entries.filter((e) => e.nextOn !== undefined && e.nextOn >= today).sort((a, b) => (a.nextOn ?? '').localeCompare(b.nextOn ?? ''));

  const row = (e: MedEntry, i: number, showNext: boolean) => (
    <Stack key={e.id}>
      {i > 0 ? <Divider /> : null}
      <ListItem
        icon={ICON[e.kind]}
        tone={TONE[e.kind]}
        title={e.name}
        subtitle={[
          showNext ? t('records.nextLabel', { date: formatDate(e.nextOn ?? e.givenOn, i18n, 'long') }) : formatDate(e.givenOn, i18n, 'long'),
          t(`records.kinds.${e.kind}`),
          e.dose,
        ]
          .filter(Boolean)
          .join(' · ')}
        trailing={!showNext && e.nextOn && e.nextOn >= today ? <Badge label={formatDate(e.nextOn, i18n)} tone="info" /> : undefined}
        onPress={() => open(e)}
        showChevron
      />
    </Stack>
  );

  const buttons = (
    <Inline gap="sm">
      <Stack flex>
        <Button label={t('records.addVaccine')} icon="syringe" tone="info" variant="soft" fullWidth onPress={() => add('vaccine')} />
      </Stack>
      <Stack flex>
        <Button label={t('records.addMed')} icon="pill" tone="health" variant="soft" fullWidth onPress={() => add('medication')} />
      </Stack>
    </Inline>
  );

  if (!query.isLoading && entries.length === 0) {
    return (
      <>
        <EmptyState icon="syringe" tone="info" title={t('records.medsEmptyTitle')} body={t('records.medsEmptyBody')} />
        {buttons}
        <Notice text={t('records.notAdvice')} />
      </>
    );
  }

  return (
    <>
      {buttons}
      {upcoming.length > 0 ? (
        <Stack gap="md">
          <SectionHeader title={t('records.upcoming')} />
          <Card padding="md" gap="none" tone="info">
            {upcoming.map((e, i) => row(e, i, true))}
          </Card>
        </Stack>
      ) : null}
      <Stack gap="md">
        <SectionHeader title={t('records.history')} />
        <Card padding="md" gap="none">
          {entries.map((e, i) => row(e, i, false))}
        </Card>
      </Stack>
      <Notice text={t('records.notAdvice')} />
    </>
  );
}
