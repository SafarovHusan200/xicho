'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MonitorSpeaker,
  Plus,
  Loader2,
  AlertTriangle,
  Search,
  XCircle,
  Activity,
  FileUp,
  X,
} from 'lucide-react';

import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
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
import TableComponent from '@/components/tableComponent';
import CustomModal from '@/components/modals/CustomModal';
import PaginationComponent from '@/components/PaginationComponent';
import ActiveBadge from '@/components/devices/ActiveBadge';
import StatCard from '@/components/StatCard';
import DeviceForm from '@/components/devices/DeviceForm';
import ExcelImporter from '@/components/devices/ExcelImporter';
import { TEST_STATUS_CONFIG } from '@/components/devices/statusConfig';
import TestLogCards from '@/components/devices/TestLogCards';
import { EmployeeCombobox } from '@/components/forms/PersonFormComponent';
import useDeviceStore from '@/store/useDeviceStore';
import useDeviceTypeStore from '@/store/useDeviceTypeStore';
import useTestLogStore from '@/store/useTestLogStore';
import { hasManageAccess } from '@/lib/permissions';
import { Input } from '@/components/ui/input';

/* ── constants ─────────────────────────────────────────────── */
const LIMIT = 15;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ── DeviceTestLogsPanel — filters the shared test-log store locally
   instead of firing a fresh per-device request every time a row expands ── */
function DeviceTestLogsPanel({ deviceId, locale }) {
  const t = useTranslations('testLogs');
  const { testLogs } = useTestLogStore();

  const logs = testLogs.filter((l) => l?.device_id === deviceId);

  return <TestLogCards logs={logs} locale={locale} t={t} isLoading={false} />;
}

/* ── Page ───────────────────────────────────────────────────── */
const DevicePage = () => {
  const { data: session } = useSession();
  const t = useTranslations('devices');
  const tc = useTranslations('common');
  const locale = useLocale();
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
  const [expandedDeviceIds, setExpandedDeviceIds] = useState(() => new Set());
  const [importOpen, setImportOpen] = useState(false);
  const canManage = hasManageAccess(session);

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

  const { deviceTypes: storedDeviceTypes, setDeviceTypes } = useDeviceTypeStore();
  const { testLogs: storedTestLogs, setTestLogs } = useTestLogStore();

  const { data: deviceTypesData } = useGetQuery({
    key: KEYS.deviceTypes,
    url: URLS.deviceTypes,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session?.accessToken && storedDeviceTypes.length === 0,
  });

  const { data: testLogsData } = useGetQuery({
    key: KEYS.testLogs,
    url: URLS.testLogs,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session?.accessToken && storedTestLogs.length === 0,
  });

  useEffect(() => {
    const data = deviceTypesData?.data?.data;
    if (data?.length) setDeviceTypes(data);
  }, [deviceTypesData]);

  useEffect(() => {
    const data = testLogsData?.data?.data;
    if (data?.length) setTestLogs(data);
  }, [testLogsData]);

  const { data: facilitiesData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: authHeader,
    enabled: !!session?.accessToken,
  });

  /* devices themselves aren't read from the store on this page (it's the primary
     paginated list), but other pages cache them there — reset it after any
     create/update/delete so those pages don't keep showing stale data */
  const { reset: resetDeviceStore } = useDeviceStore();

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
  const deviceTypes = storedDeviceTypes.filter(Boolean);
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
            resetDeviceStore();
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
            resetDeviceStore();
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
          resetDeviceStore();
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

    _activeBadge: <ActiveBadge value={item.is_active} />,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
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
        {canManage && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="gap-2 rounded-xl px-4 h-10 text-sm font-semibold"
            >
              <FileUp size={16} />
              {t('importExcel')}
            </Button>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setIsOpen(true);
              }}
              className="gap-2 rounded-xl px-5 h-10 text-sm dark:text-white font-semibold shadow-md"
              style={{ backgroundColor: '#3b82f6' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              <Plus size={16} />
              {t('addNew')}
            </Button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <StatCard
            label={t('total')}
            value={totalCount}
            icon={MonitorSpeaker}
            iconColor="#3b82f6"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.075, ease: 'easeOut' }}
        >
          <StatCard
            label={t('active')}
            value={activeCount}
            icon={Activity}
            iconColor="#10B981"
            color="text-[#10B981]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <StatCard
            label={t('statusOverdue')}
            value={overdueCount}
            icon={XCircle}
            iconColor="#ef4444"
            color="text-red-500"
          />
        </motion.div>
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
            {totalCount} {tc('count')}
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
            {canManage && (
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
            )}
          </div>
        ) : (
          <TableComponent
            column={[
              { key: 'expand', label: '', align: 'left' },
              { key: '_rowNumber', label: '№', align: 'left' },
              { key: '_nameSerial', label: `${t('colName')}`, align: 'left' },
              { key: '_typeName', label: t('colType'), align: 'left' },
              { key: '_facilityName', label: t('colFacility'), align: 'left' },

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
            expandedRowIds={expandedDeviceIds}
            onToggleExpand={(row) =>
              setExpandedDeviceIds((prev) => {
                const next = new Set(prev);
                if (next.has(row.id)) next.delete(row.id);
                else next.add(row.id);
                return next;
              })
            }
            renderExpanded={(row) => <DeviceTestLogsPanel deviceId={row.id} locale={locale} />}
            canManage={canManage}
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

      {/* Excel Import Modal */}
      <CustomModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title={t('importExcelTitle')}
        description={t('importExcelHint')}
        className="max-w-200! w-full"
      >
        <ExcelImporter onClose={() => setImportOpen(false)} />
      </CustomModal>
    </motion.div>
  );
};

export default DevicePage;
