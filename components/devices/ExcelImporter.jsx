'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  UploadCloud,
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { request } from '@/services/api';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import useFacilityStore from '@/store/useFacilityStore';
import useDeviceTypeStore from '@/store/useDeviceTypeStore';
import useDeviceStore from '@/store/useDeviceStore';
import useTestLogStore from '@/store/useTestLogStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePickerField from './DatePickerField';

/* ══════════════════════════════════════════════════════════════════
   Column layout — matches the described sheet. Row 5 (idx 4) = headers,
   row 6 (idx 5) = sub-headers. Data starts at row 7 (idx 6).
   VERIFY these against the real file — they're built from the spec,
   not a sample, and are the most likely thing to need adjusting.
   ══════════════════════════════════════════════════════════════════ */
const HEADER_ROWS = 6; // rows 0..5 are title/header/sub-header — first data row is index 6
const COL = {
  ROW_NO: 0,
  NAME: 1,
  REG_NUMBER: 2,
  SERIAL_NUMBER: 3,
  PASSPORT_TEXT: 4,
  RESPONSIBLE_PERSON: 5,
  COMMISSIONING_DATE: 6,
};

/* device-type checkbox columns (G..K) — first non-empty cell wins.
   `keywords` are matched (case-insensitive, diacritic-loose) against the
   fetched /device-types names to resolve a device_type_id. */
const DEVICE_TYPE_CHECK_COLUMNS = [
  { col: 6, keywords: ['қозон', 'kozon', 'boiler', 'котел', 'котёл'] },
  { col: 7, keywords: ['босим', 'bosim', 'идиш', 'idish', 'сосуд', 'pressure'] },
  { col: 8, keywords: ['қувур', 'quvur', 'труб', 'pipe', 'бу '] },
  { col: 9, keywords: ['кран', 'kran', 'crane'] },
  { col: 10, keywords: ['ёқилғи', 'yoqilg', 'резерв', 'rezerv', 'tank', 'fuel'] },
];

/* the 5 inspection-type column pairs (test date, next test date), cols 11..20 */
const TEST_TYPE_COLUMNS = [
  { label: 'Ташқи кўрик', testCol: 12, nextCol: 13 },
  { label: 'Ички кўрик', testCol: 14, nextCol: 15 },
  { label: 'Гидравлик синов', testCol: 16, nextCol: 17 },
  { label: 'ВМҚ-784', testCol: 18, nextCol: 19 },
  { label: 'PTO', testCol: 20, nextCol: 21 },
];

const SLEEP_MS = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .trim();

/* ── flexible date parsing: real Date objects (cellDates:true), Excel serials,
   or strings like "07.2023", "07.2023й", "31.07.2023" ── */
function parseFlexibleDate(cellValue) {
  if (cellValue == null || cellValue === '') return null;
  if (cellValue instanceof Date && !isNaN(cellValue)) return cellValue;
  if (typeof cellValue === 'number') {
    const parsed = XLSX.SSF?.parse_date_code?.(cellValue);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return null;
  }

  let s = String(cellValue).trim();
  if (!s) return null;

  // Normalize common year suffixes and stray spaces: "09.06.1998 йил", "03.01. 1971y"
  s = s
    .replace(/\s*(?:йил|y|Y)\s*$/u, '')
    .replace(/\s*([.\-/])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const ddmmyyyy = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return new Date(Date.UTC(+y, +m - 1, +d));
  }
  // "07.2023" / "07.2023й" / "07-2023" — only month+year given: use the
  // last day of that month (matches this app's existing data convention).
  const mmYYYY = s.match(/^(\d{1,2})[.\-/](\d{4})/);
  if (mmYYYY) {
    const [, m, y] = mmYYYY;
    return new Date(Date.UTC(+y, +m, 0));
  }
  const yyyyMM = s.match(/^(\d{4})[.\-/](\d{1,2})/);
  if (yyyyMM) {
    const [, y, m] = yyyyMM;
    return new Date(Date.UTC(+y, +m, 0));
  }
  return null;
}

const toISO = (date) => (date instanceof Date && !isNaN(date) ? date.toISOString() : null);

function matchDeviceTypeId(nameOrCategory, deviceTypes) {
  const target = norm(nameOrCategory);
  if (!target) return null;
  const hit = deviceTypes.find((dt) => {
    const dtName = norm(dt.name);
    return dtName && (target.includes(dtName) || dtName.includes(target));
  });
  return hit?.id ?? null;
}

function isPositiveInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && Number.isInteger(n);
}

