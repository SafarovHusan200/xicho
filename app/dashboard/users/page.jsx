'use client';

import CustomModal from '@/components/modals/CustomModal';
import PersonFormComponent from '@/components/forms/PersonFormComponent';
import TableComponent from '@/components/tableComponent';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import toast from 'react-hot-toast';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { useSession } from 'next-auth/react';
import { Users, Plus, ShieldCheck, Loader2, UserCheck, UserCog, AlertTriangle } from 'lucide-react';
import PaginationComponent from '@/components/PaginationComponent';
import { useTranslations } from 'next-intl';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import CountUp from 'react-countup';

const StatCard = ({ label, value, sub, color, icon: Icon, iconColor }) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-3 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-md font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
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
      <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />
    </span>
    {/* {sub && <span className="text-xs text-[#7B8499] dark:text-slate-500">{sub}</span>} */}
  </div>
);

const BadgeCell = ({ value, trueColor = '#10B981', falseColor = '#94a3b8' }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
    style={
      value
        ? { backgroundColor: `${trueColor}18`, color: trueColor, borderColor: `${trueColor}30` }
        : { backgroundColor: `${falseColor}12`, color: falseColor, borderColor: `${falseColor}25` }
    }
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: value ? trueColor : falseColor }}
    />
    {value ? 'Ha' : "Yo'q"}
  </span>
);

const LIMIT = 15;

const ResponsiblePersonsPage = () => {
  const { data: session } = useSession();
  const { employees, setEmployees } = useEmployeeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);

  const t = useTranslations('persons');

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const offset = (page - 1) * LIMIT;

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
  } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: { limit: LIMIT, offset },
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const { data: getFacilityData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const persons = getPersonsData?.data?.data ?? [];
  const totalCount = getPersonsData?.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);
  const facilities = getFacilityData?.data?.data ?? [];

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

  const total = totalCount;
  const inspectorCount = persons?.filter((p) => p.is_inspector).length ?? 0;
  const activeCount = persons?.filter((p) => p.is_active).length ?? 0;

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
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
            {total} ta
          </span>
        </div>

        {isPending || isEmployeesLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Loader2 size={22} className="animate-spin" style={{ color: '#3b82f6' }} />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Users size={40} className="text-slate-200 dark:text-slate-600" />
            <p className="text-sm">{t('empty')}</p>
            <Button
              onClick={openCreate}
              variant="outline"
              className="mt-1 gap-2 rounded-xl border hover:opacity-90"
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
        onClose={() => setIsOpen(false)}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-180! w-full"
      >
        <PersonFormComponent
          facilities={facilities}
          onSubmit={handleFormSubmit}
          onClose={() => setIsOpen(false)}
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
