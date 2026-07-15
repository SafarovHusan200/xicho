'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import {
  getWorstStatus,
  getDayDiffLabel,
  TEST_LOG_STATUS_CFG,
} from '@/components/devices/testLogStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CELL = 16;
const GAP = 5;
const STEP = CELL + GAP;

const NEUTRAL_CLASS = 'bg-slate-100 dark:bg-slate-700/40';
const LEGEND_ORDER = ['ok', 'warning', 'expiring_soon', 'overdue'];

/* ── hardcoded month/weekday names — some browsers fall back to "M01" style
   labels for Intl.DateTimeFormat('uz-UZ', ...) when their bundled ICU data
   is incomplete, so we don't rely on toLocaleDateString for these ── */
const MONTH_NAMES = {
  ru: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  uz: [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr',
  ],
};

/* ── indexed 0=Sunday..6=Saturday, matching Date#getDay() ── */
const WEEKDAY_NAMES = {
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
};

const toKey = (date) => date.toLocaleDateString('en-CA');

/* ── grid aligned to a literal calendar year (Jan 1 – Dec 31), padded to full weeks ── */
function buildWeeks(year) {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const gridStart = new Date(jan1);
  gridStart.setDate(jan1.getDate() - jan1.getDay());
  const gridEnd = new Date(dec31);
  gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

  const weeks = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(days);
  }
  return weeks;
}

export default function DeadlineHeatmap({
  logs,
  locale,
  t,
  tl,
  deviceMap,
  selectedDate,
  onSelectDate,
}) {
  const [yearOffset, setYearOffset] = useState(0);
  const localeKey = locale === 'ru' ? 'ru' : 'uz';
  const months = MONTH_NAMES[localeKey];
  const weekdays = WEEKDAY_NAMES[localeKey];

  const year = new Date().getFullYear() - yearOffset;
  const selectedKey = selectedDate ? toKey(selectedDate) : null;

  /* ── jump the displayed year to match the shared selected date when it changes externally ── */
  useEffect(() => {
    if (!selectedDate) return;
    const selYear = selectedDate.getFullYear();
    setYearOffset((prev) => {
      const currentYear = new Date().getFullYear();
      return selYear === currentYear - prev ? prev : currentYear - selYear;
    });
  }, [selectedDate]);

  const weeks = useMemo(() => buildWeeks(year), [year]);
  const rangeStartKey = `${year}-01-01`;
  const rangeEndKey = `${year}-12-31`;

  /* ── group logs by their deadline day ── */
  const eventsByDate = useMemo(() => {
    const map = new Map();
    (logs ?? []).forEach((log) => {
      if (!log?.next_test_date) return;
      const key = toKey(new Date(log.next_test_date));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(log);
    });
    return map;
  }, [logs]);

  const windowCount = useMemo(() => {
    let sum = 0;
    eventsByDate.forEach((dayLogs, key) => {
      if (key >= rangeStartKey && key <= rangeEndKey) sum += dayLogs.length;
    });
    return sum;
  }, [eventsByDate, rangeStartKey, rangeEndKey]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      if (firstDay.getDate() <= 7 && month !== lastMonth) {
        labels.push({ index: i, label: months[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks, months]);

  /* ── indexed 0=Sunday..6=Saturday, matching each grid row ── */
  const weekdayLabels = weekdays;

  const fmtDay = (d) =>
    `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;

  const renderCellTooltip = (day, dayLogs) => {
    if (!dayLogs?.length) {
      return <span>{fmtDay(day)}</span>;
    }
    const status = getWorstStatus(dayLogs);
    const cfg = TEST_LOG_STATUS_CFG[status];
    const names = dayLogs
      .slice(0, 3)
      .map((log) => deviceMap?.[log.device_id]?.name ?? log.test_type)
      .join(', ');
    const extra = dayLogs.length > 3 ? ` +${dayLogs.length - 3}` : '';
    const dayDiffLabel = getDayDiffLabel(day, tl);
    return (
      <div className="flex flex-col gap-1 py-0.5">
        <div className="flex items-center gap-1.5 font-semibold">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
          {fmtDay(day)}
        </div>
        <span>
          {names}
          {extra}
        </span>
        <span className="opacity-70">{dayDiffLabel}</span>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6]/10">
              <CalendarClock size={17} className="text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100">
                {t('deadlineGridTitle')}
              </h3>
              <p className="text-[12px] text-[#7B8499] dark:text-slate-400">
                {t('deadlineGridSubtitle', { count: windowCount })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t('prevYear')}
              onClick={() => setYearOffset((y) => y + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8F9FB] dark:hover:bg-slate-700/50 transition-colors"
            >
              <ChevronLeft size={14} className="text-[#7B8499] dark:text-slate-400" />
            </button>
            <span className="text-[12px] font-semibold text-[#031634] dark:text-slate-200 w-20 text-center">
              {year}
            </span>
            <button
              type="button"
              aria-label={t('nextYear')}
              onClick={() => setYearOffset((y) => y - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8F9FB] dark:hover:bg-slate-700/50 transition-colors"
            >
              <ChevronRight size={14} className="text-[#7B8499] dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex" style={{ minWidth: weeks.length * STEP + 24 }}>
            <div className="flex flex-col gap-[5px] mr-2 pt-[16px]">
              {weekdayLabels.map((label, i) => (
                <div
                  key={i}
                  className="text-[10px] leading-[14px] text-[#7B8499] dark:text-slate-500 whitespace-nowrap"
                  style={{ height: CELL }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div>
              <div className="relative mb-1" style={{ height: 14 }}>
                {monthLabels.map((m) => (
                  <span
                    key={m.index}
                    className="absolute text-[10px] text-[#7B8499] dark:text-slate-500 whitespace-nowrap"
                    style={{ left: m.index * STEP }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-[5px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[5px]">
                    {week.map((day, di) => {
                      if (day.getFullYear() !== year) {
                        return <div key={di} style={{ width: CELL, height: CELL }} />;
                      }
                      const key = toKey(day);
                      const dayLogs = eventsByDate.get(key);
                      const status = dayLogs?.length ? getWorstStatus(dayLogs) : null;
                      const cfg = status ? TEST_LOG_STATUS_CFG[status] : null;
                      const isSelected = key === selectedKey;
                      return (
                        <Tooltip key={di}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => onSelectDate?.(day)}
                              className={`rounded-[3px] transition hover:scale-110 cursor-pointer hover:ring-1 hover:ring-[#3b82f6] ${cfg ? '' : NEUTRAL_CLASS} ${isSelected ? 'ring-2 ring-[#3b82f6] ring-offset-1' : ''}`}
                              style={{
                                width: CELL,
                                height: CELL,
                                borderRadius: '3px',
                                ...(cfg ? { backgroundColor: cfg.color } : {}),
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{renderCellTooltip(day, dayLogs)}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#F0F1F5] dark:border-slate-700/40">
          {LEGEND_ORDER.map((status) => {
            const cfg = TEST_LOG_STATUS_CFG[status];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className="rounded-[3px]"
                  style={{ width: CELL, height: CELL, backgroundColor: cfg.color }}
                />
                <span className="text-[11px] text-[#7B8499] dark:text-slate-500">
                  {tl(cfg.labelKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
