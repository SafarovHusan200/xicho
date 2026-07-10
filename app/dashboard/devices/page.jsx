'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MonitorSpeaker,
  Plus,
  Loader2,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Activity,
  CalendarIcon,
  Trash2,
} from 'lucide-react';
import CountUp from 'react-countup';

import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

/* ── constants ─────────────────────────────────────────────── */
const LIMIT = 15;

const TEST_STATUS_CONFIG = {
  ok: { label: 'statusOk', color: '#10B981', icon: CheckCircle2 },
  expiring_soon: { label: 'statusExpiring', color: '#f59e0b', icon: Clock },
  overdue: { label: 'statusOverdue', color: '#ef4444', icon: XCircle },
  never_tested: { label: 'statusNever', color: '#94a3b8', icon: HelpCircle },
};

/* ── helpers ────────────────────────────────────────────────── */
function StatusBadge({ status, t }) {
  const cfg = TEST_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-muted-foreground text-[12px]">—</span>;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color, borderColor: `${cfg.color}30` }}
    >
      <Icon size={11} />
      {t(cfg.label)}
    </span>
  );
}

function ActiveBadge({ value }) {
  const tc = useTranslations('common');
  const color = value ? '#10B981' : '#94a3b8';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
      style={{ backgroundColor: `${color}18`, color, borderColor: `${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {value ? tc('yes') : tc('no')}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, iconColor, color }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
          {label}
        </span>
        {Icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon size={20} style={{ color: iconColor }} />
          </div>
        )}
      </div>
      <span className={`text-3xl font-bold ${color ?? 'text-[#031634] dark:text-slate-100'}`}>
        <CountUp start={0} end={value ?? 0} duration={1.4} />
      </span>
    </div>
  );
}

/* ── DatePickerField ────────────────────────────────────────── */
function DatePickerField({ value, onChange, placeholder = 'Sanani tanlang...' }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const formatted = date
    ? date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
          onSelect={(d) => {
            onChange(d ? d.toISOString() : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ── PassportSpecsEditor ────────────────────────────────────── */
function PassportSpecsEditor({ value, onChange, t }) {
  const [rows, setRows] = useState(() => {
    const obj = value && typeof value === 'object' ? value : {};
    return Object.entries(obj).map(([k, v]) => ({
      k,
      v: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
    }));
  });

  const parseVal = (v) => {
    const s = v.trim();
    if (s.startsWith('{') || s.startsWith('[')) {
      try {
        return JSON.parse(s);
      } catch {}
    }
    return v;
  };

  const syncToParent = (newRows) => {
    const obj = {};
    newRows.forEach(({ k, v }) => {
      if (k.trim()) obj[k.trim()] = parseVal(v);
    });
    onChange(obj);
  };

  const addRow = () => setRows((prev) => [...prev, { k: '', v: '' }]);

  const removeRow = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    syncToParent(next);
  };

  const updateRow = (i, field, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r));
    setRows(next);
    syncToParent(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.k}
            onChange={(e) => updateRow(i, 'k', e.target.value)}
            placeholder={t('passportKeyPlaceholder')}
            className="text-[13px] flex-1"
          />
          <Input
            value={row.v}
            onChange={(e) => updateRow(i, 'v', e.target.value)}
            placeholder={t('passportValPlaceholder')}
            className="text-[13px] flex-1"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-red-400 hover:text-red-600 p-1 shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-[13px] text-[#3b82f6] hover:underline text-left w-fit"
      >
        {t('passportAddRow')}
      </button>
    </div>
  );
}

/* ── DeviceForm ─────────────────────────────────────────────── */
function DeviceForm({ initialData, onSubmit, onClose, isPending, t, deviceTypes, facilities }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    serial_number: initialData?.serial_number ?? '',
    ecosystem_reg_number: initialData?.ecosystem_reg_number ?? '',
    manufacturer_details: initialData?.manufacturer_details ?? '',
    device_type_id: initialData?.device_type_id ?? '',
    facility_id: initialData?.facility_id ?? '',
    commissioning_date: initialData?.commissioning_date ?? '',
    passport_specifications: initialData?.passport_specifications ?? {},
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: t('nameError') });
      return;
    }

    const payload = {
      name: form.name.trim(),
      is_active: form.is_active,
    };
    if (form.serial_number.trim()) payload.serial_number = form.serial_number.trim();
    if (form.ecosystem_reg_number.trim())
      payload.ecosystem_reg_number = form.ecosystem_reg_number.trim();
    if (form.manufacturer_details.trim())
      payload.manufacturer_details = form.manufacturer_details.trim();
    if (form.device_type_id) payload.device_type_id = form.device_type_id;
    if (form.facility_id) payload.facility_id = form.facility_id;
    if (form.commissioning_date) payload.commissioning_date = form.commissioning_date;
    payload.passport_specifications = form.passport_specifications ?? {};

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('nameLabel')} *</Label>
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('namePlaceholder')}
          className="text-[14px]"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Serial + Eco */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('serialLabel')}</Label>
          <Input
            value={form.serial_number}
            onChange={(e) => set('serial_number', e.target.value)}
            placeholder={t('serialPlaceholder')}
            className="text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[14px] font-medium">{t('ecoLabel')}</Label>
            <a
              href="https://ekotizim.cirns.uz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              ekotizim.cirns.uz
            </a>
          </div>
          <Input
            value={form.ecosystem_reg_number}
            onChange={(e) => set('ecosystem_reg_number', e.target.value)}
            placeholder={t('ecoPlaceholder')}
            className="text-[14px]"
          />
        </div>
      </div>

      {/* Manufacturer + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('manufacturerLabel')}</Label>
          <Input
            value={form.manufacturer_details}
            onChange={(e) => set('manufacturer_details', e.target.value)}
            placeholder={t('manufacturerPlaceholder')}
            className="text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('commissioningLabel')}</Label>
          <DatePickerField
            value={form.commissioning_date}
            onChange={(v) => set('commissioning_date', v)}
          />
        </div>
      </div>

      {/* Device Type + Facility */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('typeLabel')}</Label>
          <Select value={form.device_type_id} onValueChange={(v) => set('device_type_id', v)}>
            <SelectTrigger className="w-full text-[14px]">
              <SelectValue placeholder={t('typePlaceholder')} />
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
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('facilityLabel')}</Label>
          <Select value={form.facility_id} onValueChange={(v) => set('facility_id', v)}>
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
      </div>

      {/* Passport specs */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('passportLabel')}</Label>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
          <PassportSpecsEditor
            value={form.passport_specifications}
            onChange={(v) => set('passport_specifications', v)}
            t={t}
          />
        </div>
      </div>

      {/* is_active */}
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
        <Checkbox
          id="dev_is_active"
          checked={form.is_active}
          onCheckedChange={(v) => set('is_active', v)}
          className={'-blue-500'}
        />
        <Label htmlFor="dev_is_active" className="cursor-pointer font-normal text-[14px]">
          {t('isActiveLabel')}
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl gap-2 text-white font-semibold"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
const DevicePage = () => {
  const { data: session } = useSession();
  const t = useTranslations('devices');
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const offset = (page - 1) * LIMIT;

  /* ── edit by URL param (?edit=id) ───────────────────────────── */
  const { data: editDeviceData } = useGetQuery({
    key: ['device-edit', editId],
    url: `${URLS.device}/${editId}`,
    headers: authHeader,
    enabled: !!editId && !!session?.accessToken,
  });

  useEffect(() => {
    const device = editDeviceData?.data;
    if (editId && device && !isOpen) {
      setSelectedItem(device);
      setIsOpen(true);
    }
  }, [editId, editDeviceData?.data]);

  const queryParams = useMemo(() => {
    const p = { limit: LIMIT, offset };
    if (search.trim()) p.name = search.trim();
    if (filterTypeId) p.device_type_id = filterTypeId;
    if (filterStatus) p.test_status = filterStatus;
    return p;
  }, [offset, search, filterTypeId, filterStatus]);

  /* queries */
  const {
    isLoading: isPending,
    data: listData,
    isFetching,
  } = useGetQuery({
    key: KEYS.device,
    url: URLS.device,
    params: queryParams,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const { data: deviceTypesData } = useGetQuery({
    key: KEYS.deviceTypes,
    url: URLS.deviceTypes,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session?.accessToken,
  });

  const { data: facilitiesData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: authHeader,
    enabled: !!session?.accessToken,
  });

  /* mutations */
  const { mutate: createDevice, isPending: isCreating } = usePostQuery({
    listKeyId: KEYS.device,
    hideSuccessToast: true,
    hideErrorToast: true,
  });
  const { mutate: updateDevice, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.device,
    hideSuccessToast: true,
    hideErrorToast: true,
  });
  const { mutate: deleteDevice, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.device,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const apiError = (err, fallback) => {
    const detail = err?.response?.data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d) => d.msg).join('; ')
      : typeof detail === 'string'
        ? detail
        : fallback;
    toast.error(msg || fallback);
  };

  const items = listData?.data?.data ?? [];
  const totalCount = listData?.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);
  const deviceTypes = deviceTypesData?.data?.data ?? [];
  const facilities = facilitiesData?.data?.data ?? [];

  const activeCount = items.filter((d) => d.is_active).length;
  const overdueCount = items.filter((d) => d.test_status === 'overdue').length;

  const getTypeName = (id) => deviceTypes.find((dt) => dt.id === id)?.name ?? '—';
  const getFacilityName = (id) => facilities.find((f) => f.id === id)?.name ?? '—';

  function handleFormSubmit(payload) {
    if (selectedItem) {
      updateDevice(
        {
          url: `${URLS.device}/${selectedItem.id}`,
          attributes: payload,
          config: { headers: authHeader },
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success(t('successUpdated'));
          },
          onError: (err) => apiError(err, t('errorUpdate')),
        }
      );
    } else {
      createDevice(
        { url: URLS.device, attributes: payload, config: { headers: authHeader } },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success(t('successCreated'));
          },
          onError: (err) => apiError(err, t('errorCreate')),
        }
      );
    }
  }

  function confirmDelete() {
    if (!selectedItem?.id) return;
    deleteDevice(
      { url: `${URLS.device}/${selectedItem.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          setDeleteModal(false);
          setSelectedItem(null);
          toast.success(t('successDeleted'));
        },
        onError: (err) => apiError(err, t('errorDelete')),
      }
    );
  }

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const tableData = items.map((item, i) => ({
    ...item,
    _rowNumber: offset + i + 1,
    _nameSerial: (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-[13px] text-[#031634] dark:text-slate-100">
          {item.name}
        </span>
      </div>
    ),
    _typeName: getTypeName(item.device_type_id),
    _facilityName: getFacilityName(item.facility_id),
    _statusBadge: <StatusBadge status={item.test_status} t={t} />,
    _activeBadge: <ActiveBadge value={item.is_active} />,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <MonitorSpeaker size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100 leading-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedItem(null);
            setIsOpen(true);
          }}
          className="gap-2 rounded-xl px-5 h-10 text-sm dark:text-white font-semibold shadow-md self-start sm:self-auto"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          <Plus size={16} />
          {t('addNew')}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('total')} value={totalCount} icon={MonitorSpeaker} iconColor="#3b82f6" />
        <StatCard
          label={t('active')}
          value={activeCount}
          icon={Activity}
          iconColor="#10B981"
          color="text-[#10B981]"
        />
        <StatCard
          label={t('statusOverdue')}
          value={overdueCount}
          icon={XCircle}
          iconColor="#ef4444"
          color="text-red-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 text-[14px]"
          />
        </div>
        <Select
          onValueChange={(v) => {
            setFilterTypeId(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-52 text-[14px]">
            <SelectValue placeholder={t('filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            {deviceTypes.map((dt) => (
              <SelectItem key={dt.id} value={dt.id}>
                {dt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => {
            setFilterStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-48 text-[14px]">
            <SelectValue placeholder={t('filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            {Object.entries(TEST_STATUS_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val}>
                {t(cfg.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
          <div className="flex items-center gap-2 text-[#031634] dark:text-slate-100">
            <MonitorSpeaker size={18} />
            <span className="font-semibold text-[15px]">{t('listTitle')}</span>
            {isFetching && <Loader2 size={14} className="animate-spin ml-1 text-[#3b82f6]" />}
          </div>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold border"
            style={{
              backgroundColor: 'var(--badge-blue-bg)',
              color: 'var(--badge-blue-text)',
              borderColor: 'var(--badge-blue-border)',
            }}
          >
            {totalCount} ta
          </span>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#7B8499]">
            <Loader2 size={22} className="animate-spin text-[#3b82f6]" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499]">
            <MonitorSpeaker size={40} className="text-slate-200 dark:text-slate-600" />
            <p className="text-sm">{t('empty')}</p>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setIsOpen(true);
              }}
              variant="outline"
              className="mt-1 gap-2 rounded-xl"
              style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
            >
              <Plus size={14} />
              {t('addFirst')}
            </Button>
          </div>
        ) : (
          <TableComponent
            column={[
              { key: '_rowNumber', label: '№', align: 'left' },
              { key: '_nameSerial', label: `${t('colName')}`, align: 'left' },
              { key: '_typeName', label: t('colType'), align: 'left' },
              { key: '_facilityName', label: t('colFacility'), align: 'left' },
              { key: '_statusBadge', label: t('colStatus'), align: 'center' },
              { key: '_activeBadge', label: t('colActive'), align: 'center' },
              { key: 'action', label: t('colActions'), align: 'right' },
            ]}
            data={tableData}
            viewHref={(row) => `/dashboard/devices/${row.id}`}
            onEdit={(row) => {
              setSelectedItem(row);
              setIsOpen(true);
            }}
            handleDelete={(row) => {
              setSelectedItem(row);
              setDeleteModal(true);
            }}
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

      {/* Create / Edit Modal */}
      <CustomModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          if (editId) router.replace('/dashboard/devices');
        }}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-200! w-full"
      >
        <div className="max-h-[70vh] overflow-y-auto px-1">
          <DeviceForm
            initialData={selectedItem}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsOpen(false);
              if (editId) router.replace('/dashboard/devices');
            }}
            isPending={isCreating || isUpdating}
            t={t}
            deviceTypes={deviceTypes}
            facilities={facilities}
          />
        </div>
      </CustomModal>

      {/* Delete Modal */}
      <CustomModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title={t('deleteTitle')}
        className="max-w-md! w-full"
      >
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              <span className="font-semibold">«{selectedItem?.name}»</span> {t('deleteWarning')}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              {isDeleting ? t('deleting') : t('confirmDelete')}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default DevicePage;
