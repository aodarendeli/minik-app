import type { ReminderPort } from '@/features/health/domain';

/** Builds the notification copy for a reminder (localized, with the baby's name) outside React. */
export type DescribeReminder = (r: Parameters<ReminderPort['schedule']>[0]) => Promise<{ title: string; body: string; channelName: string }>;
