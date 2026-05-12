'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const PDFDownloadClient = dynamic(() => import('@/components/ui/PDFDownloadClient'), {
  ssr: false,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Home() {
  const [permits, setPermits] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const filename = `work-permit_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.pdf`;

  const documentData = {
    title: 'INDUSTRIAL ARCHITECT CMS',
    subtitle: 'UNIT 04 CONTROL • PRIMARY GRID',
    permitNumber: 'WORK PERMIT #PTW-2023-08942',
    docHash: 'DOCUMENT HASH: 4F2A-9X77-L10',
    workOrder: [
      { label: 'PRIORITY', value: 'HIGH / IMMEDIATE', highlight: true },
      { label: 'VALID FROM', value: '24 OCT 2023 08:00' },
      { label: 'VALID UNTIL', value: '24 OCT 2023 20:00' },
      { label: 'SCOPE', value: 'HV TRANSFORMER MAINTENANCE & FLUID CHECK' },
    ],
    equipment: [
      { label: 'ASSET ID', value: 'U04-TR-0012' },
      { label: 'LOCATION', value: 'SUBSTATION ALPHA - SECTOR 4' },
      { label: 'VOLTAGE CLASS', value: '400 KV' },
      { label: 'COOLING SYSTEM', value: 'ONAF (FORCED AIR)' },
    ],
    team: [
      { name: 'M. J. Petrovich (ID: 4421)', role: 'Lead Electrician', cert: true },
      { name: 'S. O. Kostic (ID: 9012)', role: 'Safety Observer', cert: true },
      { name: 'A. R. Miller (ID: 1104)', role: 'HV Technician', cert: true },
    ],
    checklist: [
      'LOTO (LOCK OUT TAG OUT) VERIFIED',
      'ARC FLASH PPE CONFIRMED',
      'EARTHING STICKS GROUNDED',
      'EXCLUSION ZONE BARRIERS SET',
    ],
    blitzQuestions: [
      { q: 'Q1: IS THE BACKUP GENERATOR ISOLATED?', a: 'YES [ ]   NO [ ]' },
      { q: 'Q2: LAST CALIBRATION OF GAS MONITOR?', a: '' },
      { q: 'Q3: ANY HAZARDOUS WEATHER PREDICTED?', a: 'YES [ ]   NO [ ]' },
    ],
    signatures: [
      { role: 'SAFETY CONTROLLER', name: 'H. VARGAS' },
      { role: 'CHTS REP.', name: 'K. IVANOV' },
      { role: 'PROJECT SUPERVISOR', name: 'L. CHEN' },
      { role: 'PLANT MANAGER', name: 'D. FOSTER' },
    ],
  };

  // Sahifa ochilganda va yangi PDF saqlanganda ro'yxatni yuklash
  async function getAllPermits() {
    setLoadingList(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/permits`);
      const data = await res.json();
      setPermits(data);
    } catch (error) {
      console.error("Ro'yxatni olishda xato:", error);
    } finally {
      setLoadingList(false);
    }
  }

  async function deletePermit(id, filename) {
    if (!confirm(`"${filename}" o'chirilsinmi?`)) return;
    try {
      await fetch(`${BACKEND_URL}/api/permits/${id}`, { method: 'DELETE' });
      setPermits((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("O'chirishda xato:", error);
    }
  }

  useEffect(() => {
    getAllPermits();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>PDF Example</h1>

      <PDFDownloadClient
        filename={filename}
        documentData={documentData}
        onSaved={getAllPermits} // saqlangandan keyin ro'yxatni yangilash
      >
        PDF yuklab olish
      </PDFDownloadClient>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Barcha filelar</h2>
          <button onClick={getAllPermits} disabled={loadingList}>
            {loadingList ? 'Yuklanmoqda...' : 'Yangilash'}
          </button>
        </div>

        {permits.length === 0 ? (
          <p style={{ color: '#888' }}>Hozircha fayl yo'q</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0D1B2A', color: '#fff' }}>
                <th style={th}>T/R</th>
                <th style={th}>Fayl nomi</th>
                <th style={th}>Sana</th>
                <th style={th}>Link</th>
                <th style={th}>O'chirish</th>
              </tr>
            </thead>
            <tbody>
              {permits.map((permit, index) => (
                <tr key={permit._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>{permit.filename}</td>
                  <td style={td}>{new Date(permit.createdAt).toLocaleString('uz-UZ')}</td>
                  <td style={td}>
                    <a
                      href={permit.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#F4821F' }}
                    >
                      Ochish
                    </a>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => deletePermit(permit._id, permit.filename)}
                      style={{
                        color: 'red',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const th = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '16px',
  letterSpacing: '0.5px',
};

const td = {
  padding: '12px 14px',
  fontSize: '16px',
};
