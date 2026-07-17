'use client';

import CustomModal from '@/components/modals/CustomModal';
import PersonFormComponent, { EmployeeCombobox } from '@/components/forms/PersonFormComponent';
import TableComponent from '@/components/tableComponent';
import StatCard from '@/components/StatCard';
import FilterField from '@/components/users/FilterField';
import BadgeCell from '@/components/users/BadgeCell';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import toast from 'react-hot-toast';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { useSession } from 'next-auth/react';
import {
  Users,
  Plus,
  ShieldCheck,
  Loader2,
  UserCheck,
  AlertTriangle,
  ShieldBan,
  X,
} from 'lucide-react';
import PaginationComponent from '@/components/PaginationComponent';
import { useTranslations, useLocale } from 'next-intl';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const LIMIT = 15;

const ResponsiblePersonsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { employees, setEmployees } = useEmployeeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);

  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterFacilityId, setFilterFacilityId] = useState('');
  const [filterOrderNumber, setFilterOrderNumber] = useState('');
  const [filterUnitCode, setFilterUnitCode] = useState('');
  const [filterInspector, setFilterInspector] = useState('');
  const [filterMain, setFilterMain] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const t = useTranslations('persons');
  const tc = useTranslations('common');
  const locale = useLocale();

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const offset = (page - 1) * LIMIT;

  const debouncedOrderNumber = useDebounce(filterOrderNumber, 500);
  const debouncedUnitCode = useDebounce(filterUnitCode, 500);

  const hasFilters = !!(
    filterEmployeeId ||
    filterFacilityId ||
    filterOrderNumber ||
    filterUnitCode ||
    filterInspector ||
    filterMain ||
    filterActive
  );

  useEffect(() => {
    setPage(1);
  }, [
    filterEmployeeId,
    filterFacilityId,
    debouncedOrderNumber,
    debouncedUnitCode,
    filterInspector,
    filterMain,
    filterActive,
  ]);

  const clearFilters = () => {
    setFilterEmployeeId('');
    setFilterFacilityId('');
    setFilterOrderNumber('');
    setFilterUnitCode('');
    setFilterInspector('');
    setFilterMain('');
    setFilterActive('');
  };

  const { data: employeesData, isLoading: isEmployeesLoading } = useGetQuery({
    key: KEYS.employees,
    url: URLS.employee,
    params: { limit: 10000 },
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
  });

  useEffect(() => {
    const data = employeesData?.data?.data;
    if (data?.length) setEmployees(data);
  }, [employeesData]);

  const {
    isLoading: isPending,
    data: getPersonsData,
    isFetching,
    error: personsError,
  } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: {
      limit: LIMIT,
      offset,
      ...(filterEmployeeId ? { employee_id: filterEmployeeId } : {}),
      ...(filterFacilityId ? { facility_id: filterFacilityId } : {}),
      ...(debouncedOrderNumber.trim()
        ? { appointment_order_number: debouncedOrderNumber.trim() }
        : {}),
      ...(debouncedUnitCode.trim() ? { unit_code: debouncedUnitCode.trim() } : {}),
      ...(filterInspector ? { is_inspector: filterInspector === 'true' } : {}),
      ...(filterMain ? { is_main: filterMain === 'true' } : {}),
      ...(filterActive ? { is_active: filterActive === 'true' } : {}),
    },
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const persons = (getPersonsData?.data?.data ?? []).filter(Boolean);
  const totalCount = getPersonsData?.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);

  const { data: getFacilityData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const facilities = getFacilityData?.data?.data ?? [];

  /* ── edit by URL param (?edit=id) ────────────────────────── */
  const { data: editPersonData } = useGetQuery({
    key: ['person-edit', editId],
    url: `${URLS.person}/${editId}`,
    headers: authHeader,
    enabled: !!editId && !!session?.accessToken,
  });

  useEffect(() => {
    const person = editPersonData?.data;
    if (editId && person && !isOpen) {
      setSelectedItem(person);
      setIsOpen(true);
    }
  }, [editId, editPersonData?.data]);

  const { data: totalStatData } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: { limit: 1 },
    headers: authHeader,
    enabled: !!session?.accessToken,
  });
  const { data: inspectorStatData } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: { limit: 1, is_inspector: true },
    headers: authHeader,
    enabled: !!session?.accessToken,
  });
  const { data: activeStatData } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: { limit: 1, is_active: true },
    headers: authHeader,
    enabled: !!session?.accessToken,
  
  });

  const { mutate: createPerson, isPending: isCreating } = usePostQuery({
    listKeyId: KEYS.person,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: updatePerson, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.person,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: deletePerson, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.person,
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

  const openCreate = () => {
    setSelectedItem(null);
    setIsOpen(true);
  };

  function handleFormSubmit(formData) {
    const payload = { ...formData };
    if (!payload.facility_id) delete payload.facility_id;
    if (!payload.unit_code) delete payload.unit_code;

    if (selectedItem) {
      updatePerson(
        {
          url: `${URLS.person}/${selectedItem.id}`,
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
      createPerson(
        {
          url: URLS.person,
          attributes: payload,
          config: { headers: authHeader },
        },
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

  function handleUpdate(data) {
    setSelectedItem(data);
    setIsOpen(true);
  }
  function handleDelete(data) {
    setSelectedItem(data);
    setDeleteModal(true);
  }

  function confirmDelete() {
    if (!selectedItem?.id) return;
    deletePerson(
      {
        url: `${URLS.person}/${selectedItem.id}`,
        config: { headers: authHeader },
      },
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

  const total = totalStatData?.data?.count ?? 0;
  const inspectorCount = inspectorStatData?.data?.count ?? 0;
  const activeCount = activeStatData?.data?.count ?? 0;

  const getEmployeeName = (employeeId) => {
    const emp = employees?.find((e) => e.id === employeeId);
    if (!emp) return '—';
    return `${emp.last_name} ${emp.first_name}`;
  };

  const getFacilityName = (facilityId) => {
    if (!facilityId) return '—';
    const f = facilities?.find((f) => f.id === facilityId);
    return f?.name ?? '—';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const tableData = persons?.map((p, i) => ({
    ...p,
    _rowNumber: offset + i + 1,
    _employeeName: getEmployeeName(p.employee_id),
    _facilityName: getFacilityName(p.facility_id),
    _appointmentDate: formatDate(p.appointment_date),
    _endDate: formatDate(p.end_date),
    _inspectorBadge: <BadgeCell value={p.is_inspector} trueColor="#3b82f6" />,
    _mainBadge: <BadgeCell value={p.is_main} trueColor="#8b5cf6" />,
    _activeBadge: <BadgeCell value={p.is_active} trueColor="#10B981" />,
  }));

  if (personsError?.response?.status === 403) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 shadow-sm">
            <ShieldBan size={38} className="text-red-400 dark:text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#031634] dark:text-slate-100 mb-1">
              {t('forbiddenTitle')}
            </h2>
            <p className="text-[14px] text-[#7B8499] dark:text-slate-400 leading-relaxed">
              {t('forbiddenDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-[12px] font-mono text-red-600 dark:text-red-400">
            <span className="font-semibold">403</span>
            <span className="text-red-300 dark:text-red-700">·</span>
            <span>{t('forbiddenBadge')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100 leading-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        <Button
          onClick={openCreate}
          className="gap-2 rounded-xl px-5 h-10 text-sm dark:text-white font-semibold transition-all self-start sm:self-auto shadow-md"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          <Plus size={16} />
          {t('addNew')}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('total')}
          value={total}
          sub={t('totalSub')}
          icon={Users}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('inspectors')}
          value={inspectorCount}
          sub={t('inspectorsSub')}
          color="text-[#3b82f6]"
          icon={ShieldCheck}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('active')}
          value={activeCount}
          sub={t('activeSub')}
          color="text-emerald-500"
          icon={UserCheck}
          iconColor="#10B981"
        />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
          <div className="flex items-center gap-2 text-[#031634] dark:text-slate-100">
            {/* <UserCog size={18} /> */}
            <span className="font-semibold text-[15px]">{t('listTitle')}</span>
            {isFetching && (
              <Loader2 size={14} className="animate-spin ml-1" style={{ color: '#3b82f6' }} />
            )}
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

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 px-6 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/60">
          <FilterField label={t('colEmployee')}>
            <div className="sm:w-100">
              <EmployeeCombobox value={filterEmployeeId} onChange={setFilterEmployeeId} />
            </div>
          </FilterField>

          <FilterField label={t('colFacility')}>
            <Select
              value={filterFacilityId || 'all'}
              onValueChange={(v) => setFilterFacilityId(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-48 text-[14px]">
                <SelectValue placeholder={t('filterAll')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterAll')}</SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={t('colOrder')}>
            <input
              value={filterOrderNumber}
              onChange={(e) => setFilterOrderNumber(e.target.value)}
              placeholder={t('colOrder')}
              className="h-9 w-40 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[14px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </FilterField>

          <FilterField label={t('colUnit')}>
            <input
              value={filterUnitCode}
              onChange={(e) => setFilterUnitCode(e.target.value)}
              placeholder={t('colUnit')}
              className="h-9 w-32 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[14px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </FilterField>

          <FilterField label={t('colInspector')}>
            <Select
              value={filterInspector || 'all'}
              onValueChange={(v) => setFilterInspector(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-32 text-[14px]">
                <SelectValue placeholder={t('filterAll')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterAll')}</SelectItem>
                <SelectItem value="true">{t('filterYes')}</SelectItem>
                <SelectItem value="false">{t('filterNo')}</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={t('colMain')}>
            <Select
              value={filterMain || 'all'}
              onValueChange={(v) => setFilterMain(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-32 text-[14px]">
                <SelectValue placeholder={t('filterAll')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterAll')}</SelectItem>
                <SelectItem value="true">{t('filterYes')}</SelectItem>
                <SelectItem value="false">{t('filterNo')}</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={t('colActive')}>
            <Select
              value={filterActive || 'all'}
              onValueChange={(v) => setFilterActive(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-32 text-[14px]">
                <SelectValue placeholder={t('filterAll')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterAll')}</SelectItem>
                <SelectItem value="true">{t('filterYes')}</SelectItem>
                <SelectItem value="false">{t('filterNo')}</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 px-3 text-[12px] font-medium text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <X size={12} />
              {t('clearFilters')}
            </button>
          )}
        </div>

        {isPending || isEmployeesLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Loader2 size={22} className="animate-spin" style={{ color: '#3b82f6' }} />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Users size={40} className="text-slate-200 dark:text-slate-600" />
            <p className="text-sm">{t('empty')}</p>
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-[14px] font-medium text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
              >
                <X size={13} />
                {t('clearFilters')}
              </button>
            ) : (
              <Button
                onClick={openCreate}
                variant="outline"
                className="mt-1 gap-2 rounded-xl border hover:opacity-90"
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
              { key: '_rowNumber', label: '№', align: 'left' },
              { key: '_employeeName', label: t('colEmployee'), align: 'left' },
              { key: '_facilityName', label: t('colFacility'), align: 'left' },
              { key: 'appointment_order_number', label: t('colOrder'), align: 'left' },
              { key: '_appointmentDate', label: t('colAppointmentDate'), align: 'left' },
              { key: '_endDate', label: t('colEndDate'), align: 'left' },
              { key: '_inspectorBadge', label: t('colInspector'), align: 'center' },
              { key: '_mainBadge', label: t('colMain'), align: 'center' },
              { key: '_activeBadge', label: t('colActive'), align: 'center' },
              { key: 'action', label: t('colActions'), align: 'right' },
            ]}
            data={tableData}
            viewHref={(row) => `/dashboard/users/${row.id}`}
            onEdit={handleUpdate}
            handleDelete={handleDelete}
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
          if (editId) router.replace('/dashboard/users');
        }}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-180! w-full"
      >
        <PersonFormComponent
          facilities={facilities}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setIsOpen(false);
            if (editId) router.replace('/dashboard/users');
          }}
          initialData={selectedItem}
          isPending={isCreating || isUpdating}
        />
      </CustomModal>

      {/* Delete Confirm Modal */}
      <CustomModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title={t('deleteTitle')}
        className="max-w-md w-full"
      >
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-4 py-3">
            <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              <strong className="font-semibold">{selectedItem?.appointment_order_number}</strong>{' '}
              {t('deleteWarning')}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl gap-2"
              onClick={confirmDelete}
              disabled={isDeleting}
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

export default ResponsiblePersonsPage;
