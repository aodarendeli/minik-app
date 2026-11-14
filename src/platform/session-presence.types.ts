import type { ActiveSession, SessionKind, SessionPresencePort } from '@/features/tracking/domain';

/** Notification copy. `subtitle` is a bold line on iOS; on Android it is merged into the body. */
export type PresenceCopy = { title: string; subtitle?: string; body: string; accentColor?: string };
export type PresenceLabels = {
  switchSide: string;
  pause: string;
  resume: string;
  stop: string;
  channelName: string;
  /** "Press and hold / pull down for options" — buttons are hidden in the collapsed notification. */
  actionsHint: string;
};
export type PresenceActionType = 'open' | 'switch' | 'pause' | 'resume' | 'stop';
export type PresenceAction = { type: PresenceActionType; sessionId: string; babyId: string; kind: SessionKind };

/** Platform presence adapter: the domain port plus app-level wiring (labels, action callbacks). */
export type SessionPresenceAdapter = SessionPresencePort & {
  configure(labels: PresenceLabels): Promise<void>;
  /** Delivers notification taps/buttons; also replays a tap that cold-started the app. */
  subscribe(handler: (action: PresenceAction) => void): () => void;
};

export type DescribeSession = (session: ActiveSession) => Promise<PresenceCopy>;
