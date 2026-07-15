'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Plus,
  Loader2,
  Search,
  Clock,
  XCircle,
  AlertTriangle,
  CalendarIcon,
  FileText,
  FlaskConical,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import TableComponent from '@/components/tableComponent';
import CustomModal from '@/components/modals/CustomModal';
import PaginationComponent from '@/components/PaginationComponent';
import StatCard from '@/components/StatCard';
import {
  getTestLogStatus,
  TEST_LOG_ROW_BG,
  TestLogStatusBadge,
  TestResultBadge,
} from '@/components/devices/testLogStatus';
import DeviceCombobox from '@/components/devices/DeviceCombobox';

const LIMIT = 15;
const STATUS_ORDER = ['overdue', 'expiring_soon', 'warning', 'ok', 'never_tested'];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function DatePickerField({ value, onChange, placeholder, locale }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const formatted = date
    ? date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-[14px] bg-background transition-colors',
            'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-input',
            !formatted && 'text-muted-foreground'
          )}
        >
          <span>{formatted ?? placeholder}</span>
          <CalendarIcon size={15} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          endMonth={new Date(new Date().getFullYear() + 20, 11, 31)}
          onSelect={(d) => {
            onChange(d ? d.toISOString() : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ── TestLogForm ─────────────────────────────────────────────── */
function TestLogForm({ initialData, onSubmit, onClose, isPending, t, devices, locale }) {
  const [form, setForm] = useState({
    device_id: initialData?.device_id ?? '',
    test_type: initialData?.test_type ?? '',
    test_protocol_number: initialData?.test_protocol_number ?? '',
    description: initialData?.description ?? '',
    test_date: initialData?.test_date ?? '',
    next_test_date: initialData?.next_test_date ?? '',
    is_passed:
      initialData?.is_passed === true
        ? 'passed'
        : initialData?.is_passed === false
          ? 'failed'
          : 'unknown',
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.device_id) errs.device_id = t('deviceError');
    if (!form.test_type.trim()) errs.test_type = t('testTypeError');
    if (!form.test_date) errs.test_date = t('dateError');
    if (!form.next_test_date) errs.next_test_date = t('dateError');
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      device_id: form.device_id,
      test_type: form.test_type.trim(),
      test_date: form.test_date,
      next_test_date: form.next_test_date,
      is_passed: form.is_passed === 'passed' ? true : form.is_passed === 'failed' ? false : null,
    };
    if (form.test_protocol_number.trim())
      payload.test_protocol_number = form.test_protocol_number.trim();
    if (form.description.trim()) payload.description = form.description.trim();
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Device */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('deviceLabel')} *</Label>
        <Select value={form.device_id} onValueChange={(v) => set('device_id', v)}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('devicePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {(devices ?? []).filter(Boolean).map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
                {d.serial_number ? ` · ${d.serial_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.device_id && <p className="text-xs text-destructive">{errors.device_id}</p>}
      </div>

      {/* Test type + Protocol */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('testTypeLabel')} *</Label>
          <Input
            value={form.test_type}
            onChange={(e) => set('test_type', e.target.value)}
            placeholder={t('testTypePlaceholder')}
            className="text-[14px]"
          />
          {errors.test_type && <p className="text-xs text-destructive">{errors.test_type}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('protocolLabel')}</Label>
          <Input
            value={form.test_protocol_number}
            onChange={(e) => set('test_protocol_number', e.target.value)}
            placeholder={t('protocolPlaceholder')}
            className="text-[14px]"
          />
        </div>
      </div>

      {/* Test date + Next test date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('testDateLabel')} *</Label>
          <DatePickerField
            value={form.test_date}
            onChange={(v) => set('test_date', v)}
            placeholder={t('datePlaceholder')}
            locale={locale}
          />
          {errors.test_date && <p className="text-xs text-destructive">{errors.test_date}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('nextTestDateLabel')} *</Label>
          <DatePickerField
            value={form.next_test_date}
            onChange={(v) => set('next_test_date', v)}
            placeholder={t('datePlaceholder')}
            locale={locale}
          />
          {errors.next_test_date && (
            <p className="text-xs text-destructive">{errors.next_test_date}</p>
          )}
        </div>
      </div>

      {/* Result */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('resultLabel')}</Label>
        <Select value={form.is_passed} onValueChange={(v) => set('is_passed', v)}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('resultPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">{t('resultUnknown')}</SelectItem>
            <SelectItem value="passed">{t('resultPassed')}</SelectItem>
            <SelectItem value="failed">{t('resultFailed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('descriptionLabel')}</Label>
        <Input
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          className="text-[14px]"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onClose} className="text-[13px]">
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="text-[13px] dark:text-white bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              {t('saving')}
            </span>
          ) : (
            t('save')
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function TestLogsPage() {
  const { data: session } = useSession();
  const t = useTranslations('testLogs');
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [filterProtocol, setFilterProtocol] = useState('');
  const [filterDeviceId, setFilterDeviceId] = useState('');
  const [filterTestType, setFilterTestType] = useState('');
  const [filterUnitCode, setFilterUnitCode] = useState('');
  const [filterIsPassed, setFilterIsPassed] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortHeader = (label, key) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 hover:text-[#3b82f6] transition-colors"
    >
      {label}
      {sortKey === key ? (
        sortDir === 'asc' ? (
          <ArrowUp size={12} />
        ) : (
          <ArrowDown size={12} />
        )
      ) : (
        <ArrowUpDown size={12} className="opacity-40" />
      )}
    </button>
  );

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const debouncedProtocol = useDebounce(filterProtocol, 500);
  const debouncedTestType = useDebounce(filterTestType, 500);
  const debouncedUnitCode = useDebounce(filterUnitCode, 1000);

  useEffect(() => {
    setPage(1);
  }, [debouncedProtocol, debouncedTestType, debouncedUnitCode]);

  const offset = (page - 1) * LIMIT;

  const hasFilters =
    filterProtocol || filterDeviceId || filterTestType || filterUnitCode || filterIsPassed;

  const clearFilters = () => {
    setFilterProtocol('');
    setFilterDeviceId('');
    setFilterTestType('');
    setFilterUnitCode('');
    setFilterIsPassed('');
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  /* ── queries ─────────────────────────────────────────────── */
  const { data: logsData, isLoading } = useGetQuery({
    key: KEYS.testLogs,
    url: URLS.testLogs,
    params: {
      limit: LIMIT,
      offset,
      ...(debouncedProtocol.trim() ? { test_protocol_number: debouncedProtocol.trim() } : {}),
      ...(filterDeviceId && filterDeviceId.trim() ? { device_id: filterDeviceId.trim() } : {}),
      ...(debouncedTestType.trim() ? { test_type: debouncedTestType.trim() } : {}),
      ...(debouncedUnitCode.trim() ? { unit_code: debouncedUnitCode.trim() } : {}),
      ...(filterIsPassed.trim() ? { is_passed: filterIsPassed.trim() === 'true' } : {}),
    },
    headers: authHeader,
    enabled: !!session,
  });

  const { data: devicesData } = useGetQuery({
    key: `${KEYS.device}-for-logs`,
    url: URLS.device,
    params: { limit: 200 },
    headers: authHeader,
    enabled: !!session,
  });

  const logs = (logsData?.data?.data ?? []).filter(Boolean);
  const totalCount = logsData?.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);
  const devices = (devicesData?.data?.data ?? []).filter(Boolean);

  /* ── sort the current page's rows by the clicked column (client-side, current page only) ── */
  const sortedLogs = useMemo(() => {
    if (!sortKey) return logs;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...logs].sort((a, b) => {
      if (sortKey === 'test_type') {
        return (a.test_type ?? '').localeCompare(b.test_type ?? '') * dir;
      }
      if (sortKey === 'status') {
        const av = STATUS_ORDER.indexOf(getTestLogStatus(a.next_test_date, a.is_passed));
        const bv = STATUS_ORDER.indexOf(getTestLogStatus(b.next_test_date, b.is_passed));
        return (av - bv) * dir;
      }
      const av = a[sortKey] ? new Date(a[sortKey]).getTime() : -Infinity;
      const bv = b[sortKey] ? new Date(b[sortKey]).getTime() : -Infinity;
      return (av - bv) * dir;
    });
  }, [logs, sortKey, sortDir]);

  const deviceMap = useMemo(() => {
    const m = {};
    devices.forEach((d) => {
      if (d?.id) m[d.id] = d;
    });
    return m;
  }, [devices]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  /* ── status counts (computed locally from next_test_date) ── */
  const statusCounts = useMemo(() => {
    const c = { ok: 0, warning: 0, expiring_soon: 0, overdue: 0, never_tested: 0 };
    logs.forEach((l) => {
      const s = getTestLogStatus(l.next_test_date, l.is_passed);
      c[s]++;
    });
    return c;
  }, [logs]);

  /* ── mutations ───────────────────────────────────────────── */
  const { mutate: createLog, isPending: creating } = usePostQuery({
    listKeyId: KEYS.testLogs,
    hideSuccessToast: true,
  });
  const { mutate: updateLog, isPending: updating } = usePatchPythonQuery({
    listKeyId: KEYS.testLogs,
    hideSuccessToast: true,
  });
  const { mutate: deleteLog, isPending: deleting } = useDeleteQuery({
    listKeyId: KEYS.testLogs,
    hideSuccessToast: true,
  });

  const handleSubmit = (payload) => {
    if (editData) {
      updateLog(
        {
          url: `${URLS.testLogs}/${editData.id}`,
          attributes: payload,
          config: { headers: authHeader },
        },
        {
          onSuccess: () => {
            toast.success(t('successUpdated'));
            closeModal();
          },
          onError: () => toast.error(t('errorUpdate')),
        }
      );
    } else {
      createLog(
        { url: URLS.testLogs, attributes: payload, config: { headers: authHeader } },
        {
          onSuccess: () => {
            toast.success(t('successCreated'));
            closeModal();
          },
          onError: () => toast.error(t('errorCreate')),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteLog(
      { url: `${URLS.testLogs}/${deleteTarget.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          toast.success(t('successDeleted'));
          setDeleteTarget(null);
        },
        onError: () => toast.error(t('errorDelete')),
      }
    );
  };

  const openCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditData(row);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  /* ── table data ──────────────────────────────────────────── */
  const tableData = sortedLogs.map((log, i) => {
    const dev = deviceMap[log.device_id] ?? {};
    const status = getTestLogStatus(log.next_test_date, log.is_passed);
    return {
      _tr: i + 1,
      ...log,
      _rowStatus: log.is_passed === true ? 'passed' : status,
      _device: (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[#031634] dark:text-slate-100 text-[13px]">
            {dev.name ?? (log.device_id ? log.device_id.slice(0, 8) + '…' : '—')}
          </span>
          {dev.serial_number && (
            <span className="font-mono text-[11px] text-[#7B8499] dark:text-slate-500">
              {dev.serial_number}
            </span>
          )}
        </div>
      ),
      _testDate: fmtDate(log.test_date),
      _nextDate: fmtDate(log.next_test_date),
      _status: log.is_passed ? (
        <TestResultBadge isPassed={log.is_passed} t={t} />
      ) : (
        <TestLogStatusBadge status={status} t={t} />
      ),
    };
  });

  const columns = [
    { key: '_tr', label: '#' },
    { key: '_device', label: t('colDevice') },
    { key: 'test_type', label: sortHeader(t('colTestType'), 'test_type') },
    { key: 'test_protocol_number', label: t('colProtocol') },
    { key: '_testDate', label: sortHeader(t('colTestDate'), 'test_date') },
    { key: '_nextDate', label: sortHeader(t('colNextDate'), 'next_test_date') },
    { key: '_status', label: sortHeader(t('colStatus'), 'status') },
    { key: 'action', label: t('colActions'), align: 'right' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20">
            <FlaskConical size={22} className="text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#031634] dark:text-slate-100">{t('title')}</h1>
            <p className="text-[13px] text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl h-10 px-5 text-[13px] font-medium shadow-sm"
        >
          <Plus size={16} />
          {t('addNew')}
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('total')} value={totalCount} icon={ClipboardList} iconColor="#3b82f6" />
        <StatCard
          label={t('statusWarning')}
          value={statusCounts.warning}
          icon={AlertTriangle}
          iconColor="#eab308"
        />
        <StatCard
          label={t('statusExpiring')}
          value={statusCounts.expiring_soon}
          icon={Clock}
          iconColor="#f97316"
        />
        <StatCard
          label={t('statusOverdue')}
          value={statusCounts.overdue}
          icon={XCircle}
          iconColor="#ef4444"
        />
      </div>

      {/* ── Table card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        {/* ── Toolbar: title + protocol search ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#F0F1F5] dark:border-slate-700/40">
          <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-[#3b82f6]" />
            {t('listTitle')}
            <span className="ml-1 rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6]">
              {totalCount}
            </span>
          </h2>
          <div className="relative w-full sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8499] dark:text-slate-500"
            />
            <input
              value={filterProtocol}
              onChange={(e) => setFilterProtocol(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-md border border-[#E2E8F0] dark:border-slate-700 bg-[#F8F9FB] dark:bg-slate-700/50 pl-8 pr-4 py-2 text-[14px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </div>
        </div>

        {/* ── Filter row ── */}
        <div className="flex flex-wrap items-end gap-3 px-5 py-3 border-b border-[#F0F1F5] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/60">
          {/* Device filter */}
          <div className="flex flex-col gap-1" style={{ maxWidth: '400px', width: '100%' }}>
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('filterDeviceLabel')}
            </Label>
            <DeviceCombobox
              value={filterDeviceId.trim()}
              onChange={handleFilterChange(setFilterDeviceId)}
              devices={devices}
              placeholder={t('filterDevice')}
              allLabel={t('filterAll')}
              triggerClassName="h-8 py-0 text-[14px] rounded-md border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Test type filter */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('filterTestTypeLabel')}
            </Label>
            <input
              value={filterTestType}
              onChange={(e) => setFilterTestType(e.target.value)}
              placeholder={t('filterTestType')}
              className="h-8 w-44 rounded-md border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[14px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </div>

          {/* Unit code filter */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('filterUnitCodeLabel')}
            </Label>
            <input
              value={filterUnitCode}
              onChange={(e) => setFilterUnitCode(e.target.value)}
              placeholder={t('filterUnitCode')}
              className="h-8 w-36 rounded-md border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[14px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </div>

          {/* Result filter */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-[#7B8499] dark:text-slate-400">
              {t('filterResultLabel')}
            </Label>
            <Select value={filterIsPassed} onValueChange={handleFilterChange(setFilterIsPassed)}>
              <SelectTrigger className="h-8 w-40 text-[14px] rounded-md border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800">
                <SelectValue placeholder={t('filterResult')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">{t('filterAll')}</SelectItem>
                <SelectItem value="true">{t('resultPassed')}</SelectItem>
                <SelectItem value="false">{t('resultFailed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 px-3 text-[14px] font-medium text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <X size={12} />
              {t('clearFilters')}
            </button>
          )}
        </div>

        {/* ── Table body ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-[14px] text-[#7B8499] dark:text-slate-400">{t('empty')}</p>
          </div>
        ) : (
          <TableComponent
            column={columns}
            data={tableData}
            onEdit={openEdit}
            handleDelete={(row) => setDeleteTarget(row)}
            rowClassName={(row) => TEST_LOG_ROW_BG[row._rowStatus] ?? ''}
          />
        )}

        <PaginationComponent
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={LIMIT}
          onChange={setPage}
        />
      </div>

      {/* ── Create / Edit modal ─────────────────────────────── */}
      <CustomModal
        open={modalOpen}
        onClose={closeModal}
        title={editData ? t('editTitle') : t('createTitle')}
        className="max-w-200! w-full"
      >
        <TestLogForm
          initialData={editData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isPending={creating || updating}
          t={t}
          devices={devices}
          locale={locale}
        />
      </CustomModal>

      {/* ── Delete modal ───────────────────────────────────── */}
      <CustomModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('deleteTitle')}
        className="max-w-sm"
      >
        <div className="flex flex-col gap-5 pt-1">
          <p className="text-[14px] text-[#3C4043] dark:text-slate-300">
            <span className="font-semibold text-[#031634] dark:text-slate-100">
              {deleteTarget?.test_type}
            </span>{' '}
            {t('deleteWarning')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="text-[13px]">
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  {t('deleting')}
                </span>
              ) : (
                t('confirmDelete')
              )}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
