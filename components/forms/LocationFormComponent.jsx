'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function LocationFormComponent({
  facilities = [],
  onSubmit,
  onClose,
  initialData,
  isPending,
  isEdit = false,
}) {
  const [values, setValues] = useState({
    facility_id: '',
    address_line: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setValues({
        facility_id: initialData.facility_id ?? '',
        address_line: initialData.address_line ?? '',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
      });
    } else {
      setValues({ facility_id: '', address_line: '', latitude: '', longitude: '' });
    }
    setErrors({});
  }, [initialData]);

  const set = (key) => (val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!values.facility_id) e.facility_id = "Ob'ekt tanlanishi shart";
    if (!values.address_line || values.address_line.length < 2)
      e.address_line = 'Manzil kiritilishi shart';
    if (values.latitude === '' || isNaN(Number(values.latitude)))
      e.latitude = 'Kenglik kiritilishi shart';
    if (values.longitude === '' || isNaN(Number(values.longitude)))
      e.longitude = 'Uzunlik kiritilishi shart';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      facility_id: values.facility_id,
      address_line: values.address_line,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    });
  };

  const t = useTranslations('locationForm');
  const initialCoords =
    initialData?.latitude != null && initialData?.longitude != null
      ? { lat: Number(initialData.latitude), lng: Number(initialData.longitude) }
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-[15px]">{t('facilityLabel')} <span className="text-red-500">*</span></Label>
        <Select value={values.facility_id} onValueChange={set('facility_id')}>
          <SelectTrigger className="w-full text-[15px]">
            <SelectValue placeholder={t('facilityPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.facility_id && <p className="text-sm text-destructive">{t('facilityError')}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[15px]">{t('addressLabel')} <span className="text-red-500">*</span></Label>
        <Input
          placeholder={t('addressPlaceholder')}
          value={values.address_line}
          onChange={(e) => set('address_line')(e.target.value)}
          aria-invalid={!!errors.address_line}
          className="text-[15px]"
        />
        {errors.address_line && <p className="text-sm text-destructive">{t('addressError')}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px]">{t('latLabel')} <span className="text-red-500">*</span></Label>
          <Input
            type="number" step="any" placeholder="41.2995"
            value={values.latitude}
            onChange={(e) => set('latitude')(e.target.value)}
            aria-invalid={!!errors.latitude}
            className="text-[15px]"
          />
          {errors.latitude && <p className="text-sm text-destructive">{t('latError')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px]">{t('lngLabel')} <span className="text-red-500">*</span></Label>
          <Input
            type="number" step="any" placeholder="69.2401"
            value={values.longitude}
            onChange={(e) => set('longitude')(e.target.value)}
            aria-invalid={!!errors.longitude}
            className="text-[15px]"
          />
          {errors.longitude && <p className="text-sm text-destructive">{t('lngError')}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} style={{ color: '#3b82f6' }} />
          <Label className="text-[15px]">{isEdit ? t('mapEditLabel') : t('mapLabel')}</Label>
        </div>
        <MapPicker
          initialCoords={initialCoords}
          onChange={({ latitude, longitude }) => {
            setValues((prev) => ({ ...prev, latitude, longitude }));
            setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="rounded-[8px]" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="submit" disabled={isPending}
          className="rounded-[8px] gap-2 text-white font-semibold"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? t('saving') : isEdit ? t('saveChanges') : t('save')}
        </Button>
      </div>
    </form>
  );
}
