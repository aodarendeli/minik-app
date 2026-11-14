import { useI18n } from '@/core/i18n';
import { IconButton, ListItem } from '@/design-system';
import { formatTime } from '@/shared/format';

import type { CareEvent } from '../../domain';
import { describeEvent } from '../event-format';

export function EventRow({ event, onDelete }: { event: CareEvent; onDelete?: (event: CareEvent) => void }) {
  const i18n = useI18n();
  const d = describeEvent(event, i18n);
  return (
    <ListItem
      icon={d.icon}
      tone={d.tone}
      title={d.title}
      subtitle={[d.detail, event.note].filter(Boolean).join(' · ')}
      meta={formatTime(event.startedAt, i18n)}
      trailing={
        onDelete ? <IconButton icon="delete" label={i18n.t('timeline.deleteEvent')} onPress={() => onDelete(event)} /> : undefined
      }
    />
  );
}
