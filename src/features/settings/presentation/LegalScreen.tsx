import { Stack as RouterStack } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { Card, ScreenContainer, Stack, Text } from '@/design-system';

import { SettingsDeps } from './deps';

export type LegalDoc = 'privacy' | 'terms' | 'medical';
export const LEGAL_DOCS: readonly LegalDoc[] = ['privacy', 'terms', 'medical'];

/** Privacy policy, terms of use or medical notice; paragraphs are separated by blank lines in the copy. */
export function LegalScreen({ doc }: { doc: LegalDoc }) {
  const { t } = useI18n();
  const { supportEmail } = SettingsDeps.useDeps();
  const paragraphs = t(`legal.${doc}.body`).split('\n\n');
  return (
    <>
      <RouterStack.Screen options={{ title: t(`legal.${doc}.title`) }} />
      <ScreenContainer>
        <Card gap="lg">
          {paragraphs.map((p, i) => (
            <Text key={i} color={i === 0 ? 'textPrimary' : 'textSecondary'} variant={i === 0 ? 'bodyStrong' : 'body'}>
              {p}
            </Text>
          ))}
        </Card>
        <Stack gap="xxs">
          <Text variant="caption" color="textTertiary">
            {t('legal.updated')}
          </Text>
          {supportEmail ? (
            <Text variant="caption" color="textTertiary">
              {t('legal.contact', { email: supportEmail })}
            </Text>
          ) : null}
        </Stack>
      </ScreenContainer>
    </>
  );
}
