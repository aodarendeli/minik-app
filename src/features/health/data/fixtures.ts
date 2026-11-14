import { addLocalDays, toLocalDate, type Instant } from '@/core/time';

import type { LabResult, LabTest } from '../domain';

type R = Omit<LabResult, 'id'>;

export function demoLabTests(babyId: string, birth: Instant, now: Instant): LabTest[] {
  let n = 0;
  const make = (dayOffset: number, fromNow: boolean, rest: Pick<LabTest, 'category' | 'title' | 'labName'>, results: R[]): LabTest => {
    const at = fromNow ? addLocalDays(now, -dayOffset) : addLocalDays(birth, dayOffset);
    const id = `lab-${++n}`;
    return {
      id,
      babyId,
      takenOn: toLocalDate(at),
      ...rest,
      results: results.map((r, i) => ({ ...r, id: `${id}-r${i}` })),
      createdAt: at,
      updatedAt: at,
      version: 1,
    };
  };
  return [
    make(3, false, { category: 'screening', title: 'Topuk kanı taraması', labName: 'Doğumhane' }, []),
    make(5, false, { category: 'blood', title: 'Bilirubin', labName: 'Merkez Lab' }, [
      { analyte: 'Total bilirubin', value: 11.2, unit: 'mg/dL', refHigh: 12 },
      { analyte: 'Direkt bilirubin', value: 0.4, unit: 'mg/dL', refHigh: 0.6 },
    ]),
    make(60, false, { category: 'blood', title: 'Tam kan sayımı', labName: 'Merkez Lab' }, [
      { analyte: 'Hemoglobin', value: 10.4, unit: 'g/dL', refLow: 9, refHigh: 14 },
      { analyte: 'Hematokrit', value: 31, unit: '%', refLow: 28, refHigh: 42 },
      { analyte: 'WBC', value: 9.8, unit: '10³/µL', refLow: 5, refHigh: 19.5 },
      { analyte: 'Trombosit', value: 350, unit: '10³/µL', refLow: 150, refHigh: 450 },
    ]),
    make(6, true, { category: 'blood', title: 'Tam kan sayımı + Ferritin', labName: 'Merkez Lab' }, [
      { analyte: 'Hemoglobin', value: 10.9, unit: 'g/dL', refLow: 9, refHigh: 14 },
      { analyte: 'Ferritin', value: 45, unit: 'ng/mL', refLow: 25, refHigh: 200 },
      { analyte: 'D vitamini (25-OH)', value: 27, unit: 'ng/mL', refLow: 30, refHigh: 100 },
    ]),
    make(2, true, { category: 'urine', title: 'Tam idrar tahlili', labName: 'Merkez Lab' }, [
      { analyte: 'Dansite', value: 1.005, unit: '', refLow: 1.002, refHigh: 1.03 },
      { analyte: 'pH', value: 6.5, unit: '', refLow: 5, refHigh: 8 },
    ]),
  ];
}
