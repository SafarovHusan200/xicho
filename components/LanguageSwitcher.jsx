'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
      <button
        onClick={() => switchLocale('uz')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
          locale === 'uz'
            ? 'bg-[#3b82f6] text-white shadow-sm'
            : 'text-[#64748B] dark:text-slate-400 hover:text-[#031634] dark:hover:text-slate-200'
        }`}
      >
        UZ
      </button>
      <button
        onClick={() => switchLocale('ru')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
          locale === 'ru'
            ? 'bg-[#3b82f6] text-white shadow-sm'
            : 'text-[#64748B] dark:text-slate-400 hover:text-[#031634] dark:hover:text-slate-200'
        }`}
      >
        RU
      </button>
    </div>
  );
}