/* ── parse the sheet into { devices, warnings } ── */
function parseWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });

  const devices = [];
  const warnings = [];
  let currentCategory = '';

  for (let r = HEADER_ROWS; r < grid.length; r++) {
    const row = grid[r];
    if (!row || row.every((c) => c === '' || c == null)) continue; // blank spacer row

    const rowNo = row[COL.ROW_NO];
    const name = String(row[COL.NAME] ?? '').trim();
    const regNumber = String(row[COL.REG_NUMBER] ?? '').trim();
    const serialNumber = String(row[COL.SERIAL_NUMBER] ?? '').trim();

    const looksLikeDataRow = isPositiveInt(rowNo) && !!name;
    const looksLikeCategoryRow = !isPositiveInt(rowNo) && !!name && !regNumber && !serialNumber;

    if (looksLikeCategoryRow) {
      currentCategory = name;
      continue;
    }
    if (!looksLikeDataRow) continue; // unrecognized row — skip rather than guess

    /* device type: checkbox columns first, category text as fallback */
    let deviceTypeKeywordHit = null;
    for (const { col, keywords } of DEVICE_TYPE_CHECK_COLUMNS) {
      const cell = norm(row[col]);
      if (cell) {
        deviceTypeKeywordHit = keywords;
        break;
      }
    }

    const inspections = TEST_TYPE_COLUMNS.map(({ label, testCol, nextCol }) => {
      const testDate = parseFlexibleDate(row[testCol]);
      const nextDate = parseFlexibleDate(row[nextCol]);
      if (!testDate && !nextDate) return null;
      return { label, testDate, nextDate };
    }).filter(Boolean);

    devices.push({
      rowIndex: r + 1, // 1-based, matches what a human sees in Excel
      name,
      regNumber,
      serialNumber,
      responsiblePerson: String(row[COL.RESPONSIBLE_PERSON] ?? '').trim(),
      commissioning_date: parseFlexibleDate(row[COL.COMMISSIONING_DATE]),
      passportText: String(row[COL.PASSPORT_TEXT] ?? '').trim(),
      category: currentCategory,
      deviceTypeKeywordHit,
      inspections,
    });
  }

  console.log('devices', devices);

  if (devices.length === 0) {
    warnings.push('warningNoRows');
  }

  return { devices, warnings };
}

const STATUS = { IDLE: 'idle', PARSED: 'parsed', IMPORTING: 'importing', DONE: 'done' };

