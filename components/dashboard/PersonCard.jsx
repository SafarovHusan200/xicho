'use client';

import React from 'react';

/* ── Person avatar card ──────────────────────────────────── */
function PersonCard({
  name,
  facility,
  orderNo,
  endDate,
  isInspector,
  isMain,
  inspectorLabel,
  mainLabel,
  untilLabel,
}) {
  const initials =
    name && name !== '-'
      ? name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '?';
  const colors = ['#3b82f6', '#10B981', '#8b5cf6', '#f59e0b', '#ec4899'];
  const color = colors[name.charCodeAt(0) % colors.length] ?? '#3b82f6';

  return (
    <div className="flex   items-center gap-3 p-2 rounded-xl border border-[rgba(197,198,207,0.18)] dark:border-slate-700/30 bg-[rgba(255,255,255,0.6)] dark:bg-slate-700/20">
      {/* avatar */}
      <div
        className=" h-9 w-9 hidden 2xl:flex items-center justify-center rounded-full shrink-0 text-white text-[13px] font-bold"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 leading-tight truncate">
          {name}
        </span>
        <span className="text-[11px] text-[#7B8499] truncate">{facility}</span>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex gap-1">
          {isInspector && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              {inspectorLabel}
            </span>
          )}
          {isMain && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              {mainLabel}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#94a3b8]">#{orderNo}</span>
      </div>
    </div>
  );
}

export default PersonCard;
