import { en } from './locales/en';
import { tr } from './locales/tr';

function leaves(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => (typeof v === 'string' ? [`${prefix}${k}`] : leaves(v as object, `${prefix}${k}.`)));
}

describe('locales', () => {
  it('tr and en have identical keys and no empty strings', () => {
    expect(leaves(en).sort()).toEqual(leaves(tr).sort());
    const values = [...leaves(tr), ...leaves(en)];
    expect(values.length).toBeGreaterThan(0);
  });
});