export default function ExcelImporter({ onClose }) {
  const t = useTranslations('excelImporter');
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState(STATUS.IDLE);
  const [fileName, setFileName] = useState('');
  const [parsedDevices, setParsedDevices] = useState([]);
  const [parseWarnings, setParseWarnings] = useState([]);
  const [facilityId, setFacilityId] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [successLogs, setSuccessLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  /* ── the 3 backend-required fields that have no source column in the sheet ── */
  const [categoryTypeMap, setCategoryTypeMap] = useState({}); // { [category]: device_type_id }
  const [manufacturerDefault, setManufacturerDefault] = useState('');
  const [globalDeviceTypeId, setGlobalDeviceTypeId] = useState('');
  /* ── per-row device-type override (seeded from categoryTypeMap, editable per row) ── */
  const [rowTypeOverride, setRowTypeOverride] = useState({}); // { [rowIndex]: device_type_id }
  /* ── per-row create status, for the single-row upload button ── */
  const [rowStatus, setRowStatus] = useState({}); // { [rowIndex]: { state: 'loading'|'success'|'error', message } }

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  /* ── reuse the shared facility/device-type stores instead of a separate fetch;
     only hit the API if the store hasn't been populated by another page yet ── */
  const { facilities: storedFacilities, setFacilities } = useFacilityStore();
  const { deviceTypes: storedDeviceTypes, setDeviceTypes } = useDeviceTypeStore();
  const { reset: resetDeviceStore } = useDeviceStore();
  const { reset: resetTestLogStore } = useTestLogStore();
  const facilities = React.useMemo(() => storedFacilities.filter(Boolean), [storedFacilities]);
  const deviceTypes = React.useMemo(() => storedDeviceTypes.filter(Boolean), [storedDeviceTypes]);

  React.useEffect(() => {
    if (!session?.accessToken) return;
    if (storedFacilities.length === 0) {
      request
        .get(`/${URLS.facilities}`, { params: { limit: 1000 }, headers: authHeader })
        .then((res) => setFacilities((res.data?.data ?? []).filter(Boolean)))
        .catch(() => {});
    }
    if (storedDeviceTypes.length === 0) {
      request
        .get(`/${URLS.deviceTypes}`, { params: { limit: 1000 }, headers: authHeader })
        .then((res) => setDeviceTypes((res.data?.data ?? []).filter(Boolean)))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  /* ── auto-prefill category → device_type mapping once both are known ── */
  React.useEffect(() => {
    if (!parsedDevices.length || !deviceTypes.length) return;
    setCategoryTypeMap((prev) => {
      const next = { ...prev };
      const cats = new Set(parsedDevices.map((d) => d.category).filter(Boolean));
      cats.forEach((cat) => {
        if (!next[cat]) {
          const id = matchDeviceTypeId(cat, deviceTypes);
          if (id) next[cat] = id;
        }
      });
      return next;
    });
  }, [parsedDevices, deviceTypes]);

  const uniqueCategories = [...new Set(parsedDevices.map((d) => d.category).filter(Boolean))];
  const uncategorizedCount = parsedDevices.filter((d) => !d.category).length;

  /* ── resolution order: sheet checkbox match → per-row manual override → global override → category default ── */
  const effectiveDeviceTypeId = (row) =>
    matchDeviceTypeId(row.deviceTypeKeywordHit?.[0], deviceTypes) ||
    rowTypeOverride[row.rowIndex] ||
    globalDeviceTypeId ||
    categoryTypeMap[row.category] ||
    null;

  const allRowsResolved = parsedDevices.length > 0 && parsedDevices.every(effectiveDeviceTypeId);
  const canImport = !!facilityId && manufacturerDefault.trim().length > 0 && allRowsResolved;

  const handleFile = async (file) => {
    if (!file || isReadingFile) return;
    setFileName(file.name);
    setIsReadingFile(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const { devices, warnings } = parseWorkbook(workbook);
      setParsedDevices(devices);
      setParseWarnings(warnings);
      setSuccessLogs([]);
      setErrorLogs([]);
      setCategoryTypeMap({});
      setStatus(STATUS.PARSED);
    } finally {
      setIsReadingFile(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  /* ── creates ONE device (+ its inspections as test-logs). Shared by the
     bulk "import all" flow and each row's individual upload button. ── */
  const importOneRow = async (row, index) => {
    const ts = Date.now();
    const deviceTypeId = effectiveDeviceTypeId(row);

    if (!deviceTypeId) {
      return { ok: false, error: t('errDeviceTypeMissing') };
    }

    const earliestTestDate = row.inspections
      .map((insp) => insp.testDate)
      .filter(Boolean)
      .sort((a, b) => a - b)[0];

    const payload = {
      name: row.name,
      is_active: true,
      facility_id: facilityId,
      device_type_id: deviceTypeId,
      manufacturer_details: manufacturerDefault.trim(),
      commissioning_date: row.commissioning_date,
      serial_number: row.serialNumber || `TEMP-SN-${ts}-${index}`,
      ecosystem_reg_number: row.regNumber || `TEMP-REG-${ts}-${index}`,
      passport_specifications: {
        ...(row.passportText ? { raw_text: row.passportText } : {}),
        ...(row.responsiblePerson ? { responsible_person: row.responsiblePerson } : {}),
        ...(row.category ? { category: row.category } : {}),
      },
    };

    try {
      const res = await request.post(`/${URLS.device}`, payload, { headers: authHeader });
      const deviceId = res.data?.id ?? res.data?.data?.id;

      let inspectionErrors = 0;
      for (const insp of row.inspections) {
        if (!insp.nextDate) continue; // next_test_date is required by the API
        try {
          await request.post(
            `/${URLS.testLogs}`,
            {
              device_id: deviceId,
              test_type: insp.label,
              test_date: toISO(insp.testDate) ?? toISO(insp.nextDate),
              next_test_date: toISO(insp.nextDate),
            },
            { headers: authHeader }
          );
        } catch {
          inspectionErrors++;
        }
        await sleep(SLEEP_MS);
      }

      return {
        ok: true,
        note: inspectionErrors ? t('errInspectionsSkipped', { count: inspectionErrors }) : null,
      };
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => (typeof d === 'string' ? d : d.msg)).join('; ')
        : (detail ?? err?.message ?? t('errUnknown'));
      return { ok: false, error: msg };
    }
  };

  /* ── single-row upload button ── */
  const uploadSingleRow = async (row, index) => {
    if (!facilityId || !manufacturerDefault.trim()) return;
    setRowStatus((p) => ({ ...p, [row.rowIndex]: { state: 'loading' } }));
    const result = await importOneRow(row, index);
    setRowStatus((p) => ({
      ...p,
      [row.rowIndex]: result.ok
        ? { state: 'success', message: result.note }
        : { state: 'error', message: result.error },
    }));
    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: [KEYS.device] });
      resetDeviceStore();
      resetTestLogStore();
    }
  };

  const startImport = async () => {
    if (!canImport) return;
    setStatus(STATUS.IMPORTING);
    setProgress({ done: 0, total: parsedDevices.length });
    const okLogs = [];
    const failLogs = [];

    for (let i = 0; i < parsedDevices.length; i++) {
      const row = parsedDevices[i];
      setRowStatus((p) => ({ ...p, [row.rowIndex]: { state: 'loading' } }));
      const result = await importOneRow(row, i);

      if (result.ok) {
        okLogs.push({ row: row.rowIndex, name: row.name, note: result.note });
        setRowStatus((p) => ({ ...p, [row.rowIndex]: { state: 'success', message: result.note } }));
      } else {
        failLogs.push({ row: row.rowIndex, name: row.name, error: result.error });
        setRowStatus((p) => ({ ...p, [row.rowIndex]: { state: 'error', message: result.error } }));
      }

      setProgress({ done: i + 1, total: parsedDevices.length });
      await sleep(SLEEP_MS);
    }

    setSuccessLogs(okLogs);
    setErrorLogs(failLogs);
    setStatus(STATUS.DONE);
    queryClient.invalidateQueries({ queryKey: [KEYS.device] });
    if (okLogs.length) {
      resetDeviceStore();
      resetTestLogStore();
    }
  };

  const reset = () => {
    setStatus(STATUS.IDLE);
    setFileName('');
    setParsedDevices([]);
    setParseWarnings([]);
    setSuccessLogs([]);
    setErrorLogs([]);
    setProgress({ done: 0, total: 0 });
    setCategoryTypeMap({});
    setManufacturerDefault('');

    setRowTypeOverride({});
    setRowStatus({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── dropzone ── */}
      {status === STATUS.IDLE && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isReadingFile) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={isReadingFile ? undefined : onDrop}
          onClick={() => !isReadingFile && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors ${
            isReadingFile ? 'cursor-wait' : 'cursor-pointer'
          } ${
            dragOver
              ? 'border-[#3b82f6] bg-[#3b82f6]/5'
              : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#3b82f6]/50'
          }`}
        >
          {isReadingFile ? (
            <>
              <Loader2 size={32} className="text-[#3b82f6] animate-spin" />
              <p className="text-[14px] font-medium text-[#031634] dark:text-slate-100">
                {fileName} {t('readingFile')}
              </p>
              <p className="text-[12px] text-[#7B8499] dark:text-slate-400">{t('readingHint')}</p>
            </>
          ) : (
            <>
              <UploadCloud size={32} className="text-[#3b82f6]" />
              <p className="text-[14px] font-medium text-[#031634] dark:text-slate-100">
                {t('dropHint')}
              </p>
              <p className="text-[12px] text-[#7B8499] dark:text-slate-400">{t('dropFormats')}</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            disabled={isReadingFile}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* ── parsed preview + facility select ── */}
      {status === STATUS.PARSED && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 p-3">
            <FileSpreadsheet size={20} className="text-[#3b82f6] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate">
                {fileName}
              </p>
              <p className="text-[12px] text-[#7B8499] dark:text-slate-400">
                {t('devicesFound', { count: parsedDevices.length })}
              </p>
            </div>
            <button
              onClick={reset}
              className="text-[12px] text-[#7B8499] hover:text-red-500 transition-colors shrink-0"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {parseWarnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 text-[12px] text-amber-700 dark:text-amber-400"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {t(w)}
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-medium">{t('facilityLabel')}</Label>
            <Select value={facilityId} onValueChange={setFacilityId}>
              <SelectTrigger className="w-full text-[14px]">
                <SelectValue placeholder={t('facilityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* required fields the sheet has no column for */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium">{t('manufacturerLabel')}</Label>
              <Input
                value={manufacturerDefault}
                onChange={(e) => setManufacturerDefault(e.target.value)}
                placeholder={t('manufacturerPlaceholder')}
                className="text-[14px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium">{t('globalTypeLabel')}</Label>
              <Select value={globalDeviceTypeId} onValueChange={setGlobalDeviceTypeId}>
                <SelectTrigger className="w-full text-[14px]">
                  <SelectValue placeholder={t('globalTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {dt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {uncategorizedCount > 0 && !globalDeviceTypeId && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3 text-[12px] text-red-700 dark:text-red-400">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {t('uncategorizedWarning', { count: uncategorizedCount })}
            </div>
          )}

          {uniqueCategories.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-medium">{t('categoryMapLabel')}</Label>
              <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 p-3">
                {uniqueCategories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="flex-1 min-w-0 truncate text-[13px] text-[#031634] dark:text-slate-100">
                      {cat}
                    </span>
                    <Select
                      value={categoryTypeMap[cat] ?? ''}
                      onValueChange={(v) => setCategoryTypeMap((p) => ({ ...p, [cat]: v }))}
                    >
                      <SelectTrigger className="w-56 text-[13px]">
                        <SelectValue placeholder={t('categoryTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map((dt) => (
                          <SelectItem key={dt.id} value={dt.id}>
                            {dt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto rounded-xl border border-[#E2E8F0] dark:border-slate-700">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[#F8FAFC] dark:bg-slate-800">
                <tr className="text-left text-[#7B8499] dark:text-slate-400">
                  <th className="px-3 py-2">{t('colRow')}</th>
                  <th className="px-3 py-2">{t('colName')}</th>
                  <th className="px-3 py-2">{t('colReg')}</th>
                  <th className="px-3 py-2">{t('colSerial')}</th>

                  <th className="px-3 py-2">{t('colTests')}</th>
                  <th className="px-3 py-2 text-right">{t('colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F1F5] dark:divide-slate-700/40">
                {parsedDevices.map((d, idx) => {
                  const effectiveTypeId =
                    matchDeviceTypeId(d.deviceTypeKeywordHit?.[0], deviceTypes) ||
                    rowTypeOverride[d.rowIndex] ||
                    globalDeviceTypeId ||
                    categoryTypeMap[d.category] ||
                    '';
                  const rs = rowStatus[d.rowIndex];
                  const rowReady = !!facilityId && !!manufacturerDefault.trim();
                  return (
                    <tr key={d.rowIndex}>
                      <td className="px-3 py-1.5 text-[#7B8499]">{d.rowIndex}</td>
                      <td className="px-3 py-1.5 font-medium text-[#031634] dark:text-slate-100">
                        {d.name}
                      </td>
                      <td className="px-3 py-1.5 font-mono">{d.regNumber || '—'}</td>
                      <td className="px-3 py-1.5 font-mono">{d.serialNumber || '—'}</td>

                      <td className="px-3 py-1.5">{d.inspections.length}</td>
                      <td className="px-3 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => uploadSingleRow(d, idx)}
                          disabled={!rowReady || !effectiveTypeId || rs?.state === 'loading'}
                          title={
                            rs?.state === 'error'
                              ? rs.message
                              : rs?.state === 'success'
                                ? t('rowUploadTitleSuccess')
                                : t('rowUploadTitleDefault')
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#7B8499] hover:bg-[#3b82f6]/10 hover:text-[#3b82f6] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                          {rs?.state === 'loading' ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : rs?.state === 'success' ? (
                            <CheckCircle2 size={13} className="text-emerald-500" />
                          ) : rs?.state === 'error' ? (
                            <XCircle size={13} className="text-red-500" />
                          ) : (
                            <Upload size={13} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              onClick={startImport}
              disabled={!canImport || parsedDevices.length === 0}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {t('importButton', { count: parsedDevices.length })}
            </Button>
          </div>
        </div>
      )}

      {/* ── importing / done ── */}
      {(status === STATUS.IMPORTING || status === STATUS.DONE) && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {status === STATUS.IMPORTING ? (
              <Loader2 size={18} className="animate-spin text-[#3b82f6]" />
            ) : errorLogs.length ? (
              <AlertTriangle size={18} className="text-amber-500" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-500" />
            )}
            <span className="text-[14px] font-medium text-[#031634] dark:text-slate-100">
              {progress.done} / {progress.total}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3b82f6] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>

          {status === STATUS.DONE && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 p-3">
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400">
                    {t('success')}
                  </p>
                  <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300">
                    {successLogs.length}
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 p-3">
                  <p className="text-[12px] text-red-600 dark:text-red-400">{t('error')}</p>
                  <p className="text-[20px] font-bold text-red-700 dark:text-red-300">
                    {errorLogs.length}
                  </p>
                </div>
              </div>

              {errorLogs.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-red-200 dark:border-red-800/50 divide-y divide-red-100 dark:divide-red-900/40">
                  {errorLogs.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 text-[12px]">
                      <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <span>
                        <b>#{e.row}</b> {e.name}: <span className="text-red-600">{e.error}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Button type="button" variant="outline" onClick={reset}>
                  {t('reimport')}
                </Button>
                <Button onClick={onClose} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                  {t('finish')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
