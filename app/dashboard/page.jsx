import React from 'react';
import { ChartAreaInteractive } from '@/components/chartAreaInteractive';
import { ChartPieDonutText } from '@/components/chartPieDonutText';
import StatsComponent from '@/components/statsComponent';
import TableComponent from '@/components/tableComponent';
import Link from 'next/link';

const DashboardPage = () => {
  return (
    <div className="">
      <h2 className="title text-[#031634]  text-[32px] font-bold leading-10 tracking-[-0.64px]">
        Tizim holati
      </h2>
      <p className="text-[#44474E] text-[16px] font-normal leading-6 mb-6 ">
        Sanoat ob'ektlarining texnik xavfsizlik monitoringi
      </p>

      {/* Stats */}
      <StatsComponent />

      {/* Charts */}
      <div className="w-full flex flex-wrap gap-6 md:gap-8 mb-8">
        <ChartPieDonutText />
        <ChartAreaInteractive />
      </div>

      {/* Table */}
      <div className="w-full rounded-[12px] border border-[rgba(197,198,207,0.30)] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden ">
        <div className="flex  justify-between px-8 py-6 bg-[#FBF8FC] border-b border-[rgba(197,198,207,0.20)] ">
          <h2 className="text-[#031634] text-[18px] font-semibold">
            Bu oy rejalashtirilgan sinovlar
          </h2>
          <Link href={'/dashboard/calendar'} className="flex items-center gap-2">
            <span className="text-[#031634] text-center text-[14px] font-semibold leading-4 tracking-[0.6px]">
              Barchasini ko'rish
            </span>
            <img src="/icons/arrow.svg" alt="icon" />
          </Link>
        </div>

        <TableComponent />
      </div>
    </div>
  );
};

export default DashboardPage;
