'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, MoreVertical } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { qurilmalar, TOTAL, PER_PAGE } from '../data/qurilmalar';

export const holatConfig = {
  XAVFSIZ: {
    label: 'XAYFSIZ',
    className:
      'rounded-[12px] border border-[rgba(16,185,129,0.30)] bg-[rgba(16,185,129,0.10)] text-center text-[#10B981] text-[12px] font-bold uppercase tracking-[-0.25px]',
  },
  MUDDATI_OTGAN: {
    label: "MUDDATI O'TGAN",
    className:
      'rounded-[12px] border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.10)] text-center text-[#EF4444] text-[12px] font-bold uppercase tracking-[-0.25px]',
  },
  TEKSHIRUVDA: {
    label: 'TEKSHIRUVDA',
    className:
      'rounded-[12px] border border-[rgba(250,204,21,0.30)] bg-[rgba(250,204,21,0.10)] text-center text-[#855300] text-[12px] font-bold uppercase tracking-[-0.25px]',
  },
  TAMIRTALAB: {
    label: "TA'MIRTALAB",
    className:
      'rounded-[12px] border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.10)] bg-pink-100 text-pink-800 hover:bg-pink-200',
  },
};

export default function QurilmalarTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(TOTAL / PER_PAGE);

  const start = (currentPage - 1) * PER_PAGE + 1;
  const end = Math.min(currentPage * PER_PAGE, TOTAL);

  const startIdx = (currentPage - 1) * PER_PAGE;
  const endIdx = startIdx + PER_PAGE;
  const currentData = qurilmalar.slice(startIdx, endIdx);

  return (
    <div className="w-full ">
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900 py-4">
            <TableRow className="border-slate-200 hover:bg-slate-900 ">
              <TableHead className="text-white font-bold text-xs tracking-wider pl-4">№</TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                QURILMA NOMI
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                RO'YXAT RAQAMI
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                ZAVOD RAQAMI
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                JOYLASHUV
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                OXIRGI SINOV
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">
                KEYINGI SINOV
              </TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider">HOLAT</TableHead>
              <TableHead className="text-white font-bold text-xs tracking-wider text-right pr-4">
                AMALLAR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((q) => (
              <TableRow key={q.id} className="hover:bg-slate-50 py-5">
                <TableCell className="font-mono text-[14px] text-slate-600 pl-4">{q.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{q.nomi}</TableCell>
                <TableCell className="font-mono text-[14px] text-slate-700">
                  {q.royxatRaqami}
                </TableCell>
                <TableCell className="font-mono text-[14px] text-slate-700">
                  {q.zavodRaqami}
                </TableCell>
                <TableCell className="text-[14px] text-slate-700">{q.joylashuv}</TableCell>
                <TableCell className="font-mono text-[14px] text-slate-700">
                  {q.oxirgiSinov}
                </TableCell>
                <TableCell
                  className={`font-mono text-[14px] font-medium ${
                    q.holat === 'MUDDATI_OTGAN' ? 'text-red-600' : 'text-slate-700'
                  }`}
                >
                  {q.keyingiSinov}
                </TableCell>
                <TableCell>
                  <Badge
                    className={holatConfig[q.holat]?.className || 'text-red-500'}
                    onClick={() => console.log(holatConfig[q.holat]?.label)}
                  >
                    {holatConfig[q.holat]?.label || q.holat}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('view:', q.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('edit:', q.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('menu:', q.id)}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
          <p className="text-[14px] text-slate-600">
            Ko'rsatilyapti{' '}
            <span className="font-medium">
              {start}–{end}
            </span>{' '}
            dan <span className="font-medium">{TOTAL}</span> ta qurilma
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  totalPages <= 5 ||
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (Math.abs(page - currentPage) === 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
