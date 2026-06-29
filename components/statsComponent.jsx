'use client';

import React from 'react';
import CountUp from 'react-countup';
import { useTranslations } from 'next-intl';

const StatsComponent = () => {
  const t = useTranslations('stats');

  return (
    <div className="stats flex flex-wrap gap-3 xl:gap-6 justify-between mb-8">
      {/* All stats */}
      <div className="w-[calc(50%-12px)] md:w-[calc(25%-16px)] xl:w-[calc(25%-24px)] flex flex-col items-start gap-2 p-4 xl:p-6 rounded-lg border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="w-full flex justify-between flex-wrap">
          <div className="w-10.5 h-10.5 p-3 rounded-lg bg-[rgba(3,22,52,0.05)] dark:bg-[rgba(255,255,255,0.07)]">
            <img src="/icons/device.svg" alt="icon" />
          </div>
          <span className="text-[#B6C6EE] dark:text-slate-500 text-[10px] font-bold leading-3.75 tracking-[0.5px] uppercase">
            DEVICE ID: 1248
          </span>
        </div>

        <p className="text-[#44474E] dark:text-slate-300 font-normal text-[16px] leading-6">{t('totalDevices')}</p>

        <h3 className="text-[#031634] dark:text-slate-100 font-bold text-[30px]">
          <CountUp start={0} end={1248} duration={2} separator=" " />
        </h3>

        <div className="flex items-center gap-1.5">
          <img src="/icons/grov.svg" alt="" />
          <span className="text-[#10B981] font-medium text-[12px] leading-4.5">{t('growth')}</span>
        </div>
      </div>

      {/* Success stats */}
      <div className="w-[calc(50%-12px)] md:w-[calc(25%-16px)] xl:w-[calc(25%-24px)] flex flex-col items-start gap-1 p-4 xl:p-6 rounded-lg border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="w-full flex justify-between flex-wrap">
          <div className="w-10.5 h-10.5 p-3 rounded-lg bg-[rgba(16,185,129,0.10)] dark:bg-[rgba(16,185,129,0.12)]">
            <img src="/icons/checked_success.svg" alt="icon" />
          </div>
        </div>

        <p className="text-[#44474E] dark:text-slate-300 font-normal text-[16px] leading-6">{t('onTime')}</p>

        <h3 className="text-[#031634] dark:text-slate-100 font-bold text-[30px]">
          <CountUp start={0} end={1089} duration={2} separator=" " />
        </h3>

        <div className="w-full h-3 bg-[#ECECEC] dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full w-[85%] bg-[#10B981] rounded-full"></div>
        </div>
      </div>

      {/* Warning stats */}
      <div className="w-[calc(50%-12px)] md:w-[calc(25%-16px)] xl:w-[calc(25%-24px)] flex flex-col items-start gap-1 p-4 xl:p-6 rounded-lg border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="w-full flex justify-between flex-wrap">
          <div className="w-10.5 h-10.5 p-3 rounded-lg bg-[rgba(254,166,25,0.10)] dark:bg-[rgba(254,166,25,0.12)]">
            <img src="/icons/warning.svg" alt="icon" />
          </div>
        </div>

        <p className="text-[#44474E] dark:text-slate-300 font-normal text-[16px] leading-6">{t('approaching')}</p>

        <h3 className="text-[#031634] dark:text-slate-100 font-bold text-[30px]">
          <CountUp start={0} end={112} duration={2} />
        </h3>

        <div className="flex items-center gap-1.5">
          <img src="/icons/time.svg" alt="" />
          <span className="text-[#FEA619] font-medium text-[12px] leading-4.5">{t('attentionNeeded')}</span>
        </div>
      </div>

      {/* Error stats */}
      <div className="w-[calc(50%-12px)] md:w-[calc(25%-16px)] xl:w-[calc(25%-24px)] flex flex-col items-start gap-1 p-4 xl:p-6 rounded-lg border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="w-full flex justify-between flex-wrap">
          <div className="w-10.5 h-10.5 p-3 rounded-lg bg-[rgba(239,68,68,0.10)] dark:bg-[rgba(239,68,68,0.12)]">
            <img src="/icons/error.svg" alt="icon" />
          </div>
        </div>

        <p className="text-[#44474E] dark:text-slate-300 font-normal text-[16px] leading-6">{t('expired')}</p>

        <h3 className="text-[#031634] dark:text-slate-100 font-bold text-[30px]">
          <CountUp start={0} end={47} duration={2} />
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="text-[#EF4444]">!</span>
          <span className="text-[#EF4444] font-medium text-[12px] leading-4.5">{t('urgent')}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;
