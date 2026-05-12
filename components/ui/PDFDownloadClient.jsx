'use client';

import { pdf } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';
import QRCode from 'qrcode';
import { useState } from 'react';

export default function PDFDownloadClient({ children, filename = 'my-file.pdf', documentData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);

    try {
      // 1. Fayl nomini oldindan belgilash (UUID bilan)
      const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
      console.log('safeFilename=', safeFilename);
      const serverFilename = `${safeFilename}`;

      const absoluteUrl = `${window.location.origin}/pdfs/${serverFilename}`;

      // 2. URL dan QR yaratish
      const qrDataUrl = await QRCode.toDataURL(absoluteUrl);

      // 3. QR bilan documentData
      const dataWithQr = {
        ...documentData, // barcha fieldlar
        qrCode: qrDataUrl, // QR qo'shiladi
      };

      // 4. Serverga BIR MARTA saqlash
      const saveRes = await fetch('/api/permits/save-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentData: dataWithQr, serverFilename }),
      });

      if (!saveRes.ok) throw new Error('Saqlashda xato');

      // 5. Foydalanuvchiga yuklab berish
      const blob = await pdf(<MyDocument data={dataWithQr} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleDownload} disabled={loading}>
      {loading ? 'Tayyorlanmoqda...' : children}
    </button>
  );
}
