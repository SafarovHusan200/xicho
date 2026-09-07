'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import {
  FileBarChart,
  Loader2,
  FileSpreadsheet,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Wrench,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import { request } from '@/services/api';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatCard from '@/components/StatCard';
import TableComponent from '@/components/tableComponent';
import { cn } from '@/lib/utils';
import { MONTH_NAMES } from '@/constants/monthNames';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const MONTH_NUMS = Array.from({ length: 12 }, (_, i) => i + 1);
const QUARTER_NUMS = [1, 2, 3, 4];

export default function ReportsPage() {
  const { data: session } = useSession();
  const t = useTranslations('reports');
  const locale = useLocale();
  const monthNames = MONTH_NAMES[locale === 'ru' ? 'ru' : 'uz'];

  const [period, setPeriod] = useState('year');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [quarter, setQuarter] = useState(String(Math.ceil((new Date().getMonth() + 1) / 3)));
  const [groupBy, setGroupBy] = useState('facility');
  const [unitCode, setUnitCode] = useState('');
  const [exporting, setExporting] = useState(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  /* ── query params shared by the on-screen fetch and the export downloads ── */
  const queryParams = useMemo(() => {
    const p = { period, group_by: groupBy, year: Number(year) };
    if (period === 'month') p.month = Number(month);
    if (period === 'quarter') p.quarter = Number(quarter);
    if (unitCode.trim()) p.unit_code = unitCode.trim();
    return p;
  }, [period, year, month, quarter, groupBy, unitCode]);

  const {
    data: reportRes,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.reports,
    url: URLS.reports,
    params: queryParams,
    headers: authHeader,
    enabled: !!session,
  });

  const report = reportRes?.data;
  const rows = report?.rows ?? [];
  const totals = report?.totals ?? {};

  /* ── locale-aware file name — built client-side so the download always matches the current UI language, regardless of what the server names it ── */
  const buildFileName = (format) => {
    const parts = [t('fileNamePrefix')];
    if (period === 'month') {
      parts.push(monthNames[Number(month) - 1]);
      parts.push(year);
    } else if (period === 'quarter') {
      parts.push(t('quarterN', { n: quarter }));
      parts.push(year);
    } else {
      parts.push(t('periodYear'), year);
    }
    /* ── day+month+time only — the period year above already covers the year, no need to repeat it ── */
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}`;
    parts.push(stamp);
    const safe = parts.join('_').replace(/\s+/g, '_');
    return `${safe}.${format}`;
  };

  /* ── PDF still comes from the backend as-is ── */
  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res = await request.get(`/${URLS.reports}`, {
        params: { ...queryParams, export: format },
        headers: authHeader,
        responseType: 'blob',
      });
      const filename = buildFileName(format);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error(t('exportError'));
    } finally {
      setExporting(null);
    }
  };

  const groupLabel = groupBy === 'facility' ? t('colFacility') : t('colDeviceType');

  /* ── Excel is built client-side (exceljs) from the same data shown on screen, so we control its styling ── */
  const handleExportExcel = async () => {
    setExporting('xlsx');
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = t('title');
      workbook.created = new Date();

      const sheet = workbook.addWorksheet(t('listTitle').slice(0, 31), {
        views: [{ state: 'frozen', ySplit: 4 }],
      });

      const COL_COUNT = 8;
      sheet.columns = [
        { width: 30 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 13 },
        { width: 14 },
        { width: 13 },
      ];

      const THIN_BORDER = { style: 'thin', color: { argb: 'FFE2E8F0' } };

      /* ── row 1: title ── */
      const titleRow = sheet.addRow([`${t('subtitle')} — ${report?.period_label ?? ''}`]);
      sheet.mergeCells(1, 1, 1, COL_COUNT);
      titleRow.height = 26;
      titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF031634' } };
      titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

      /* ── row 2: generated-at ── */
      const gen = report?.generated_at ? new Date(report.generated_at) : new Date();
      const genText = `${String(gen.getUTCDate()).padStart(2, '0')}.${String(gen.getUTCMonth() + 1).padStart(2, '0')}.${gen.getUTCFullYear()} ${String(gen.getUTCHours()).padStart(2, '0')}:${String(gen.getUTCMinutes()).padStart(2, '0')} UTC`;
      const genRow = sheet.addRow([`${t('generatedAtLabel')}: ${genText}`]);
      sheet.mergeCells(2, 1, 2, COL_COUNT);
      genRow.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF7B8499' } };

      /* ── row 3: blank spacer ── */
      sheet.addRow([]);

      /* ── row 4: header ── */
      const headerRow = sheet.addRow([
        groupLabel,
        t('unitCodeLabel'),
        t('colDevicesTotal'),
        t('colDevicesTested'),
        t('colTestsTotal'),
        t('colPassed'),
        t('colFailed'),
        t('colUnspecified'),
      ]);
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: THIN_BORDER,
          bottom: THIN_BORDER,
          left: THIN_BORDER,
          right: THIN_BORDER,
        };
      });

      /* ── data rows ── */
      rows.forEach((row, i) => {
        const r = sheet.addRow([
          row.group_name,
          row.unit_code ?? '—',
          row.devices_total,
          row.devices_tested,
          row.tests_total,
          row.passed,
          row.failed,
          row.unspecified,
        ]);
        r.eachCell((cell, colNumber) => {
          cell.border = {
            top: THIN_BORDER,
            bottom: THIN_BORDER,
            left: THIN_BORDER,
            right: THIN_BORDER,
          };
          cell.alignment = { vertical: 'middle', horizontal: colNumber <= 2 ? 'left' : 'center' };
          if (i % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        });
        r.getCell(6).font = { bold: true, color: { argb: 'FF10B981' } };
        r.getCell(7).font = { bold: true, color: { argb: 'FFEF4444' } };
        r.getCell(8).font = { bold: true, color: { argb: 'FF94A3B8' } };
      });

      /* ── totals row ── */
      const totalsRow = sheet.addRow([
        t('totalsRow'),
        '',
        totals.devices_total ?? 0,
        totals.devices_tested ?? 0,
        totals.tests_total ?? 0,
        totals.passed ?? 0,
        totals.failed ?? 0,
        totals.unspecified ?? 0,
      ]);
      totalsRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 2 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'double', color: { argb: 'FF3B82F6' } },
          bottom: THIN_BORDER,
          left: THIN_BORDER,
          right: THIN_BORDER,
        };
      });
      totalsRow.getCell(6).font = { bold: true, color: { argb: 'FF10B981' } };
      totalsRow.getCell(7).font = { bold: true, color: { argb: 'FFEF4444' } };
      totalsRow.getCell(8).font = { bold: true, color: { argb: 'FF94A3B8' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = buildFileName('xlsx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error(t('exportError'));
    } finally {
      setExporting(null);
    }
  };

  const tableData = rows.map((row, i) => ({
    id: row.group_id ?? i,
    _tr: i + 1,
    _name: (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-[#031634] dark:text-slate-100 text-[13px]">
          {row.group_name}
        </span>
        {row.unit_code && (
          <span className="font-mono text-[11px] text-[#7B8499] dark:text-slate-500">
            {row.unit_code}
          </span>
        )}
      </div>
    ),
    devices_total: row.devices_total,
    devices_tested: row.devices_tested,
    tests_total: row.tests_total,
    _passed: <span className="font-semibold text-[#10B981]">{row.passed}</span>,
    _failed: <span className="font-semibold text-[#ef4444]">{row.failed}</span>,
    _unspecified: <span className="font-semibold text-[#94a3b8]">{row.unspecified}</span>,
  }));

  const columns = [
    { key: '_tr', label: '#' },
    { key: '_name', label: groupLabel },
    { key: 'devices_total', label: t('colDevicesTotal') },
    { key: 'devices_tested', label: t('colDevicesTested') },
    { key: 'tests_total', label: t('colTestsTotal') },
    { key: '_passed', label: t('colPassed') },
    { key: '_failed', label: t('colFailed') },
    { key: '_unspecified', label: t('colUnspecified') },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20">
            <FileBarChart size={22} className="text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#031634] dark:text-slate-100">{t('title')}</h1>
            <p className="text-[13px] text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={!!exporting || isLoading || rows.length === 0}
            className="text-[13px]"
          >
            {exporting === 'xlsx' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            {t('exportExcel')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={!!exporting || isLoading || rows.length === 0}
            className="text-[13px]"
          >
            {exporting === 'pdf' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileText size={14} />
            )}
            {t('exportPdf')}
          </Button>
        </div>
      </div>

      {/* ── stats ──────────────────────────────────────────────── */}
      <div
        className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-5 gap-3')}
        style={{
          gridColumn: 'repeat(3fr)',
        }}
      >
        <StatCard
          label={t('statDevicesTotal')}
          value={totals.devices_total ?? 0}
          icon={Building2}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('statDevicesTested')}
          value={totals.devices_tested ?? 0}
          icon={Wrench}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('statTestsTotal')}
          value={totals.tests_total ?? 0}
          icon={ClipboardCheck}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('statPassed')}
          value={totals.passed ?? 0}
          icon={CheckCircle2}
          iconColor="#10B981"
          color="text-[#10B981]"
        />
        <StatCard
          label={t('statFailed')}
          value={totals.failed ?? 0}
          icon={XCircle}
          iconColor="#ef4444"
          color="text-[#ef4444]"
        />
      </div>

      {/* ── filters ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
            {t('periodLabel')}
          </Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-36 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('periodMonth')}</SelectItem>
              <SelectItem value="quarter">{t('periodQuarter')}</SelectItem>
              <SelectItem value="year">{t('periodYear')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
            {t('yearLabel')}
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-9 w-28 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {period === 'month' && (
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('monthLabel')}
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-9 w-40 text-[13px] capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NUMS.map((m) => (
                  <SelectItem key={m} value={String(m)} className="capitalize">
                    {monthNames[m - 1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {period === 'quarter' && (
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('quarterLabel')}
            </Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="h-9 w-32 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUARTER_NUMS.map((q) => (
                  <SelectItem key={q} value={String(q)}>
                    {t('quarterN', { n: q })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
            {t('groupByLabel')}
          </Label>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="h-9 w-44 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facility">{t('groupByFacility')}</SelectItem>
              <SelectItem value="device_type">{t('groupByDeviceType')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
            {t('unitCodeLabel')}
          </Label>
          <input
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            placeholder={t('unitCodePlaceholder')}
            className="h-9 w-40 rounded-md border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[13px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
          />
        </div>

        {isFetching && !isLoading && (
          <Loader2 size={16} className="mb-2 animate-spin text-[#3b82f6]" />
        )}

        {report?.period_label && (
          <p className="ml-auto mb-1.5 text-[13px] text-[#7B8499] dark:text-slate-400">
            {t('periodLabelPrefix')}:{' '}
            <span className="font-semibold text-[#031634] dark:text-slate-200">
              {report.period_label}
            </span>
          </p>
        )}
      </div>

      {/* ── table card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F1F5] dark:border-slate-700/40">
          <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2">
            <FileBarChart size={16} className="text-[#3b82f6]" />
            {t('listTitle')}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileBarChart size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-[14px] text-[#7B8499] dark:text-slate-400">{t('empty')}</p>
          </div>
        ) : (
          <>
            <TableComponent column={columns} data={tableData} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-3 border-t border-[#F0F1F5] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/60 text-[13px]">
              <span className="font-semibold text-[#031634] dark:text-slate-100">
                {t('totalsRow')}
              </span>
              <span className="ml-auto text-[#7B8499] dark:text-slate-400">
                {t('colDevicesTotal')}:{' '}
                <b className="text-[#031634] dark:text-slate-100">{totals.devices_total ?? 0}</b>
              </span>
              <span className="text-[#7B8499] dark:text-slate-400">
                {t('colDevicesTested')}:{' '}
                <b className="text-[#031634] dark:text-slate-100">{totals.devices_tested ?? 0}</b>
              </span>
              <span className="text-[#7B8499] dark:text-slate-400">
                {t('colTestsTotal')}:{' '}
                <b className="text-[#031634] dark:text-slate-100">{totals.tests_total ?? 0}</b>
              </span>
              <span className="font-semibold text-[#10B981]">
                {t('colPassed')}: {totals.passed ?? 0}
              </span>
              <span className="font-semibold text-[#ef4444]">
                {t('colFailed')}: {totals.failed ?? 0}
              </span>
              <span className="font-semibold text-[#94a3b8]">
                {t('colUnspecified')}: {totals.unspecified ?? 0}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
