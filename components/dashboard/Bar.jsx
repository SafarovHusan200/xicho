'use client';

import React from 'react';

/* ── Progress bar ────────────────────────────────────────── */
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1.5 text-[#44474E] dark:text-slate-400">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="font-semibold text-[#031634] dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default Bar;
