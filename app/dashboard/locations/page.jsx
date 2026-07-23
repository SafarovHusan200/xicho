'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePostQuery from '@/hooks/all/usePostQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import { useSession } from 'next-auth/react';
import useFacilityStore from '@/store/useFacilityStore';
import CustomModal from '@/components/modals/CustomModal';
import LocationFormComponent from '@/components/forms/LocationFormComponent';
import { MapPin, Plus, Loader2, Navigation2, Pencil, Trash2, Map } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasManageAccess } from '@/lib/permissions';

const LocationsMap = dynamic(() => import('@/components/LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 size-8" />
    </div>
  ),
});

const LocationsPage = () => {
  const { data: session } = useSession();
  const [selectedFacilityId, setSelectedFacilityId] = useState('all');
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const canManage = hasManageAccess(session);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: getLocationData, isLoading: locationsLoading } = useGetQuery({
    key: KEYS.locations,
    url: URLS.locations,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken,
  });

  const locations = getLocationData?.data?.data ?? [];
  const storeF = useFacilityStore((s) => s.facilities);
  const setFacilities = useFacilityStore((s) => s.setFacilities);

  const { data: getFacilityData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken && storeF.length === 0,
  });

  const apiFacilities = getFacilityData?.data?.data ?? [];

  useEffect(() => {
    if (apiFacilities.length > 0 && storeF.length === 0) setFacilities(apiFacilities);
  }, [apiFacilities]);

  const facilities = storeF.length > 0 ? storeF : apiFacilities;

  const facilityMap = useMemo(() => {
    const map = {};
    facilities.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [facilities]);

  const uniqueFacilities = useMemo(() => {
    const ids = [...new Set(locations.map((l) => l.facility_id))];
    return ids.map((id) => facilityMap[id]).filter(Boolean);
  }, [locations, facilityMap]);

  const filteredLocations = useMemo(() => {
    if (selectedFacilityId === 'all') return locations;
    return locations.filter((l) => l.facility_id === selectedFacilityId);
  }, [locations, selectedFacilityId]);

  const t = useTranslations('locations');
  const tc = useTranslations('common');
  const handleLocationClick = (id) => setActiveLocationId((prev) => (prev === id ? null : id));

  const { mutate: createMutate, isPending: createPending } = usePostQuery({
    listKeyId: KEYS.locations,
  });
  const { mutate: patchMutate, isPending: patchPending } = usePatchPythonQuery({
    listKeyId: KEYS.locations,
  });
  const { mutate: deleteMutate, isPending: deletePending } = useDeleteQuery({
    listKeyId: KEYS.locations,
  });

  const handleCreate = (data) =>
    createMutate(
      { url: URLS.locations, attributes: data, config: { headers: authHeader } },
      { onSuccess: () => setCreateOpen(false) }
    );

  const handleEdit = (data) =>
    patchMutate(
      {
        url: `${URLS.locations}/${selectedLocation?.id}`,
        attributes: data,
        config: { headers: authHeader },
      },
      { onSuccess: () => setEditOpen(false) }
    );

  const handleDelete = () =>
    deleteMutate(
      { url: `${URLS.locations}/${selectedLocation?.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setSelectedLocation(null);
        },
      }
    );

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <Map size={22} className="text-white" />
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
            onClick={() => setCreateOpen(true)}
            className="gap-2 rounded-xl px-5 h-10 text-sm font-semibold transition-all self-start sm:self-auto shadow-md text-white"
            style={{ backgroundColor: '#3b82f6' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            <Plus size={16} />
            {t('addNew')}
          </Button>
        )}
      </div>

      {/* Main card */}
      <div className="flex h-[calc(100vh-170px)] overflow-hidden rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm">
        {/* Left panel */}
        <div className="w-[50%] flex flex-col shrink-0 overflow-hidden border-r border-[#F0F1F5] dark:border-slate-700/40">
          {/* Panel header */}
          <div className="px-5 pt-4 pb-3 border-b border-[#F0F1F5] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-[#031634] dark:text-slate-100">
                {t('listTitle')}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-[14px] font-semibold border"
                style={{
                  backgroundColor: 'var(--badge-blue-bg)',
                  color: 'var(--badge-blue-text)',
                  borderColor: 'var(--badge-blue-border)',
                }}
              >
                {filteredLocations.length} {t('total')}
              </span>
            </div>

            <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger className="h-9 text-sm border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filterAll')}</SelectItem>
                {uniqueFacilities.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1.2fr_auto_auto_auto] gap-x-2 px-5 py-2.5 border-b border-[#F0F1F5] dark:border-slate-700/40 bg-[#F8F9FB] dark:bg-slate-800/60">
            {[t('colAddress'), t('colFacility'), t('colLat'), t('colLng'), ''].map((label, i) => (
              <span
                key={i}
                className={`text-[12px] font-semibold tracking-widest text-[#7B8499] dark:text-slate-500 uppercase ${i >= 2 ? 'text-right' : ''} ${i === 4 ? 'w-16' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0F1F5] dark:divide-slate-700/30">
            {locationsLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-[#7B8499] dark:text-slate-400">
                <Loader2 className="animate-spin size-5" style={{ color: '#3b82f6' }} />
                <span className="text-sm">{t('loading')}</span>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#7B8499] dark:text-slate-400">
                <Navigation2 className="size-8 text-slate-200 dark:text-slate-700" />
                <p className="text-sm">{t('empty')}</p>
              </div>
            ) : (
              filteredLocations.map((location) => {
                const facility = facilityMap[location.facility_id];
                const isActive = activeLocationId === location.id;

                return (
                  <div
                    key={location.id}
                    onClick={() => handleLocationClick(location.id)}
                    className={`cursor-pointer grid grid-cols-[1fr_1.2fr_auto_auto_auto] gap-x-2 px-5 py-3 items-center transition-all duration-150 border-l-2 ${
                      isActive
                        ? 'bg-[#EFF6FF] dark:bg-blue-950/40 border-l-[#3b82f6]'
                        : 'hover:bg-[#F8FAFF] dark:hover:bg-slate-700/20 border-l-transparent'
                    }`}
                  >
                    {/* Address */}
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin
                        size={14}
                        className={`shrink-0 ${isActive ? 'text-[#3b82f6]' : 'text-[#94A3B8]'}`}
                      />
                      <span
                        className={`text-[14px] font-medium truncate ${isActive ? 'text-[#1D4ED8] dark:text-blue-300' : 'text-[#3C4043] dark:text-slate-300'}`}
                      >
                        {location.address_line}
                      </span>
                    </div>

                    {/* Facility badge */}
                    <div className="min-w-0">
                      {facility ? (
                        <Badge className="text-[12px] font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded-full truncate max-w-full">
                          {facility.name}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] dark:text-slate-600">—</span>
                      )}
                    </div>

                    {/* Lat */}
                    <span className="text-[14px] font-mono w-14 text-right tabular-nums text-[#64748B] dark:text-slate-500">
                      {location.latitude.toFixed(4)}
                    </span>

                    {/* Lng */}
                    <span className="text-[14px] font-mono w-14 text-right tabular-nums text-[#64748B] dark:text-slate-500">
                      {location.longitude.toFixed(4)}
                    </span>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-1 w-16 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canManage && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedLocation(location);
                              setEditOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 dark:border-orange-800/70 bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400  hover:bg-orange-100 dark:hover:bg-orange-900/60 hover:text-orange-600 dark:hover:text-orange-300 transition-all duration-150"
                            title={tc('edit')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLocation(location);
                              setDeleteOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 dark:border-red-800/70 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400  hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-600 dark:hover:text-red-300 transition-all duration-150"
                            title={tc('delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map panel */}
        <LocationsMap
          locations={filteredLocations}
          facilityMap={facilityMap}
          activeLocationId={activeLocationId}
          onMarkerClick={handleLocationClick}
        />
      </div>

      {/* Create modal */}
      <CustomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('createTitle')}
        className="max-w-200! w-full"
      >
        <LocationFormComponent
          key="create"
          facilities={facilities}
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
          isPending={createPending}
        />
      </CustomModal>

      {/* Edit modal */}
      <CustomModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('editTitle')}
        description={t('editDescription')}
        className="max-w-200! w-full"
      >
        <LocationFormComponent
          key={selectedLocation?.id}
          facilities={facilities}
          onSubmit={handleEdit}
          onClose={() => setEditOpen(false)}
          initialData={selectedLocation}
          isPending={patchPending}
          isEdit
        />
      </CustomModal>

      {/* Delete modal */}
      <CustomModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('deleteTitle')}
        className="max-w-md w-full"
      >
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-4 py-3">
            <Trash2 size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              <strong className="font-semibold">{selectedLocation?.address_line}</strong>{' '}
              {t('deleteWarning')}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl gap-2"
              disabled={deletePending}
              onClick={handleDelete}
            >
              {deletePending && <Loader2 size={14} className="animate-spin" />}
              {deletePending ? t('deleting') : t('confirmDelete')}
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default LocationsPage;
