'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import QRCode from 'qrcode';

const PDFDownloadClient = dynamic(() => import('@/components/ui/PDFDownloadClient'), {
  ssr: false,
});

const documentData = {
  title: 'Work Permit #PTW-2023-08942',
  rows: [
    { label: 'Priority', value: 'HIGH / IMMEDIATE' },
    { label: 'Valid From', value: '24 OCT 2023 08:00' },
    { label: 'Valid Until', value: '24 OCT 2023 20:00' },
    { label: 'Scope', value: 'HV TRANSFORMER MAINTENANCE & FLUID CHECK' },
  ],
};

export default function Home() {
  const [savedUrl, setSavedUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [saving, setSaving] = useState(false);
  const filename = `work-permit-${new Date().toISOString().slice(0, 10)}.pdf`;

  async function savePdfOnServer() {
    setSaving(true);

    try {
      const response = await fetch('/api/permits/save-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentData, filename }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'PDF save failed');

      const absoluteUrl = `${window.location.origin}${result.url}`;
      setSavedUrl(absoluteUrl);
      setQrCode(await QRCode.toDataURL(absoluteUrl));
    } catch (error) {
      console.error(error);
      setQrCode('');
      setSavedUrl('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>PDF Example</h1>

      <PDFDownloadClient filename={filename} documentData={documentData}>
        PDF yuklab olish
      </PDFDownloadClient>

      <button
        type="button"
        onClick={savePdfOnServer}
        disabled={saving}
        style={{ marginTop: '1rem' }}
      >
        {saving ? 'Saqlanmoqda...' : 'Serverga saqlash va QR kod yaratish'}
      </button>

      {savedUrl && (
        <div style={{ marginTop: '1rem' }}>
          <p>Saqlangan PDF manzili:</p>
          <a href={savedUrl} target="_blank" rel="noreferrer">
            {savedUrl}
          </a>
        </div>
      )}

      {qrCode && (
        <div style={{ marginTop: '1rem' }}>
          <p>QR kodni skanerlash bilan ushbu fayl ochiladi:</p>
          <img src={qrCode} alt="PDF QR code" width={220} height={220} />
        </div>
      )}
    </div>
  );
}
