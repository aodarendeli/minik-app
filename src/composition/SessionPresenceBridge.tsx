import { useQueryClient } from '@tanstack/react-query';
import { router, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { useI18n } from '@/core/i18n';
import { queryKeys } from '@/core/query';
import { useActiveBaby } from '@/features/babies';
import type { PresenceAction } from '@/platform/session-presence.types';

import type { Container } from './container';

/**
 * Connects notifications to the app: configures labels per locale, re-posts notifications for
 * persisted sessions on launch and every time the app goes to the background (so a running timer is
 * always in the shade, even if it was swiped away), and runs notification button actions through the same use-cases.
 */
export function SessionPresenceBridge({ container }: { container: Container }) {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { select } = useActiveBaby();
  const navigation = useNavigationContainerRef();

  useEffect(() => {
    const labels = {
      switchSide: t('presence.switchSide'),
      pause: t('timer.pause'),
      resume: t('timer.resume'),
      stop: t('presence.stop'),
      channelName: t('presence.channel'),
      actionsHint: t(Platform.OS === 'ios' ? 'presence.hintIos' : 'presence.hintAndroid'),
    };
    void container.presence
      .configure(labels)
      .then(() => container.tracking.restorePresence())
      .catch(() => undefined);
  }, [container, t, locale]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') void container.tracking.restorePresence();
    });
    return () => sub.remove();
  }, [container]);

  useEffect(() => {
    const { tracking } = container;
    const run = async (a: PresenceAction) => {
      select(a.babyId);
      if (a.type === 'switch') {
        const session = await tracking.getSession(a.babyId, 'breastFeeding');
        const side = session.ok && session.value?.segments.at(-1)?.side === 'left' ? 'right' : 'left';
        await tracking.switchSide(a.babyId, side);
      } else if (a.type === 'pause') await tracking.pauseSession(a.babyId, a.kind);
      else if (a.type === 'resume') await tracking.resumeSession(a.babyId, a.kind);
      else if (a.type === 'stop') await tracking.stopSession(a.babyId, a.kind);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tracking }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports }),
      ]);
      if (a.type === 'open') openTimer(a, navigation);
    };
    return container.presence.subscribe((a) => void run(a));
  }, [container, queryClient, select, navigation]);

  return null;
}

type NavigationRef = { isReady(): boolean; getCurrentRoute(): { name: string } | undefined };

/**
 * A tap can cold-start the app before the navigator mounts: wait (briefly) until it is ready.
 * If that timer screen is already on top (the parent left the app from it), do nothing: never stack a second one.
 */
export function openTimer(a: Pick<PresenceAction, 'kind'>, navigation: NavigationRef, attempt = 0) {
  if (navigation.isReady()) {
    const target = a.kind === 'sleep' ? 'log/sleep' : 'log/breast';
    if (navigation.getCurrentRoute()?.name === target) return;
    router.navigate(`/${target}`);
  } else if (attempt < 50) {
    setTimeout(() => openTimer(a, navigation, attempt + 1), 100);
  }
}
