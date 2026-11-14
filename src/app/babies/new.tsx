import { useLocalSearchParams } from 'expo-router';

import { BabyFormScreen } from '@/features/babies';

/** `?id=` switches the form to edit mode. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <BabyFormScreen editId={id} />;
}
