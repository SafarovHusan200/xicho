'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslations } from 'next-intl';

const ForbiddenPage = () => {
  const t = useTranslations('errorPages');
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center">
        <h1 className="mt-4 mb-2 text-3xl font-semibold text-slate-950 dark:text-white">
          {t('forbidden.title')}
        </h1>
        <p>{t('forbidden.description')}</p>
        <div>
          <img className="w-120" src="/403.svg" alt="icon" />
        </div>

        <button
          onClick={() => router.back()}
          className="px-5 py-1.5 rounded-md bg-blue-500 text-white transition-transform duration-300 hover:-translate-y-1"
        >
          {t('forbidden.action')}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ForbiddenPage;
