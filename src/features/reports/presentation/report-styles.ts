/**
 * Print stylesheet for the PDF. Print output is not themed (always light, high contrast);
 * colors mirror the light semantic tokens so the report matches the app.
 */
export const REPORT_CSS = `
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2328; font-size: 11px; line-height: 1.45; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0F766E; padding-bottom: 10px; margin-bottom: 16px; }
  .brand { color: #0F766E; font-weight: 700; font-size: 13px; letter-spacing: .5px; }
  h1 { font-size: 22px; margin: 2px 0 0; }
  h2 { font-size: 14px; margin: 22px 0 8px; padding-left: 8px; border-left: 4px solid #0F766E; page-break-after: avoid; }
  h2.feeding { border-color: #C2410C; } h2.diaper { border-color: #946000; } h2.sleep { border-color: #4F46E5; } h2.labs { border-color: #15803D; } h2.growth { border-color: #4F46E5; } h2.meds { border-color: #0B63C5; }
  .meta { display: grid; grid-template-columns: auto auto; gap: 2px 14px; text-align: right; color: #545D68; }
  .meta b { color: #1F2328; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .card { border-radius: 10px; padding: 10px; background: #F7F5F2; }
  .card .label { color: #545D68; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }
  .card .value { font-size: 18px; font-weight: 700; margin-top: 2px; }
  .card .sub { color: #545D68; font-size: 10px; }
  .card.feeding { background: #FDE7DD; } .card.diaper { background: #FEF3C7; } .card.sleep { background: #E0E7FF; } .card.labs { background: #DCFCE7; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { text-align: left; font-size: 10px; color: #545D68; text-transform: uppercase; letter-spacing: .3px; border-bottom: 1px solid #D5D0C8; padding: 6px 6px; }
  td { border-bottom: 1px solid #E7E3DD; padding: 5px 6px; vertical-align: top; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  tfoot td { font-weight: 700; border-top: 1px solid #8F8A82; border-bottom: none; }
  .day { background: #EFECE7; font-weight: 700; }
  .pill { display: inline-block; padding: 1px 7px; border-radius: 999px; font-size: 10px; background: #EFECE7; }
  .pill.warning { background: #FFF1CC; color: #6B4600; } .pill.success { background: #DDF4E4; color: #135C28; }
  .muted { color: #6A7380; }
  .lab-title { font-weight: 700; margin-top: 10px; }
  footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #E7E3DD; color: #6A7380; font-size: 9.5px; }
`;
