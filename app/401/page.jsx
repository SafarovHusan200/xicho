'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

const UnAuthorization = () => {
  const t = useTranslations('errorPages');

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center">
        <h1 className="mt-4 mb-5 text-3xl font-semibold text-slate-950 dark:text-white">
          {t('unauthorized.title')}
        </h1>
        <p>{t('unauthorized.description')}</p>
        <div>
          <img className="w-120" src="/401.svg" alt="icon" />
        </div>

        <Link
          href={'/'}
          className="px-5 py-1.5 rounded-md bg-blue-500 text-white transition-transform duration-300 hover:-translate-y-1"
        >
          {t('unauthorized.action')}
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default UnAuthorization;
