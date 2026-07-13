'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

const NotFount = () => {
  const router = useRouter();
  const t = useTranslations('common');
  return (
    <div className="w-full h-screen  flex flex-col justify-center items-center">
      <h3 className="text-2xl mb-3">{t('pageNotFound')}</h3>

      <button
        onClick={() => router.back()}
        className="px-5 py-2 rounded-md bg-blue-500 text-white"
        href={'/'}
      >
        {t('back')}
      </button>
    </div>
  );
};

export default NotFount;
