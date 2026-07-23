'use client';

import CustomModal from '@/components/modals/CustomModal';
import FacilityFormComponent from '@/components/forms/FacilityFormComponent';
import StatCard from '@/components/StatCard';
import FacilityRow from '@/components/facility/FacilityRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import toast from 'react-hot-toast';
import useFacilityStore from '@/store/useFacilityStore';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { useSession } from 'next-auth/react';
import { Building2, Plus, Factory, Loader2, LayoutGrid, Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { hasManageAccess } from '@/lib/permissions';

const HazardousFacilities = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [parentForNew, setParentForNew] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { facilities, setFacilities } = useFacilityStore();
  const canManage = hasManageAccess(session);

  console.log(session);

  useEffect(() => {
    if (!editId || isOpen || !facilities.length) return;
    const target = facilities.find((f) => f.id === editId);
    if (target) {
      setSelectedItem(target);
      setParentForNew(null);
      setIsOpen(true);
    }
  }, [editId, facilities, isOpen]);
  const {
    isLoading: isPending,
    data: getFacilityData,
    isFetching,
  } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    params: { limit: 1000 },
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: 'application/json',
    },
    enabled: !!session?.accessToken && facilities.length === 0,
  });

  const facilitiesData = getFacilityData?.data?.data;

  useEffect(() => {
    if (facilitiesData) setFacilities(facilitiesData);
  }, [facilitiesData]);

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
  const tc = useTranslations('common');
  const locale = useLocale();
  const openCreate = () => {
    setSelectedItem(null);
    setParentForNew(null);
    setIsOpen(true);
  };
  const handleAddChild = (facility) => {
    setSelectedItem(null);
    setParentForNew(facility);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
    setParentForNew(null);
    if (editId) router.replace('/dashboard/facility');
  };
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
            closeModal();
            setFacilities([]);
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
            closeModal();
            setFacilities([]);
            toast.success(t('successCreated'));
          },
          onError: (err) => apiError(err, t('errorCreate')),
        }
      );
    }
  }

  function handleUpdate(data) {
    setSelectedItem(data);
    setParentForNew(null);
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
          setFacilities([]);
          toast.success(t('successDeleted'));
        },
        onError: (err) => apiError(err, t('errorDelete')),
      }
    );
  }

  const total = facilities?.length ?? 0;
  const mainCount = facilities?.filter((f) => f.is_facilities).length ?? 0;
  const subCount = total - mainCount;

  const rootFacilities = useMemo(() => facilities?.filter((f) => !f.parent_id) ?? [], [facilities]);
  const childrenByParent = useMemo(() => {
    const map = {};
    facilities?.forEach((f) => {
      if (!f.parent_id) return;
      if (!map[f.parent_id]) map[f.parent_id] = [];
      map[f.parent_id].push(f);
    });
    return map;
  }, [facilities]);

  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilter = !!normalizedSearch || filterType !== 'all';

  const matchesFilters = useCallback(
    (f) => {
      const matchesSearch =
        !normalizedSearch ||
        f.name?.toLowerCase().includes(normalizedSearch) ||
        f.unit_code?.toLowerCase().includes(normalizedSearch);
      const matchesType =
        filterType === 'all' || (filterType === 'main' ? f.is_facilities : !f.is_facilities);
      return matchesSearch && matchesType;
    },
    [normalizedSearch, filterType]
  );

  // Matched nodes plus their parents (so a matching sub-division still shows under its facility).
  const visibleIds = useMemo(() => {
    if (!hasActiveFilter) return null;
    const ids = new Set();
    facilities?.forEach((f) => {
      if (matchesFilters(f)) {
        ids.add(f.id);
        if (f.parent_id) ids.add(f.parent_id);
      }
    });
    return ids;
  }, [facilities, hasActiveFilter, matchesFilters]);

  const visibleRootFacilities = useMemo(
    () => (visibleIds ? rootFacilities.filter((f) => visibleIds.has(f.id)) : rootFacilities),
    [rootFacilities, visibleIds]
  );

  const visibleChildrenByParent = useMemo(() => {
    if (!visibleIds) return childrenByParent;
    const map = {};
    Object.entries(childrenByParent).forEach(([parentId, children]) => {
      map[parentId] = children.filter((c) => visibleIds.has(c.id));
    });
    return map;
  }, [childrenByParent, visibleIds]);

  // Auto-expand facilities whose sub-divisions matched the active search/filter.
  const effectiveExpanded = useMemo(() => {
    if (!hasActiveFilter) return expanded;
    const next = new Set(expanded);
    visibleRootFacilities.forEach((f) => {
      if ((visibleChildrenByParent[f.id] ?? []).length > 0) next.add(f.id);
    });
    return next;
  }, [hasActiveFilter, expanded, visibleRootFacilities, visibleChildrenByParent]);

  const matchCount = useMemo(() => {
    if (!hasActiveFilter) return total;
    return facilities?.filter(matchesFilters).length ?? 0;
  }, [facilities, hasActiveFilter, matchesFilters, total]);

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
  };

  const formInitialData = useMemo(() => {
    if (selectedItem) return selectedItem;
    if (!parentForNew) return null;
    const siblingCount = (childrenByParent[parentForNew.id] ?? []).length;
    const suffix = String(siblingCount + 1).padStart(2, '0');
    return {
      is_facilities: false,
      parent_id: parentForNew.id,
      unit_code: `${parentForNew.unit_code}-${suffix}`,
    };
  }, [selectedItem, parentForNew, childrenByParent]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <Factory size={22} className="text-white" />
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
            onClick={openCreate}
            className="gap-2 rounded-xl px-5 h-10 text-sm dark:text-white font-semibold transition-all self-start sm:self-auto shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            <Plus size={16} />
            {t('addNew')}
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t('total')} value={total} icon={Building2} iconColor="#7B8499" />
        <StatCard
          label={t('main')}
          value={mainCount}
          color="text-[#3b82f6]"
          icon={Factory}
          iconColor="#3b82f6"
        />
        <StatCard
          label={t('sub')}
          value={subCount}
          color="text-amber-500"
          icon={LayoutGrid}
          iconColor="#f59e0b"
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 text-[14px]"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="sm:w-52 text-[14px]">
            <SelectValue placeholder={t('filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            <SelectItem value="main">{t('filterMain')}</SelectItem>
            <SelectItem value="sub">{t('filterSub')}</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilter && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="gap-2 rounded-md text-[14px]"
          >
            <X size={14} />
            {t('clearFilters')}
          </Button>
        )}
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
            {matchCount} {tc('count')}
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
            {canManage && (
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
        ) : visibleRootFacilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7B8499] dark:text-slate-400">
            <Search size={40} className="text-slate-200 dark:text-slate-600" />
            <p className="text-sm">{t('noResults')}</p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="mt-1 gap-2 rounded-xl border hover:opacity-90"
              style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
            >
              <X size={14} />
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {visibleRootFacilities.map((f) => (
              <FacilityRow
                key={f.id}
                facility={f}
                children={visibleChildrenByParent[f.id] ?? []}
                expanded={effectiveExpanded.has(f.id)}
                onToggle={toggleExpand}
                onEdit={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                canManage={canManage}
                locale={locale}
                t={t}
                tc={tc}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <CustomModal
        open={isOpen}
        onClose={closeModal}
        title={selectedItem ? t('editTitle') : t('createTitle')}
        className="max-w-180! w-full"
      >
        <FacilityFormComponent
          facilities={facilities?.filter((f) => f.is_facilities)}
          allFacilities={facilities}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          initialData={formInitialData}
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
            <Factory size={20} className="text-red-500 mt-0.5 shrink-0" />
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
