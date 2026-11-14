import { useLocalSearchParams } from 'expo-router';

import { LabFormScreen } from '@/features/health';

/** `?id=` switches the form to edit mode. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <LabFormScreen editId={id} />;
}
