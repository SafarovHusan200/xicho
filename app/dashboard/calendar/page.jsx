'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { ru, uz } from 'date-fns/locale';
import Link from 'next/link';
import { CalendarDays, CalendarCheck2, Clock, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import StatCard from '@/components/StatCard';
import TestLogCards from '@/components/devices/TestLogCards';
import { getTestLogStatus, getWorstStatus } from '@/components/devices/testLogStatus';

import DeadlineHeatmap from '@/components/calendar/DeadlineHeatmap';

const toKey = (d) => new Date(d).toLocaleDateString('en-CA');

const MODIFIERS_CLASS_NAMES = {
  overdue: 'bg-[#ef4444]/15 text-[#ef4444] font-semibold dark:bg-[#ef4444]/25 dark:text-[#f87171]',
  expiringSoon:
    'bg-[#f97316]/15 text-[#f97316] font-semibold dark:bg-[#f97316]/25 dark:text-[#fb923c]',
  warning: 'bg-[#eab308]/15 text-[#a16207] font-semibold dark:bg-[#eab308]/25 dark:text-[#facc15]',
  ok: 'bg-[#10B981]/15 text-[#10B981] font-semibold dark:bg-[#10B981]/25 dark:text-[#34d399]',
  neverTested: 'bg-slate-200/70 text-slate-500 dark:bg-slate-600/30 dark:text-slate-400',
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const t = useTranslations('calendar');
  const tl = useTranslations('testLogs');
  const locale = useLocale();

  const [date, setDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  /* ── single source of truth for the selected day, shared by Calendar, DeadlineHeatmap and TestLogCards ── */
  const selectDate = (d) => {
    if (!d) return;
    setDate(d);
    setCalendarMonth(d);
  };

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: logsRes, isLoading } = useGetQuery({
    key: `${KEYS.testLogs}-calendar`,
    url: URLS.testLogs,
    params: { limit: 1000, offset: 0 },
    headers: authHeader,
    enabled: !!session,
  });

  const { data: devicesRes } = useGetQuery({
    key: `${KEYS.device}-for-calendar`,
    url: URLS.device,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session,
  });

  const logs = (logsRes?.data?.data ?? []).filter(Boolean);
  const totalCount = logsRes?.data?.count ?? logs.length;
  const devices = (devicesRes?.data?.data ?? []).filter(Boolean);

  const deviceMap = useMemo(() => {
    const m = {};
    devices.forEach((d) => {
      if (d?.id) m[d.id] = d;
    });
    return m;
  }, [devices]);

  /* ── group logs by their schedule date (next_test_date, fallback test_date) ── */
  const eventsByDate = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      const dateStr = log.next_test_date || log.test_date;
      if (!dateStr) return;
      const key = toKey(dateStr);
      if (!map[key]) map[key] = [];
      map[key].push(log);
    });
    return map;
  }, [logs]);

  const selectedKey = date ? toKey(date) : null;
  const selectedLogs = selectedKey ? (eventsByDate[selectedKey] ?? []) : [];

  /* ── status-colored dots for the mini calendar ── */
  const dayBuckets = useMemo(() => {
    const buckets = { overdue: [], expiring_soon: [], warning: [], ok: [], never_tested: [] };
    Object.entries(eventsByDate).forEach(([key, dayLogs]) => {
      buckets[getWorstStatus(dayLogs)].push(new Date(key));
    });
    return buckets;
  }, [eventsByDate]);

  const modifiers = {
    overdue: dayBuckets.overdue,
    expiringSoon: dayBuckets.expiring_soon,
    warning: dayBuckets.warning,
    ok: dayBuckets.ok,
    neverTested: dayBuckets.never_tested,
  };
  const modifiersClassNames = MODIFIERS_CLASS_NAMES;

  /* ── upcoming tests (future only, soonest first) ── */
  const upcomingLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs
      .filter((l) => l.next_test_date && new Date(l.next_test_date) >= today)
      .sort((a, b) => new Date(a.next_test_date) - new Date(b.next_test_date))
      .slice(0, 6);
  }, [logs]);

  /* ── stats ── */
  const statusCounts = useMemo(() => {
    const c = { ok: 0, warning: 0, expiring_soon: 0, overdue: 0, never_tested: 0 };
    logs.forEach((l) => {
      c[getTestLogStatus(l.next_test_date, l.is_passed)]++;
    });
    return c;
  }, [logs]);

  const { passedCount, gradedTotal, passRate } = useMemo(() => {
    const passed = logs.filter((l) => l.is_passed === true).length;
    const failed = logs.filter((l) => l.is_passed === false).length;
    const total = passed + failed;
    return {
      passedCount: passed,
      gradedTotal: total,
      passRate: total ? Math.round((passed / total) * 1000) / 10 : 0,
    };
  }, [logs]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20">
          <CalendarDays size={22} className="text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#031634] dark:text-slate-100">{t('title')}</h1>
          <p className="text-[13px] text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('statTotal')}
          value={totalCount}
          icon={CalendarDays}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('statExpiring')}
          value={statusCounts.expiring_soon}
          icon={Clock}
          iconColor="#f97316"
        />
        <StatCard
          label={t('statOverdue')}
          value={statusCounts.overdue}
          icon={XCircle}
          iconColor="#ef4444"
        />
        <StatCard
          label={t('statPassRate')}
          value={passRate}
          suffix="%"
          icon={TrendingUp}
          iconColor="#10B981"
          color="text-[#10B981]"
        />
      </div>

      {/* ── Calendar / day detail / upcoming ──────────────── */}
      <div className="grid grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
        {/* ── Deadline tracking grid ─────────────────────────── */}
        <div className="col-span-3">
          <DeadlineHeatmap
            logs={logs}
            locale={locale}
            t={t}
            tl={tl}
            deviceMap={deviceMap}
            selectedDate={date}
            onSelectDate={selectDate}
            className=""
          />
        </div>

        {/* Mini calendar */}
        <div className=" max-w-80 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm p-5">
          <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-[#3b82f6]" />
            {t('calendarCardTitle')}
          </h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={selectDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            className="rounded-md w-full p-0"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>

        {/* Selected day detail */}
        <div className=" rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm p-5">
          <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2 mb-1">
            <CalendarCheck2 size={16} className="text-[#3b82f6]" />
            {t('detailsCardTitle')}
          </h2>
          {date && (
            <p className="text-[13px] text-[#7B8499] dark:text-slate-400 mb-1">
              {date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          {selectedLogs.length > 0 ? (
            <TestLogCards
              logs={selectedLogs}
              locale={locale}
              t={tl}
              isLoading={false}
              twoCols={false}
              deviceMap={deviceMap}
            />
          ) : (
            <p className="py-6 text-center text-[13px] text-[#7B8499] dark:text-slate-500">
              {t('noEvents')}
            </p>
          )}
        </div>

        {/* Upcoming + pass rate */}
        <div className=" flex flex-col gap-6 ">
          <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-[#3b82f6]" />
                {t('upcomingTitle')}
              </h2>
              <span className="rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6]">
                {upcomingLogs.length}
              </span>
            </div>

            {upcomingLogs.length > 0 ? (
              <TestLogCards
                logs={upcomingLogs}
                locale={locale}
                t={tl}
                isLoading={isLoading}
                twoCols={false}
                deviceMap={deviceMap}
              />
            ) : (
              <p className="py-6 text-center text-[13px] text-[#7B8499] dark:text-slate-500">
                {t('noUpcoming')}
              </p>
            )}

            <Link
              href="/dashboard/devices/test-logs"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 py-2 text-[13px] font-medium text-[#031634] dark:text-slate-200 hover:bg-[#F8F9FB] dark:hover:bg-slate-700/50 transition-colors"
            >
              {t('viewAll')}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 shadow-md p-6 text-white">
            <p className="text-xs font-semibold mb-2 tracking-widest opacity-75">
              {t('passRateCardTitle')}
            </p>
            <h3 className="text-4xl font-bold mb-3">{passRate}%</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {gradedTotal > 0
                ? t('passRateCardDesc', { passed: passedCount, total: gradedTotal })
                : t('passRateCardEmpty')}
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-linear-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${passRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
