'use client';

import { pdf } from '@react-pdf/renderer';
import MyDocument from '@/components/ui/MyDocument';
import QRCode from 'qrcode';
import { useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://unit-control.maktab16.uz';

export default function PDFDownloadClient({ children, filename = 'my-file', documentData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);

    try {
      // 1. Fayl nomi
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const fileEnd = `${filename}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.pdf`;
      const safeFilename = fileEnd.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const serverFilename = `${safeFilename}`;

      // 2. Oldindan URL yasash
      const absoluteUrl = `${BACKEND_URL}/pdfs/${serverFilename}`;

      // 3. URL dan QR yaratish
      const qrDataUrl = await QRCode.toDataURL(absoluteUrl);

      // 4. QR bilan documentData
      const dataWithQr = { ...documentData, qrCode: qrDataUrl };

      // 5. PDF blob yaratish
      const blob = await pdf(<MyDocument data={dataWithQr} />).toBlob();

      // 6. Backendga PDF faylni yuklash
      await fetch(`${BACKEND_URL}/api/permits/upload-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'x-filename': serverFilename,
        },
        body: blob,
      });

      // 7. MongoDB ga meta ma'lumot saqlash
      await fetch(`${BACKEND_URL}/api/permits/save-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentData: dataWithQr, serverFilename }),
      });

      // 8. Foydalanuvchiga yuklab berish
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
    <div type="button" onClick={handleDownload} disabled={loading}>
      {loading ? 'Tayyorlanmoqda...' : children}
    </div>
  );
}
