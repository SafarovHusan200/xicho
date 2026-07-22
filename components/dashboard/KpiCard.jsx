'use client';

import React from 'react';
import CountUp from 'react-countup';

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = ({ w = 'w-14', h = 'h-10' }) => (
  <span
    className={`inline-block ${w} ${h} animate-pulse rounded-xl bg-white/40 dark:bg-slate-700`}
  />
);

/* ── KPI Card (gradient bg) ──────────────────────────────── */
function KpiCard({ icon: Icon, color, bg, label, value, sub, isLoading, alert }) {
  return (
    <div
      className={`relative flex flex-col gap-1 rounded-2xl px-3 py-2 xl:px-5 xl:py-4 overflow-hidden shadow-sm ${bg}`}
    >
      <div className="relative flex items-center justify-between">
        <span className="text-[14px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>

        {/* icon with optional ping rings */}
        <div className="relative h-10 w-10 shrink-0">
          {alert && (
            <>
              <span
                className="absolute inset-0 rounded-xl animate-ping"
                style={{ backgroundColor: `${color}35`, animationDuration: '1.6s' }}
              />
              <span
                className="absolute inset-0 rounded-xl animate-ping"
                style={{
                  backgroundColor: `${color}20`,
                  animationDuration: '1.6s',
                  animationDelay: '0.5s',
                }}
              />
            </>
          )}
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}25` }}
          >
            <Icon size={18} style={{ color }} className={alert ? 'animate-pulse' : ''} />
          </div>
        </div>
      </div>

      <span className="relative text-[36px] font-bold leading-none text-[#031634] dark:text-slate-100">
        {isLoading ? <Skel /> : <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />}
      </span>
      {sub && (
        <p className="relative text-[12px]  font-medium" style={{ color: `${color}cc` }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default KpiCard;
