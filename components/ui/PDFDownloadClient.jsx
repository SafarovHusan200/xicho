'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';

export default function PDFDownloadClient({ children, filename = 'my-file.pdf', documentData }) {
  return (
    <PDFDownloadLink document={<MyDocument data={documentData} />} fileName={filename}>
      {({ loading }) => (loading ? 'PDF tayyorlanmoqda...' : children)}
    </PDFDownloadLink>
  );
}
