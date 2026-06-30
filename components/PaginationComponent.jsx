'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Props:
 *   page        – joriy sahifa (1-dan boshlangan)
 *   totalPages  – jami sahifalar soni
 *   totalCount  – jami yozuvlar soni
 *   limit       – sahifadagi yozuvlar soni
 *   onChange    – (newPage: number) => void
 *   className   – qo'shimcha class (ixtiyoriy)
 */
const PaginationComponent = ({ page, totalPages, totalCount, limit, onChange, className = '' }) => {
  if (!totalPages || totalPages <= 1) return null;

  const offset = (page - 1) * limit;
  const from = offset + 1;
  const to = Math.min(offset + limit, totalCount);

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 ${className}`}>
      {/* Info */}
      <span className="text-[13px] text-[#7B8499] dark:text-slate-400 select-none">
        {from}–{to} / {totalCount} ta
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7B8499] dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Pages */}
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-[13px] text-[#7B8499] dark:text-slate-500 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-all ${
                page === p
                  ? 'bg-[#3b82f6] text-white border border-[#3b82f6]'
                  : 'border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7B8499] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7B8499] dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default PaginationComponent;
