import * as Notifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderPort } from '@/features/health/domain';

import type { DescribeReminder } from './reminders.types';

const CHANNEL_ID = 'reminders';
const notificationId = (id: string) => `reminder-${id}`;

/** One-off local notification per med entry `nextOn` (no server). Permission is asked on first schedule. */
export function createReminders(describe: DescribeReminder): ReminderPort {
  async function granted(): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    const final = current.granted || !current.canAskAgain ? current : await Notifications.requestPermissionsAsync();
    return final.granted;
  }
  return {
    async schedule(r) {
      if (!(await granted())) return;
      const copy = await describe(r);
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: copy.channelName, importance: AndroidImportance.DEFAULT });
      }
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId(r.id),
        content: { title: copy.title, body: copy.body, data: { type: 'reminder', entryId: r.id, babyId: r.babyId } },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
      });
    },
    async cancel(id) {
      await Notifications.cancelScheduledNotificationAsync(notificationId(id));
    },
  };
}
