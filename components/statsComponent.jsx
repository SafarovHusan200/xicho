'use client';

import React from 'react';
import CountUp from 'react-countup';
import { useTranslations } from 'next-intl';
import { Monitor, CheckCircle2, Clock, XCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, iconColor, bg, label, value, sub, isLoading }) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
        {label}
      </span>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
    </div>
    <span className="text-[32px] font-bold leading-none text-[#031634] dark:text-slate-100">
      {isLoading ? (
        <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      ) : (
        <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />
      )}
    </span>
    {sub && <p className="text-[12px] text-[#7B8499] dark:text-slate-500 leading-snug">{sub}</p>}
  </div>
);

const StatsComponent = ({ data, isLoading }) => {
  const t = useTranslations('dashboard');

  const passRate =
    data && data.tests.total_logged > 0
      ? Math.round((data.tests.passed_on_time / data.tests.total_logged) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-6">
      <StatCard
        icon={Monitor}
        iconColor="#3b82f6"
        bg="#3b82f618"
        label={t('devicesCard')}
        value={data?.devices.total}
        isLoading={isLoading}
        sub={`${data?.devices.active ?? 0} ${t('devicesActive')} · ${data?.devices.inactive ?? 0} ${t('devicesInactive')}`}
      />
      <StatCard
        icon={CheckCircle2}
        iconColor="#10B981"
        bg="#10B98118"
        label={t('testsPassed')}
        value={data?.tests.passed_on_time}
        isLoading={isLoading}
        sub={`${passRate}% — ${data?.tests.total_logged ?? 0} ${t('testsTotal')}`}
      />
      <StatCard
        icon={Clock}
        iconColor="#f59e0b"
        bg="#f59e0b18"
        label={t('expiringCard')}
        value={data?.expiring_soon.count}
        isLoading={isLoading}
        sub={t('sectionExpiring')}
      />
      <StatCard
        icon={XCircle}
        iconColor="#ef4444"
        bg="#ef444418"
        label={t('overdueCard')}
        value={data?.overdue.count}
        isLoading={isLoading}
        sub={t('sectionOverdue')}
      />
    </div>
  );
};

export default StatsComponent;
