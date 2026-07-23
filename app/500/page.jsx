'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ServerErrorPage = () => {
  const router = useRouter();
  const t = useTranslations('errorPages');

  return (
    <div className="flex flex-col items-center sm:mt-10">
      <h1 className="mt-4 mb-5 text-3xl text-center font-semibold text-slate-950 dark:text-white">
        {t('serverError.title')}
      </h1>
      <p>{t('serverError.description')}</p>
      <div>
        <img className="w-120" src="/500.svg" alt="icon" />
      </div>

      <button
        onClick={() => router.back()}
        className="px-5 py-2 rounded-md bg-blue-500 text-white transition-transform duration-300 hover:-translate-y-1"
      >
        {t('serverError.action')}
      </button>
    </div>
  );
};

export default ServerErrorPage;
