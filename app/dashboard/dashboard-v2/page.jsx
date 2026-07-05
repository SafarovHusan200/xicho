'use client';
import React from 'react';
import { ChartAreaInteractive } from '@/components/chartAreaInteractive';
import { ChartPieDonutText } from '@/components/chartPieDonutText';
import StatsComponent from '@/components/statsComponent';
import Link from 'next/link';
import useFacilityStore from '@/store/useFacilityStore';
import { useTranslations } from 'next-intl';

const DashboardPage = () => {
  // faqat kerakli qismni oling (re-render optimallashtirish uchun)
  const facilities = useFacilityStore((s) => s.facilities);
  const t = useTranslations('dashboard');

  return (
    <div className="">
      <h2 className="title text-[#031634] dark:text-slate-100 text-[32px] font-bold leading-10 tracking-[-0.64px]">
        {t('title')}
      </h2>
      <p className="text-[#44474E] dark:text-slate-400 text-[16px] font-normal leading-6 mb-6">
        {t('subtitle')}
      </p>

      {/* Stats */}
      <StatsComponent />

      {/* Charts */}
      <div className="w-full flex flex-wrap gap-6 md:gap-8 mb-8">
        <ChartPieDonutText />
        <ChartAreaInteractive />
      </div>

      {/* Table */}
      <div className="w-full rounded-[12px] border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex justify-between px-8 py-6 bg-white dark:bg-slate-800/80 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40">
          <h2 className="text-[#031634] dark:text-slate-100 text-[18px] font-semibold">
            {t('scheduledTests')}
          </h2>
          <Link href={'/dashboard/calendar'} className="flex items-center gap-2">
            <span className="text-[#031634] dark:text-slate-300 text-center text-[14px] font-semibold leading-4 tracking-[0.6px]">
              {t('viewAll')}
            </span>
            <img src="/icons/arrow.svg" alt="icon" className="dark:invert dark:opacity-60" />
          </Link>
        </div>
        {/* <TableComponent
          data={null}
          onEdit={(device) => console.log('edit', device)}
          onDetail={(device) => console.log('detail', device)}
        /> */}
      </div>
    </div>
  );
};

export default DashboardPage;
