import type { DescribeSession, SessionPresenceAdapter } from './session-presence.types';

/** Web has no persistent notifications: presence is a no-op; the in-app timer is the source of truth. */
export function createSessionPresence(_describe: DescribeSession): SessionPresenceAdapter {
  return {
    configure: async () => undefined,
    show: async () => undefined,
    hide: async () => undefined,
    subscribe: () => () => undefined,
  };
}
