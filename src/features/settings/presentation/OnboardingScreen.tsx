import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';

import { useI18n } from '@/core/i18n';
import { BabyFormFields, useActiveBaby, useBabyFormViewModel } from '@/features/babies';
import {
  BrandMark,
  Button,
  Card,
  Checkbox,
  IconBubble,
  type IconName,
  Inline,
  ProgressDots,
  ScreenContainer,
  Stack,
  Text,
  type Tone,
} from '@/design-system';

import { LEGAL_VERSION, PARENT_NAME_MAX, type ParentRole } from '../domain';
import { AppearanceFields, LanguageField, ParentFields } from './components/AppearanceFields';
import { useSettings, useUpdateSettings } from './use-settings';

const STEPS = ['welcome', 'parent', 'baby', 'look'] as const;
type Step = (typeof STEPS)[number];

const FEATURES: readonly { icon: IconName; tone: Tone; key: 'featureTracking' | 'featureLabs' | 'featureReports' }[] = [
  { icon: 'breast', tone: 'feeding', key: 'featureTracking' },
  { icon: 'lab', tone: 'health', key: 'featureLabs' },
  { icon: 'pdf', tone: 'sleep', key: 'featureReports' },
];

type StepProps = { next: () => void; back: () => void; progress: ReactNode };

/** First-run setup: language, parent, first baby, look. Everything stays on the device. */
export function OnboardingScreen() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const step: Step = STEPS[index] ?? 'welcome';
  const props: StepProps = {
    next: () => setIndex((i) => Math.min(i + 1, STEPS.length - 1)),
    back: () => setIndex((i) => Math.max(i - 1, 0)),
    progress: (
      <ProgressDots
        current={index + 1}
        total={STEPS.length}
        label={t('onboarding.step', { current: index + 1, total: STEPS.length })}
      />
    ),
  };
  switch (step) {
    case 'welcome':
      return <WelcomeStep {...props} />;
    case 'parent':
      return <ParentStep {...props} />;
    case 'baby':
      return <BabyStep {...props} />;
    case 'look':
      return <LookStep {...props} />;
  }
}

function WelcomeStep({ next, progress }: StepProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const update = useUpdateSettings();
  const [accepted, setAccepted] = useState(settings.legalAccepted === LEGAL_VERSION);
  const [submitted, setSubmitted] = useState(false);
  const start = () => {
    setSubmitted(true);
    if (!accepted) return;
    update({ legalAccepted: LEGAL_VERSION });
    next();
  };
  return (
    <ScreenContainer
      title={t('onboarding.welcomeTitle')}
      subtitle={t('onboarding.welcomeBody')}
      footer={<Button label={t('onboarding.start')} icon="sparkles" size="lg" fullWidth onPress={start} testID="onboarding-start" />}>
      {progress}
      <Stack align="center" paddingY="lg">
        <BrandMark />
      </Stack>
      <Card gap="lg">
        {FEATURES.map((f) => (
          <Inline key={f.key} gap="md">
            <IconBubble icon={f.icon} tone={f.tone} />
            <Stack flex shrink>
              <Text variant="bodyStrong">{t(`onboarding.${f.key}`)}</Text>
            </Stack>
          </Inline>
        ))}
      </Card>
      <LanguageField settings={settings} />
      <Card gap="sm">
        <Checkbox
          label={t('legal.consent')}
          checked={accepted}
          onChange={setAccepted}
          error={submitted && !accepted ? t('legal.consentRequired') : undefined}
          testID="onboarding-consent"
        />
        <Inline gap="xs" wrap>
          {(['terms', 'privacy', 'medical'] as const).map((doc) => (
            <Button
              key={doc}
              label={t(`legal.read${doc === 'terms' ? 'Terms' : doc === 'privacy' ? 'Privacy' : 'Medical'}`)}
              variant="ghost"
              size="sm"
              onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc } })}
            />
          ))}
        </Inline>
      </Card>
      <Inline gap="sm">
        <IconBubble icon="lock" tone="neutral" />
        <Stack flex shrink>
          <Text variant="caption" color="textSecondary">
            {t('onboarding.privacy')}
          </Text>
        </Stack>
      </Inline>
    </ScreenContainer>
  );
}

function StepFooter({ onNext, onBack, nextLabel, loading }: { onNext: () => void; onBack: () => void; nextLabel: string; loading?: boolean }) {
  const { t } = useI18n();
  return (
    <>
      <Button label={nextLabel} size="lg" fullWidth onPress={onNext} loading={loading} testID="onboarding-next" />
      <Button label={t('onboarding.back')} variant="ghost" tone="neutral" fullWidth onPress={onBack} />
    </>
  );
}

function ParentStep({ next, back, progress }: StepProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const update = useUpdateSettings();
  const [name, setName] = useState(settings.parent?.name ?? '');
  const [role, setRole] = useState<ParentRole>(settings.parent?.role ?? 'mother');
  const [submitted, setSubmitted] = useState(false);
  const trimmed = name.trim().slice(0, PARENT_NAME_MAX);
  const submit = () => {
    setSubmitted(true);
    if (!trimmed) return;
    update({ parent: { name: trimmed, role } });
    next();
  };
  return (
    <ScreenContainer
      title={t('onboarding.parentTitle')}
      subtitle={t('onboarding.parentBody')}
      footer={<StepFooter onNext={submit} onBack={back} nextLabel={t('onboarding.next')} />}>
      {progress}
      <Stack align="center" paddingY="md">
        <IconBubble icon="person" size="lg" tone="feeding" />
      </Stack>
      <ParentFields
        name={name}
        role={role}
        onNameChange={setName}
        onRoleChange={setRole}
        nameLabel={t('onboarding.parentName')}
        roleLabel={t('onboarding.role')}
        nameError={submitted && !trimmed ? t('onboarding.parentNameError') : undefined}
        autoFocus
      />
    </ScreenContainer>
  );
}

function BabyStep({ next, back, progress }: StepProps) {
  const { t } = useI18n();
  const { babies } = useActiveBaby();
  const vm = useBabyFormViewModel(undefined, { onSaved: next });
  return (
    <ScreenContainer
      title={t('onboarding.babyTitle')}
      subtitle={t('onboarding.babyBody')}
      footer={
        <>
          <StepFooter onNext={vm.save} onBack={back} nextLabel={t('onboarding.next')} loading={vm.saving} />
          {babies.length > 0 ? <Button label={t('onboarding.skip')} variant="ghost" tone="neutral" fullWidth onPress={next} /> : null}
        </>
      }>
      {progress}
      <Stack align="center" paddingY="md">
        <IconBubble icon="baby" size="lg" tone="sleep" />
      </Stack>
      <BabyFormFields vm={vm} />
      {vm.error ? <Text color="danger">{t('errors.Validation')}</Text> : null}
    </ScreenContainer>
  );
}

function LookStep({ back, progress }: StepProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const update = useUpdateSettings();
  return (
    <ScreenContainer
      title={t('onboarding.lookTitle')}
      subtitle={t('onboarding.lookBody')}
      footer={<StepFooter onNext={() => update({ onboarded: true })} onBack={back} nextLabel={t('onboarding.finish')} />}>
      {progress}
      <Stack align="center" paddingY="md">
        <IconBubble icon="palette" size="lg" />
      </Stack>
      <AppearanceFields settings={settings} />
    </ScreenContainer>
  );
}
