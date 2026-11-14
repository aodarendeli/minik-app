import { useLocalSearchParams } from 'expo-router';

import { MedFormScreen } from '@/features/health';

/** `?id=` edits an entry; `?kind=vaccine|medication` preselects the type of a new one. */
export default function Route() {
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: string }>();
  return <MedFormScreen editId={id} kind={kind === 'medication' ? 'medication' : 'vaccine'} />;
}
