'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

const NotFount = () => {
  const router = useRouter();
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-4 mb-5 text-3xl font-semibold text-slate-950 dark:text-white">
        Sahifa topilmadi
      </h1>
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
  );
};

export default NotFount;
