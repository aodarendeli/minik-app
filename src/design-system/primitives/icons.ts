import type { AndroidSymbol, SymbolViewProps } from 'expo-symbols';

type SFSymbol = Extract<SymbolViewProps['name'], string>;

/**
 * Typed icon registry: SF Symbols on iOS, Material Symbols on Android/web (both ship with expo-symbols,
 * zero extra bytes). Add icons one at a time; features reference names only.
 */
export const iconRegistry = {
  home: { ios: 'house.fill', android: 'home' },
  timeline: { ios: 'list.bullet.rectangle.portrait', android: 'view_timeline' },
  health: { ios: 'cross.case.fill', android: 'health_and_safety' },
  report: { ios: 'doc.text.fill', android: 'description' },
  settings: { ios: 'gearshape.fill', android: 'settings' },
  breast: { ios: 'heart.fill', android: 'favorite' },
  bottle: { ios: 'waterbottle.fill', android: 'local_drink' },
  solid: { ios: 'fork.knife', android: 'restaurant' },
  diaper: { ios: 'drop.fill', android: 'baby_changing_station' },
  sleep: { ios: 'moon.zzz.fill', android: 'bedtime' },
  baby: { ios: 'figure.and.child.holdinghands', android: 'child_care' },
  blood: { ios: 'drop.circle.fill', android: 'bloodtype' },
  lab: { ios: 'testtube.2', android: 'science' },
  pdf: { ios: 'doc.richtext', android: 'picture_as_pdf' },
  add: { ios: 'plus', android: 'add' },
  back: { ios: 'chevron.left', android: 'chevron_left' },
  forward: { ios: 'chevron.right', android: 'chevron_right' },
  close: { ios: 'xmark', android: 'close' },
  check: { ios: 'checkmark', android: 'check' },
  delete: { ios: 'trash', android: 'delete' },
  pause: { ios: 'pause.fill', android: 'pause' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  stop: { ios: 'stop.fill', android: 'stop' },
  swap: { ios: 'arrow.left.arrow.right', android: 'swap_horiz' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  calendar: { ios: 'calendar', android: 'calendar_today' },
  clock: { ios: 'clock', android: 'schedule' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart' },
  info: { ios: 'info.circle', android: 'info' },
  edit: { ios: 'pencil', android: 'edit' },
  history: { ios: 'clock.arrow.circlepath', android: 'history' },
  person: { ios: 'person.fill', android: 'person' },
  palette: { ios: 'paintpalette.fill', android: 'palette' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  lock: { ios: 'lock.fill', android: 'lock' },
  ruler: { ios: 'ruler.fill', android: 'straighten' },
  syringe: { ios: 'syringe.fill', android: 'vaccines' },
  pill: { ios: 'pills.fill', android: 'medication' },
  bell: { ios: 'bell.fill', android: 'notifications' },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof iconRegistry;
