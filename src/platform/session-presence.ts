import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { ActiveSession, SessionKind } from '@/features/tracking/domain';

import type { DescribeSession, PresenceAction, PresenceActionType, SessionPresenceAdapter } from './session-presence.types';

const CHANNEL_ID = 'session';
const CATEGORY = { breastRunning: 'sessionBreastRunning', sleepRunning: 'sessionSleepRunning', paused: 'sessionPaused' } as const;
const ACTIONS: readonly PresenceActionType[] = ['switch', 'pause', 'resume', 'stop'];
const notificationId = (sessionId: string) => `session_${sessionId}`;

type SessionData = { type: 'session'; sessionId: string; babyId: string; kind: SessionKind };

function isSessionData(data: unknown): data is SessionData {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'session';
}

function categoryFor(session: ActiveSession): string {
  if (session.status === 'paused') return CATEGORY.paused;
  return session.kind === 'sleep' ? CATEGORY.sleepRunning : CATEGORY.breastRunning;
}

/**
 * Expo Go compatible presence: a sticky (Android) local notification per running session, updated on every
 * state change. Text is static ("Left side · since 14:05"); a live counter needs the dev-build adapters (S10).
 * Buttons open the app (`opensAppToForeground`), which is the reliable path in Expo Go.
 */
export function createSessionPresence(describe: DescribeSession): SessionPresenceAdapter {
  let permission: 'unknown' | 'granted' | 'denied' = 'unknown';
  let actionsHint = '';

  async function ensurePermission(): Promise<boolean> {
    if (permission !== 'unknown') return permission === 'granted';
    const current = await Notifications.getPermissionsAsync();
    const final = current.granted || !current.canAskAgain ? current : await Notifications.requestPermissionsAsync();
    permission = final.granted ? 'granted' : 'denied';
    return final.granted;
  }

  return {
    async configure(labels) {
      actionsHint = labels.actionsHint;
      Notifications.setNotificationHandler({
        handleNotification: async (n) => {
          const session = isSessionData(n.request.content.data);
          // While the app is open the in-app timer is visible: keep session notifications out of the banner.
          return { shouldShowBanner: !session, shouldShowList: true, shouldPlaySound: !session, shouldSetBadge: false };
        },
      });
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: labels.channelName,
          importance: AndroidImportance.LOW,
          sound: null,
          vibrationPattern: null,
          showBadge: false,
        });
      }
      const button = (id: PresenceActionType, title: string, destructive = false) => ({
        identifier: id,
        buttonTitle: title,
        options: { opensAppToForeground: true, isDestructive: destructive },
      });
      await Promise.all([
        Notifications.setNotificationCategoryAsync(CATEGORY.breastRunning, [
          button('switch', labels.switchSide),
          button('pause', labels.pause),
          button('stop', labels.stop),
        ]),
        Notifications.setNotificationCategoryAsync(CATEGORY.sleepRunning, [button('pause', labels.pause), button('stop', labels.stop)]),
        Notifications.setNotificationCategoryAsync(CATEGORY.paused, [button('resume', labels.resume), button('stop', labels.stop)]),
      ]);
    },

    async show(session) {
      if (!(await ensurePermission())) return;
      const copy = await describe(session);
      const data: SessionData = { type: 'session', sessionId: session.id, babyId: session.babyId, kind: session.kind };
      const ios = Platform.OS === 'ios';
      // iOS shows `subtitle` as its own bold line; Android has no subtitle, so it leads the body.
      const lines = [ios ? undefined : copy.subtitle, copy.body].filter(Boolean).join(' · ');
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId(session.id),
        content: {
          title: copy.title,
          subtitle: ios ? copy.subtitle : undefined,
          body: actionsHint ? `${lines}\n${actionsHint}` : lines,
          color: copy.accentColor,
          threadIdentifier: 'sessions',
          data,
          sticky: true,
          autoDismiss: false,
          sound: false,
          categoryIdentifier: categoryFor(session),
        },
        trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
      });
    },

    async hide(sessionId) {
      await Notifications.dismissNotificationAsync(notificationId(sessionId));
    },

    subscribe(handler) {
      const handled = new Set<string>();
      const handle = (response: Notifications.NotificationResponse | null) => {
        if (!response) return;
        const { request, date } = response.notification;
        const data = request.content.data;
        const key = `${request.identifier}:${response.actionIdentifier}:${date}`;
        if (!isSessionData(data) || handled.has(key)) return;
        handled.add(key);
        Notifications.clearLastNotificationResponse();
        const type = ACTIONS.find((a) => a === response.actionIdentifier) ?? 'open';
        const action: PresenceAction = { type, sessionId: data.sessionId, babyId: data.babyId, kind: data.kind };
        handler(action);
      };
      handle(Notifications.getLastNotificationResponse());
      const sub = Notifications.addNotificationResponseReceivedListener(handle);
      return () => sub.remove();
    },
  };
}
