'use client';

import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';

const PageNotFoundPage = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center">
        <h1 className="mt-4 mb-5 text-3xl font-semibold text-slate-950 dark:text-white">
          Sahifa topilmadi
        </h1>
        <p>Bunday sahifa mavjud emas.</p>
        <div>
          <img className="w-120" src="/404.svg" alt="icon" />
        </div>

        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-md bg-blue-500 text-white transition-transform duration-300 hover:-translate-y-1"
        >
          Ortga
        </button>
      </div>
    </DashboardLayout>
  );
};

export default PageNotFoundPage;
