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
import { MapPin, Plus, Loader2, Navigation2, Pencil, Trash2 } from 'lucide-react';

const LocationsMap = dynamic(() => import('@/components/LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-800 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-400 size-8" />
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
    if (apiFacilities.length > 0 && storeF.length === 0) {
      setFacilities(apiFacilities);
    }
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

  const handleLocationClick = (id) => {
    setActiveLocationId((prev) => (prev === id ? null : id));
  };

  // Mutations
  const { mutate: createMutate, isPending: createPending } = usePostQuery({
    listKeyId: KEYS.locations,
  });
  const { mutate: patchMutate, isPending: patchPending } = usePatchPythonQuery({
    listKeyId: KEYS.locations,
  });
  const { mutate: deleteMutate, isPending: deletePending } = useDeleteQuery({
    listKeyId: KEYS.locations,
  });

  const handleCreate = (data) => {
    createMutate(
      { url: URLS.locations, attributes: data, config: { headers: authHeader } },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  const handleEdit = (data) => {
    patchMutate(
      {
        url: `${URLS.locations}/${selectedLocation?.id}`,
        attributes: data,
        config: { headers: authHeader },
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleDelete = () => {
    deleteMutate(
      { url: `${URLS.locations}/${selectedLocation?.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setSelectedLocation(null);
        },
      }
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-96px)] overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
        {/* ── Left sidebar ── */}
        <div className="w-[50%] flex flex-col shrink-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <h1 className="text-[22px] font-bold leading-tight">Joylashuvlar ro&apos;yxati</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Barcha nazorat ostidagi industrial ob&apos;ektlar boshqaruvi
            </p>

            <div className="flex items-center gap-2 mt-4">
              <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
                <SelectTrigger className="flex-1 h-9 bg-white/10 border-white/15 text-sm hover:bg-white/15 transition-colors [&>span]:text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Barcha ob&apos;ektlar</SelectItem>
                  {uniqueFacilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="h-9 bg-[#FF8C00] hover:bg-[#e07800] text-white gap-1.5 shrink-0 font-semibold shadow-lg shadow-orange-500/20"
              >
                <Plus className="size-3.5" />
                Yangi joylashuv
              </Button>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1.4fr_auto_auto_auto] gap-x-2 px-5 py-2 border-b border-white/10 bg-white/5">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Manzil
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Ob&apos;ekt
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase w-14 text-center">
              Kenglik
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase w-14 text-center">
              Uzunlik
            </span>
            <span className="w-16" />
          </div>

          {/* Location list */}
          <div className="flex-1 overflow-y-auto">
            {locationsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin text-blue-400 size-6" />
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-500">
                <Navigation2 className="size-8 opacity-50" />
                <p className="text-sm">Joylashuvlar topilmadi</p>
              </div>
            ) : (
              filteredLocations.map((location) => {
                const facility = facilityMap[location.facility_id];
                const isActive = activeLocationId === location.id;

                return (
                  <div
                    key={location.id}
                    onClick={() => handleLocationClick(location.id)}
                    className={`cursor-pointer w-full text-left border-b border-white/5 transition-all duration-150 ${
                      isActive
                        ? 'bg-gray-200 border-l-2 border-l-orange-500'
                        : 'hover:bg-white/5 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="grid grid-cols-[1fr_1.4fr_auto_auto_auto] gap-x-2 px-4 py-3 items-center">
                      {/* Address */}
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin
                          className={`size-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`}
                        />
                        <span className="text-sm font-medium truncate">
                          {location.address_line}
                        </span>
                      </div>

                      {/* Facility badge */}
                      <div className="min-w-0">
                        {facility ? (
                          <Badge className="text-[12px] font-medium px-2 py-0.5 bg-blue-500/20 text-blue-600 border border-blue-400/25 rounded-full truncate max-w-full">
                            {facility.name}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </div>

                      {/* Lat */}
                      <span className="text-[12px] font-mono w-14 text-right tabular-nums">
                        {location.latitude.toFixed(4)}
                      </span>

                      {/* Lng */}
                      <span className="text-[12px] font-mono w-14 text-right tabular-nums">
                        {location.longitude.toFixed(4)}
                      </span>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-1 w-16 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedLocation(location);
                            setEditOpen(true);
                          }}
                          className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLocation(location);
                            setDeleteOpen(true);
                          }}
                          className="p-1.5 rounded bg-red-500/20 text-red-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/10">
            <p className="text-[11px] text-slate-500">
              Jami: <span className="font-semibold">{filteredLocations.length}</span> ta joylashuv
            </p>
          </div>
        </div>

        {/* ── Map panel ── */}
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
        title="Yangi joylashuv qo'shish"
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
        title="Joylashuvni tahrirlash"
        description="Ob'ekt ma'lumotlarini o'zgartirish"
        className="max-w-lg"
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

      {/* Delete confirmation modal */}
      <CustomModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Joylashuvni o'chirish"
        className="max-w-sm"
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">{selectedLocation?.address_line}</span>{' '}
            joylashuvini o&apos;chirmoqchimisiz? Bu amalni ortga qaytarib bo&apos;lmaydi.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              disabled={deletePending}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deletePending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" />
                  O&apos;chirilmoqda...
                </>
              ) : (
                "O'chirish"
              )}
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default LocationsPage;
