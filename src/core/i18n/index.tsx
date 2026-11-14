import { createContext, use, type ReactNode } from 'react';

import { en } from './locales/en';
import { tr, type Dictionary } from './locales/tr';

export type Locale = 'tr' | 'en';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Every valid translation key, e.g. `today.title`. Typos fail typecheck. */
export type TKey = Leaves<Dictionary>;
export type TParams = Record<string, string | number>;
export type Translate = (key: TKey, params?: TParams) => string;

const dictionaries: Record<Locale, Dictionary> = { tr, en };
const intlTags: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' };

function lookup(dict: Dictionary, key: string): string {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    node = typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined;
  }
  return typeof node === 'string' ? node : key;
}

export function translate(locale: Locale, key: TKey, params?: TParams): string {
  const template = lookup(dictionaries[locale], key);
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name] ?? ''));
}

export type I18n = { locale: Locale; intlTag: string; t: Translate };

export function createI18n(locale: Locale): I18n {
  return { locale, intlTag: intlTags[locale], t: (key, params) => translate(locale, key, params) };
}

const I18nContext = createContext<I18n>(createI18n('tr'));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext value={createI18n(locale)}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  return use(I18nContext);
}
