'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Pencil, List } from 'lucide-react';

const devices = [
  {
    id: '#PV-9012',
    name: 'Bosim idishi (P-200)',
    serial: 'SN-882910',
    date: '12.06.2024',
    status: 'YAQINLASHMOQDA',
    statusColor: 'bg-[#FFF4E5] text-[#F59E0B] border border-[#FCD9A4]',
  },
  {
    id: '#EL-4431',
    name: 'Lift (Bino-A)',
    serial: 'SN-002139',
    date: '15.06.2024',
    status: 'SHOSHILINCH',
    statusColor: 'bg-[#FFF1E8] text-[#F97316] border border-[#FDBA8C]',
  },
  {
    id: '#CR-1102',
    name: 'Minorali kran (K-10)',
    serial: 'SN-998122',
    date: '05.06.2024',
    status: "MUDDATI O'TGAN",
    statusColor: 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]',
  },
  {
    id: '#CP-0055',
    name: 'Kompressor stansiyasi',
    serial: 'SN-114455',
    date: '28.06.2024',
    status: 'XAVFSIZ',
    statusColor: 'bg-[#ECFDF3] text-[#10B981] border border-[#A7F3D0]',
  },
];

const TableComponent = () => {
  return (
    <div className="overflow-hidden   bg-white">
      <Table>
        <TableHeader className="bg-[#F5F7FA]">
          <TableRow className="hover:bg-[#F5F7FA] border-b border-[#E5E7EB]">
            <TableHead className="h-18 pl-5 text-[#031634] text-[15px] font-semibold">
              ID raqami
            </TableHead>

            <TableHead className="text-[#031634] text-[15px] font-semibold">Qurilma nomi</TableHead>

            <TableHead className="text-[#031634] text-[15px] font-semibold">Zavod raqami</TableHead>

            <TableHead className="text-[#031634] text-[15px] font-semibold">
              Rejalashtirilgan sana
            </TableHead>

            <TableHead className="text-[#031634] text-[15px] font-semibold">Holat</TableHead>

            <TableHead className="text-right text-[#031634] text-[15px] pr-5 font-semibold">
              Amallar
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {devices.map((device, index) => (
            <TableRow key={index} className="h-20 border-b border-[#E5E7EB] hover:bg-[#FAFAFA]">
              <TableCell className="text-[#202124] text-[16px] pl-5 font-semibold">
                {device.id}
              </TableCell>

              <TableCell className="text-[#3C4043] text-[16px] font-medium">
                {device.name}
              </TableCell>

              <TableCell className="text-[#5F6368] text-[16px] font-medium">
                {device.serial}
              </TableCell>

              <TableCell className="text-[#3C4043] text-[16px] font-semibold">
                {device.date}
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-[12px] font-semibold ${device.statusColor}`}
                >
                  {device.status}
                </span>
              </TableCell>

              <TableCell className="pr-5">
                <div className="flex items-center justify-end gap-3 text-[#031634]">
                  <button className="cursor-pointer">
                    <List size={18} />
                  </button>

                  <button className="cursor-pointer">
                    <Pencil size={18} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;
