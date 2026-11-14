import { router } from 'expo-router';

import { openTimer } from './SessionPresenceBridge';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() }, useNavigationContainerRef: jest.fn() }));

const nav = (current?: string) => ({ isReady: () => true, getCurrentRoute: () => (current ? { name: current } : undefined) });

describe('notification tap → timer screen', () => {
  beforeEach(() => jest.mocked(router.navigate).mockClear());

  it('does not open a second timer when that timer is already on screen', () => {
    openTimer({ kind: 'breastFeeding' }, nav('log/breast'));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('navigates to the timer from anywhere else', () => {
    openTimer({ kind: 'breastFeeding' }, nav('(tabs)'));
    openTimer({ kind: 'sleep' }, nav('log/breast'));
    expect(jest.mocked(router.navigate).mock.calls).toEqual([['/log/breast'], ['/log/sleep']]);
  });
});
