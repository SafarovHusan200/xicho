'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const ErrorBoundaryPage = ({ error, reset }) => {
  const t = useTranslations('errorPages');
  const router = useRouter();
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <h1 className="mt-4 mb-5 text-3xl font-semibold text-slate-950 dark:text-white">
        {t('serverError.title')}
      </h1>
      <p>{t('serverError.description')}</p>
      {!isDev && error?.digest && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('serverError.digestLabel')}: <span className="font-mono">{error.digest}</span>
        </p>
      )}

      {isDev && error?.message && (
        <div className="w-full max-w-3xl mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/40">
          <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">
            {t('serverError.detailsLabel')}
          </p>
          <p className="font-mono text-sm wrap-break-word text-red-800 dark:text-red-300">
            {error.message}
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
              digest: {error.digest}
            </p>
          )}
          {error.stack && (
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-red-700/80 dark:text-red-400/80">
              {error.stack}
            </pre>
          )}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="px-5 py-2 rounded-md bg-blue-500 text-white transition-transform duration-300 hover:-translate-y-1"
      >
        {t('serverError.action')}
      </button>
    </div>
  );
};

export default ErrorBoundaryPage;
