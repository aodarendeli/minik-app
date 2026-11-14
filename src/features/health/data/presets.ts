import type { LabPreset } from '../domain';

/** Templates fill value names and units only. The app never ships reference ranges (PRODUCT.md copy rules). */
export const LAB_PRESETS: readonly LabPreset[] = [
  {
    key: 'cbc',
    category: 'blood',
    title: 'Tam kan sayımı',
    analytes: [
      { analyte: 'Hemoglobin', unit: 'g/dL' },
      { analyte: 'Hematokrit', unit: '%' },
      { analyte: 'WBC', unit: '10³/µL' },
      { analyte: 'Trombosit', unit: '10³/µL' },
    ],
  },
  {
    key: 'bilirubin',
    category: 'blood',
    title: 'Sarılık (bilirubin)',
    analytes: [
      { analyte: 'Total bilirubin', unit: 'mg/dL' },
      { analyte: 'Direkt bilirubin', unit: 'mg/dL' },
      { analyte: 'Transkutan bilirubin (cilt ölçümü)', unit: 'mg/dL' },
    ],
  },
  {
    key: 'iron',
    category: 'blood',
    title: 'Demir / Ferritin',
    analytes: [
      { analyte: 'Ferritin', unit: 'ng/mL' },
      { analyte: 'Serum demir', unit: 'µg/dL' },
    ],
  },
  {
    key: 'vitd',
    category: 'blood',
    title: 'D vitamini',
    analytes: [{ analyte: 'D vitamini (25-OH)', unit: 'ng/mL' }],
  },
  {
    key: 'urine',
    category: 'urine',
    title: 'Tam idrar tahlili',
    analytes: [
      { analyte: 'Dansite', unit: '' },
      { analyte: 'pH', unit: '' },
    ],
  },
];
