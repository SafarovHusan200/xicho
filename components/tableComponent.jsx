'use client';

import React from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  SquareArrowOutUpRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const BooleanBadge = ({ value }) => {
  const t = useTranslations('common');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap ${
        value
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
          : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-red-400'}`} />
      {value ? t('yes') : t('no')}
    </span>
  );
};

const formatValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') {
    return <BooleanBadge value={value} />;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  return value;
};

const TableComponent = ({
  column = [],
  data = [],
  onEdit,
  handleDelete,
  viewHref,
  rowClassName,
  expandedRowIds,
  onToggleExpand,
  renderExpanded,
}) => {
  const t = useTranslations('common');
  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#EEF0F4] dark:border-slate-700/40 bg-[#F8F9FB] dark:bg-slate-800/60">
            {column.map((col, i) => (
              <th
                key={col.key}
                className={`py-3.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#7B8499] dark:text-slate-500 whitespace-nowrap ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                } ${i === 0 ? 'pl-6' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F0F1F5] dark:divide-slate-700/30">
          {data.map((row, index) => {
            const rowId = row.id ?? index;
            const isExpanded = renderExpanded && expandedRowIds?.has(rowId);
            return (
              <React.Fragment key={rowId}>
                <motion.tr
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.1, 2),
                    ease: 'easeOut',
                  }}
                  className={`group hover:bg-[#F8FAFF] dark:hover:bg-slate-700/20 transition-colors duration-150 ${rowClassName?.(row) ?? ''}`}
                >
                  {column.map((col, i) => {
                    if (col.key === 'expand') {
                      return (
                        <td key="expand" className={`px-5 py-4 ${i === 0 ? 'pl-6' : ''}`}>
                          <button
                            type="button"
                            onClick={() => onToggleExpand?.(row)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] dark:border-slate-700 text-[#7B8499] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-150"
                          >
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        </td>
                      );
                    }

                    if (col.key === 'action') {
                      return (
                        <td key="action" className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {viewHref && (
                              <Link
                                href={viewHref(row)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400  hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-150"
                                title={t('view')}
                              >
                                <SquareArrowOutUpRight size={15} />
                              </Link>
                            )}
                            <button
                              onClick={() => onEdit?.(row)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 dark:border-orange-800/70 bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400  hover:bg-orange-100 dark:hover:bg-orange-900/60 hover:text-orange-600 dark:hover:text-orange-300 transition-all duration-150"
                              title={t('edit')}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete?.(row)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 dark:border-red-800/70 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400  hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-600 dark:hover:text-red-300 transition-all duration-150"
                              title={t('delete')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        className={`py-4 px-5 text-[14px] font-medium text-[#3C4043] dark:text-slate-300 whitespace-nowrap ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        } ${i === 0 ? 'pl-6 text-[#031634] dark:text-slate-100 font-semibold' : ''}`}
                      >
                        {formatValue(row[col.key])}
                      </td>
                    );
                  })}
                </motion.tr>
                {renderExpanded && (
                  <tr>
                    <td colSpan={column.length} className="p-0 border-0">
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="expanded"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden  dark:bg-slate-800/40"
                          >
                            <div className="px-5">{renderExpanded(row)}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
