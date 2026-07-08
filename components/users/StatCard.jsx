'use client';

import React from 'react';
import CountUp from 'react-countup';

const StatCard = ({ label, value, color, icon: Icon, iconColor }) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-3 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-md font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
        {label}
      </span>
      {Icon && (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      )}
    </div>
    <span className={`text-3xl font-bold ${color ?? 'text-[#031634] dark:text-slate-100'}`}>
      <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />
    </span>
  </div>
);

export default StatCard;
