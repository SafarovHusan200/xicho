'use client';

import CustomModal from '@/components/modals/CustomModal';
import FacilityFormComponent from '@/components/forms/FacilityFormComponent';
import TableComponent from '@/components/tableComponent';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import toast from 'react-hot-toast';
import useFacilityStore from '@/store/useFacilityStore';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { useSession } from 'next-auth/react';
import { Building2, Plus, ShieldAlert, Loader2, LayoutGrid } from 'lucide-react';
import CountUp from 'react-countup';
import { useTranslations, useLocale } from 'next-intl';
import { getUnitCodeName } from '@/constants/unit_codes';

const StatCard = ({ label, value, color, icon: Icon, iconColor }) => (
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
      <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />
    </span>
  </div>
);

const HazardousFacilities = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const setFacilities = useFacilityStore((s) => s.setFacilities);

  const {
    isLoading: isPending,
    data: getFacilityData,
    isFetching,
  } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: 'application/json',
    },
    enabled: !!session?.accessToken,
  });

  const facilities = getFacilityData?.data?.data;

  useEffect(() => {
    if (facilities) setFacilities(facilities);
  }, [facilities]);

  const { mutate: createFacility, isPending: isCreating } = usePostQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: updateFacility, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: deleteFacility, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const t = useTranslations('facility');
  const locale = useLocale();
  const openCreate = () => {
    setSelectedItem(null);
    setIsOpen(true);
  };
  const apiError = (err, fallback) => toast.error(err?.response?.data?.detail || fallback);

  function handleFormSubmit(formData) {
    if (selectedItem) {
      const payload = { ...formData };
      if (payload.unit_code === selectedItem.unit_code) delete payload.unit_code;
      updateFacility(
        {
          url: `${URLS.facilities}/${selectedItem?.id}`,
          attributes: payload,
          config: { headers: { Authorization: `Bearer ${session?.accessToken}` } },
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
      createFacility(
        {
          url: URLS.facilities,
          attributes: formData,
          config: { headers: { Authorization: `Bearer ${session?.accessToken}` } },
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
    deleteFacility(
      {
        url: `${URLS.facilities}/${selectedItem?.id}`,
        config: { headers: { Authorization: `Bearer ${session?.accessToken}` } },
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

  const total = facilities?.length ?? 0;
  const mainCount = facilities?.filter((f) => f.is_facilities).length ?? 0;
  const subCount = total - mainCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <ShieldAlert size={22} className="text-white" />
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
        <StatCard label={t('total')} value={total} icon={Building2} iconColor="#7B8499" />
        <StatCard label={t('main')} value={mainCount} color="text-[#3b82f6]" icon={ShieldAlert} iconColor="#3b82f6" />
        <StatCard label={t('sub')} value={subCount} color="text-amber-500" icon={LayoutGrid} iconColor="#f59e0b" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
          <div className="flex items-center gap-2 text-[#031634] dark:text-slate-100">
            <Building2 size={18} />
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

        {isPending ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Loader2 size={22} className="animate-spin" style={{ color: '#3b82f6' }} />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Building2 size={40} className="text-slate-200 dark:text-slate-600" />
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
              { key: 'name', label: t('colName'), align: 'left' },
              { key: '_stationName', label: t('colCode'), align: 'left' },
              { key: 'is_facilities', label: t('colIsObj'), align: 'left' },
              { key: 'created_at', label: t('colDate'), align: 'left' },
              { key: 'action', label: t('colActions'), align: 'right' },
            ]}
            data={facilities?.map((f) => ({
              ...f,
              _stationName: getUnitCodeName(f.unit_code, locale),
            }))}
            onEdit={handleUpdate}
            handleDelete={handleDelete}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-180! w-full"
      >
        <FacilityFormComponent
          facilities={facilities?.filter((f) => f.is_facilities)}
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
            <ShieldAlert size={20} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              <strong className="font-semibold">{selectedItem?.name}</strong> {t('deleteWarning')}
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

export default HazardousFacilities;
