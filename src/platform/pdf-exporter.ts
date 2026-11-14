import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { ReportDocument, ReportExporter } from '@/features/reports/domain';

/**
 * Renders report HTML to an A4 PDF and opens the system share sheet.
 * Web has no file share: the browser print dialog is used instead (user can "Save as PDF").
 */
export const expoPdfExporter: ReportExporter = {
  async exportPdf(doc: ReportDocument) {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html: doc.html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html: doc.html, width: 595, height: 842 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: doc.title });
    } else {
      await Print.printAsync({ uri });
    }
  },
};
