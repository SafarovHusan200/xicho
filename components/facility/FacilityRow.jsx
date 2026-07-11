'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { getUnitCodeName } from '@/constants/unit_codes';
import Link from 'next/link';

const FacilityRow = ({
  facility,
  children = [],
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  locale,
  isChild = false,
}) => {
  const hasChildren = children.length > 0;
  const color = isChild ? '#f59e0b' : '#3b82f6';
  const officialName = getUnitCodeName(facility.unit_code, locale);
  const showOfficialName = officialName && officialName !== facility.unit_code;

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => onToggle?.(facility?.id)}
        className={`flex items-center justify-between gap-3 rounded-xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm ${hasChildren && 'cursor-pointer'} ${isChild ? 'ml-8' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            {isChild ? (
              <LayoutGrid size={18} style={{ color }} />
            ) : (
              <Building2 size={18} style={{ color }} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 truncate">
              {facility.name}
            </span>
            <span className="text-[13px] text-[#94a3b8] truncate">
              <span className="font-mono">{facility.unit_code}</span>
              {showOfficialName && ` · ${officialName}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isChild && (
            <button
              onClick={() => onAddChild(facility)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-150"
              title="Bo'linma qo'shish"
            >
              <Plus size={15} />
            </button>
          )}
          <Link
            href={`/dashboard/facility/${facility.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400  hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-150"
            title="Ko'rish"
          >
            <SquareArrowOutUpRight size={15} />
          </Link>
          <button
            onClick={() => onEdit(facility)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 dark:border-orange-800/70 bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 hover:text-orange-600 dark:hover:text-orange-300 transition-all duration-150"
            title="Tahrirlash"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(facility)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 dark:border-red-800/70 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-600 dark:hover:text-red-300 transition-all duration-150"
            title="O'chirish"
          >
            <Trash2 size={15} />
          </button>
          {!isChild && hasChildren && (
            <button
              // onClick={() => onToggle(facility.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(197,198,207,0.40)] dark:border-slate-700/60 text-[#7B8499] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-150"
              title={expanded ? "Yig'ish" : 'Yoyish'}
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {!isChild && hasChildren && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="children"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 mb-1">
                {children.map((child) => (
                  <FacilityRow
                    key={child.id}
                    facility={child}
                    isChild
                    locale={locale}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default FacilityRow;
