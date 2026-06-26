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
    if (!values.address_line || values.address_line.length < 2) e.address_line = 'Manzil kiritilishi shart';
    if (values.latitude === '' || isNaN(Number(values.latitude))) e.latitude = 'Kenglik kiritilishi shart';
    if (values.longitude === '' || isNaN(Number(values.longitude))) e.longitude = 'Uzunlik kiritilishi shart';
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

  const initialCoords =
    initialData?.latitude != null && initialData?.longitude != null
      ? { lat: Number(initialData.latitude), lng: Number(initialData.longitude) }
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Ob'ekt */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
          Ob&apos;ekt <span className="text-red-500">*</span>
        </Label>
        <Select value={values.facility_id} onValueChange={set('facility_id')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ob'ektni tanlang" />
          </SelectTrigger>
          <SelectContent modal={false}>
            {facilities.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.facility_id && (
          <p className="text-sm text-destructive">{errors.facility_id}</p>
        )}
      </div>

      {/* Manzil */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
          Manzil <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Masalan: Toshkent, Chilonzor tumani"
          value={values.address_line}
          onChange={(e) => set('address_line')(e.target.value)}
          aria-invalid={!!errors.address_line}
        />
        {errors.address_line && (
          <p className="text-sm text-destructive">{errors.address_line}</p>
        )}
      </div>

      {/* Kenglik / Uzunlik */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            Kenglik (Latitude) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="any"
            placeholder="41.2995"
            value={values.latitude}
            onChange={(e) => set('latitude')(e.target.value)}
            aria-invalid={!!errors.latitude}
          />
          {errors.latitude && (
            <p className="text-sm text-destructive">{errors.latitude}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            Uzunlik (Longitude) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="any"
            placeholder="69.2401"
            value={values.longitude}
            onChange={(e) => set('longitude')(e.target.value)}
            aria-invalid={!!errors.longitude}
          />
          {errors.longitude && (
            <p className="text-sm text-destructive">{errors.longitude}</p>
          )}
        </div>
      </div>

      {/* Xarita */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
          <MapPin className="size-3.5 text-orange-400" />
          {isEdit ? "Xarita ko'rinishi" : 'Aniq koordinatalarni xaritadan aniqlang'}
        </p>
        <MapPicker
          initialCoords={initialCoords}
          onChange={({ latitude, longitude }) => {
            setValues((prev) => ({ ...prev, latitude, longitude }));
            setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#FF8C00] hover:bg-[#e07800] text-white font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1" />
              Saqlanmoqda...
            </>
          ) : isEdit ? (
            "O'zgarishlarni saqlash"
          ) : (
            'Saqlash'
          )}
        </Button>
      </div>
    </form>
  );
}
