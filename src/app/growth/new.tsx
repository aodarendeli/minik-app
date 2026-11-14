import { useLocalSearchParams } from 'expo-router';

import { GrowthFormScreen } from '@/features/health';

/** `?id=` switches the form to edit mode. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <GrowthFormScreen editId={id} />;
}
