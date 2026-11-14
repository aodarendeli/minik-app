import { useLocalSearchParams } from 'expo-router';

import { LabDetailScreen } from '@/features/health';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LabDetailScreen id={id} />;
}
