export type ReportDocument = { html: string; fileName: string; title: string };

/** Implemented in platform/: renders HTML to a PDF file and opens the share sheet (or print on web). */
export interface ReportExporter {
  exportPdf(doc: ReportDocument): Promise<void>;
}
