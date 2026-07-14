'use client';

import { FlaskConical, Loader2 } from 'lucide-react';
import {
  getTestLogStatus,
  TEST_LOG_STATUS_CFG,
  TestLogStatusBadge,
  TestResultBadge,
} from './testLogStatus';

function TestLogCards({ logs, locale, t, isLoading, twoCols = true }) {
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-[#7B8499]">
        <Loader2 size={16} className="animate-spin text-[#3b82f6]" />
        <span className="text-xs">{t('loading')}</span>
      </div>
    );
  }

  if (!logs?.length) {
    return <div className="py-6 text-center text-xs text-[#7B8499]">{t('empty')}</div>;
  }

  return (
    <div className={`grid grid-cols-1 ${twoCols ? 'lg:grid-cols-2' : ''} gap-2 py-3`}>
      {logs.map((log) => {
        const status = getTestLogStatus(log.next_test_date);
        const cfg = TEST_LOG_STATUS_CFG[status];
        return (
          <div
            key={log.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(197,198,207,0.25)] dark:border-slate-700/40 bg-white dark:bg-slate-800 hover:shadow-sm transition-all"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${cfg?.color ?? '#94a3b8'}15` }}
            >
              <FlaskConical size={18} style={{ color: cfg?.color ?? '#94a3b8' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate">
                  {log.test_type}
                </p>
                <TestLogStatusBadge status={status} t={t} />
                <TestResultBadge isPassed={log.is_passed} t={t} />
              </div>
              <div className="flex flex-wrap gap-5 items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-[#7B8499] dark:text-slate-500">
                {log.test_protocol_number && (
                  <span className="font-mono">{log.test_protocol_number}</span>
                )}
                <span>
                  {fmtDate(log.test_date)} → {fmtDate(log.next_test_date)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TestLogCards;
