'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Cpu, Plus, Loader2, AlertTriangle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import TableComponent from '@/components/tableComponent';
import CustomModal from '@/components/modals/CustomModal';
import PaginationComponent from '@/components/PaginationComponent';
import useDeviceTypeStore from '@/store/useDeviceTypeStore';
import { hasManageAccess } from '@/lib/permissions';

const LIMIT = 15;

/* ── Form ──────────────────────────────────────────────────── */
function DeviceTypeForm({ initialData, onSubmit, onClose, isPending, t }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: t('nameError') });
      return;
    }
    const payload = { name: form.name.trim() };
    if (form.description.trim()) payload.description = form.description.trim();
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('nameLabel')}</Label>
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('namePlaceholder')}
          className="text-[14px]"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('descLabel')}</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('descPlaceholder')}
          rows={3}
          className="text-[14px] resize-none"
        />
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

/* ── Page ──────────────────────────────────────────────────── */
const DeviceTypePage = () => {
  const { data: session } = useSession();
  const t = useTranslations('deviceTypes');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const canManage = hasManageAccess(session);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const offset = (page - 1) * LIMIT;

  const {
    isLoading: isPending,
    data: listData,
    isFetching,
  } = useGetQuery({
    key: KEYS.deviceTypes,
    url: URLS.deviceTypes,
    params: { limit: LIMIT, offset },
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const { mutate: createType, isPending: isCreating } = usePostQuery({
    listKeyId: KEYS.deviceTypes,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: updateType, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.deviceTypes,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  const { mutate: deleteType, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.deviceTypes,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  /* device types are cached in a shared store by other pages — reset it
     after any create/update/delete so they don't keep showing stale data */
  const { reset: resetDeviceTypeStore } = useDeviceTypeStore();

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

  function handleFormSubmit(payload) {
    if (selectedItem) {
      updateType(
        {
          url: `${URLS.deviceTypes}/${selectedItem.id}`,
          attributes: payload,
          config: { headers: authHeader },
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success(t('successUpdated'));
            resetDeviceTypeStore();
          },
          onError: (err) => apiError(err, t('errorUpdate')),
        }
      );
    } else {
      createType(
        { url: URLS.deviceTypes, attributes: payload, config: { headers: authHeader } },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success(t('successCreated'));
            resetDeviceTypeStore();
          },
          onError: (err) => apiError(err, t('errorCreate')),
        }
      );
    }
  }

  function confirmDelete() {
    if (!selectedItem?.id) return;
    deleteType(
      { url: `${URLS.deviceTypes}/${selectedItem.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          setDeleteModal(false);
          setSelectedItem(null);
          toast.success(t('successDeleted'));
          resetDeviceTypeStore();
        },
        onError: (err) => apiError(err, t('errorDelete')),
      }
    );
  }

  const tableData = items.map((item, i) => ({
    ...item,
    _rowNumber: offset + i + 1,
    _description: item.description || '—',
    _date: item.created_at
      ? new Date(item.created_at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—',
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100 leading-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setSelectedItem(null);
              setIsOpen(true);
            }}
            className="gap-2 rounded-xl px-5 h-10 text-sm dark:text-white font-semibold transition-all self-start sm:self-auto shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            <Plus size={16} />
            {t('addNew')}
          </Button>
        )}
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col gap-3 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
              {t('total')}
            </span>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#3b82f618' }}
            >
              <Cpu size={20} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <span className="text-3xl font-bold text-[#031634] dark:text-slate-100">
            <CountUp start={0} end={totalCount} duration={1.4} />
          </span>
        </motion.div>
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
          <div className="flex items-center gap-2 text-[#031634] dark:text-slate-100">
            <Cpu size={18} />
            <span className="font-semibold text-[15px]">{t('listTitle')}</span>
            {isFetching && <Loader2 size={14} className="animate-spin ml-1 text-[#3b82f6]" />}
          </div>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold border"
            style={{ backgroundColor: '#3b82f618', color: '#3b82f6', borderColor: '#3b82f630' }}
          >
            {totalCount} {tc('count')}
          </span>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Loader2 size={22} className="animate-spin text-[#3b82f6]" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Cpu size={40} className="text-slate-200 dark:text-slate-600" />
            <p className="text-sm">{t('empty')}</p>
            {canManage && (
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setIsOpen(true);
                }}
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
              { key: 'name', label: t('colName'), align: 'left' },
              { key: '_description', label: t('colDesc'), align: 'left' },
              { key: '_date', label: t('colDate'), align: 'left' },
              { key: 'action', label: t('colActions'), align: 'right' },
            ]}
            data={tableData}
            onEdit={(row) => {
              setSelectedItem(row);
              setIsOpen(true);
            }}
            handleDelete={(row) => {
              setSelectedItem(row);
              setDeleteModal(true);
            }}
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
      </motion.div>

      {/* Create / Edit Modal */}
      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-120! w-full"
      >
        <DeviceTypeForm
          initialData={selectedItem}
          onSubmit={handleFormSubmit}
          onClose={() => setIsOpen(false)}
          isPending={isCreating || isUpdating}
          t={t}
        />
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
    </motion.div>
  );
};

export default DeviceTypePage;
