import { useLocalSearchParams } from 'expo-router';

import { LegalScreen, type LegalDoc } from '@/features/settings';

const DOCS: readonly LegalDoc[] = ['privacy', 'terms', 'medical'];

export default function Route() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const match = DOCS.find((d) => d === doc) ?? 'privacy';
  return <LegalScreen doc={match} />;
}
