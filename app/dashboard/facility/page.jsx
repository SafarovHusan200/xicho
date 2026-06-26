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

const HazardousFacilities = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const setFacilities = useFacilityStore((s) => s.setFacilities);

  const {
    isLoading: isPending,
    isError,
    data: getFacilityData,
    error,
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
    if (facilities) {
      setFacilities(facilities);
    }
  }, [facilities]);

  // POST
  const { mutate: createFacility, isPending: isCreating } = usePostQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  // PATCH
  const { mutate: updateFacility, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  // DELETE
  const { mutate: deleteFacility, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
    hideErrorToast: true,
  });

  function openCreate() {
    setSelectedItem(null);
    setIsOpen(true);
  }

  const apiError = (error, fallback) => toast.error(error?.response?.data?.detail || fallback);

  function handleFormSubmit(formData) {
    if (selectedItem) {
      const payload = { ...formData };
      if (payload.unit_code === selectedItem.unit_code) {
        delete payload.unit_code;
      }
      updateFacility(
        {
          url: `${URLS.facilities}/${selectedItem?.id}`,
          attributes: payload,
          config: { headers: { Authorization: `Bearer ${session?.accessToken}` } },
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success('Muvaffaqiyatli tahrirlandi');
          },
          onError: (error) => apiError(error, 'Tahrirlashda xato yuz berdi'),
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
            toast.success("Muvaffaqiyatli qo'shildi");
          },
          onError: (error) => apiError(error, "Qo'shishda xato yuz berdi"),
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
          toast.success("Muvaffaqiyatli o'chirildi");
        },
        onError: (error) => apiError(error, "O'chirishda xato yuz berdi"),
      }
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center mb-5">
        <div>
          <h3 className="text-2xl font-medium">Xavfli ishlab chiqarish ob'ektlari</h3>
          <p>Monitoring va xavfsizlik nazorati tizimi</p>
        </div>
        <div>
          <Button onClick={openCreate} className={'bg-blue-600'}>
            + Yangi ob'ekt qo'shish
          </Button>
        </div>
      </div>

      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedItem ? "Ob'ektni tahrirlash" : "Yangi ob'ekt qo'shish"}
        className="max-w-lg w-full"
      >
        <FacilityFormComponent
          facilities={facilities?.filter((f) => f.is_facilities)}
          onSubmit={handleFormSubmit}
          onClose={() => setIsOpen(false)}
          initialData={selectedItem}
          isPending={isCreating || isUpdating}
        />
      </CustomModal>

      <CustomModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Rostdan ham o'chirmoqchimisiz"
        className="max-w-lg w-full"
      >
        <p className="text-sm text-muted-foreground mb-4">
          <strong>{selectedItem?.name}</strong> ob'ekti o'chiriladi. Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDeleteModal(false)}>
            Bekor qilish
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </CustomModal>

      {!isPending && (
        <TableComponent
          column={[
            { key: 'name', label: 'Nomi', align: 'left' },
            { key: 'unit_code', label: 'Code', align: 'left' },
            { key: 'is_facilities', label: 'Obyektmi', align: 'left' },
            { key: 'created_at', label: 'Sana', align: 'left' },
            { key: 'action', label: 'Amallar', align: 'right' },
          ]}
          data={facilities}
          onEdit={handleUpdate}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default HazardousFacilities;
