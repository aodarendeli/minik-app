import { createI18n } from '@/core/i18n';
import { dayRanges, HOUR_MS, startOfLocalDay } from '@/core/time';
import { build, NOON } from '@/test/builders';

import { buildReport } from '../domain';
import { escapeHtml, renderReportHtml, reportFileName } from './report-html';

describe('report html', () => {
  it('escapes user text and renders selected sections', () => {
    const days = dayRanges(startOfLocalDay(NOON), 1);
    const model = buildReport({
      baby: build.baby({ name: '<script>Ali</script>' }),
      period: 'day',
      days,
      events: [{ ...build.diaper(NOON - HOUR_MS), note: 'a & b' }],
      labs: [],
      sections: ['diaper', 'log'],
      generatedAt: NOON,
    });
    const html = renderReportHtml(model, createI18n('tr'));
    expect(html).not.toContain('<script>Ali');
    expect(html).toContain('&lt;script&gt;Ali');
    expect(html).toContain('a &amp; b');
    expect(html).toContain('Günlük Bakım Raporu');
    expect(html).not.toContain('Uyku (sa)');
    expect(reportFileName(model)).toBe(`script-Ali-script-${days[0]?.date}`);
  });

  it('renders growth (up to the report end) and vaccine/medicine sections', () => {
    const days = dayRanges(startOfLocalDay(NOON), 1);
    const meta = { babyId: 'b1', createdAt: 0, updatedAt: 0, version: 1 };
    const model = buildReport({
      baby: build.baby(),
      period: 'day',
      days,
      events: [],
      labs: [],
      growth: [
        { ...meta, id: 'g1', measuredOn: '2026-10-01', weightKg: 4.1 },
        { ...meta, id: 'g2', measuredOn: '2099-01-01', weightKg: 9 },
      ],
      meds: [{ ...meta, id: 'm1', kind: 'vaccine', name: 'Hepatit <B>', givenOn: '2026-10-05', dose: '0,5 ml', nextOn: '2026-12-05' }],
      sections: ['growth', 'meds'],
      generatedAt: NOON,
    });
    expect(model.growth.map((g) => g.id)).toEqual(['g1']);
    const html = renderReportHtml(model, createI18n('tr'));
    expect(html).toContain('Kilo (kg)');
    expect(html).toContain('4,1');
    expect(html).toContain('Hepatit &lt;B&gt;');
    expect(html).toContain('0,5 ml');
    expect(html).toContain('Aşı');
  });

  it('escapeHtml covers quotes', () => {
    expect(escapeHtml(`"'`)).toBe('&quot;&#39;');
  });
});
