'use client';

import dynamic from 'next/dynamic';

const PDFDownloadClient = dynamic(() => import('@/components/ui/PDFDownloadClient'), {
  ssr: false,
});

export default function Home() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, '0');

  const filename = `work-permit_${now.getFullYear()}-${pad(
    now.getMonth() + 1
  )}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(
    now.getMinutes()
  )}-${pad(now.getSeconds())}.pdf`;

  console.log(filename);

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

  return (
    <div>
      <h1>PDF Example</h1>
      <PDFDownloadClient filename={filename} documentData={documentData}>
        PDF yuklab olish
      </PDFDownloadClient>
    </div>
  );
}
