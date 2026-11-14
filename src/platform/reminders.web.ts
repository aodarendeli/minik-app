import type { ReminderPort } from '@/features/health/domain';

import type { DescribeReminder } from './reminders.types';

/** Web has no scheduled local notifications: reminders are a no-op (the date still shows in the app). */
export function createReminders(_describe: DescribeReminder): ReminderPort {
  return { schedule: async () => undefined, cancel: async () => undefined };
}
