'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePickerField from './DatePickerField';
import PassportSpecsEditor from './PassportSpecsEditor';

function DeviceForm({ initialData, onSubmit, onClose, isPending, t, deviceTypes, facilities }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    serial_number: initialData?.serial_number ?? '',
    ecosystem_reg_number: initialData?.ecosystem_reg_number ?? '',
    manufacturer_details: initialData?.manufacturer_details ?? '',
    device_type_id: initialData?.device_type_id ?? '',
    facility_id: initialData?.facility_id ?? '',
    commissioning_date: initialData?.commissioning_date ?? '',
    passport_specifications: initialData?.passport_specifications ?? {},
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = t('nameError');
    }
    if (!form.ecosystem_reg_number.trim()) {
      newErrors.ecosystem_reg_number = t('ecoError') || 'Ecosystem registration number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      is_active: form.is_active,
    };
    if (form.serial_number.trim()) payload.serial_number = form.serial_number.trim();
    if (form.ecosystem_reg_number.trim())
      payload.ecosystem_reg_number = form.ecosystem_reg_number.trim();
    if (form.manufacturer_details.trim())
      payload.manufacturer_details = form.manufacturer_details.trim();
    if (form.device_type_id) payload.device_type_id = form.device_type_id;
    if (form.facility_id) payload.facility_id = form.facility_id;
    if (form.commissioning_date) payload.commissioning_date = form.commissioning_date;
    payload.passport_specifications = form.passport_specifications ?? {};

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('nameLabel')} *</Label>
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('namePlaceholder')}
          className="text-[14px]"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Serial + Eco */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('serialLabel')}</Label>
          <Input
            value={form.serial_number}
            onChange={(e) => set('serial_number', e.target.value)}
            placeholder={t('serialPlaceholder')}
            className="text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[14px] font-medium">{t('ecoLabel')}</Label>
            <a
              href="https://ekotizim.cirns.uz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              ekotizim.cirns.uz
            </a>
          </div>
          <Input
            value={form.ecosystem_reg_number}
            onChange={(e) => set('ecosystem_reg_number', e.target.value)}
            placeholder={t('ecoPlaceholder')}
            className={`text-[14px] ${errors.ecosystem_reg_number ? 'border-destructive' : ''}`}
          />
          {errors.ecosystem_reg_number && (
            <p className="text-xs text-destructive">{errors.ecosystem_reg_number}</p>
          )}
        </div>
      </div>

      {/* Manufacturer + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('manufacturerLabel')}</Label>
          <Input
            value={form.manufacturer_details}
            onChange={(e) => set('manufacturer_details', e.target.value)}
            placeholder={t('manufacturerPlaceholder')}
            className="text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('commissioningLabel')}</Label>
          <DatePickerField
            value={form.commissioning_date}
            onChange={(v) => set('commissioning_date', v)}
          />
        </div>
      </div>

      {/* Device Type + Facility */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('typeLabel')}</Label>
          <Select value={form.device_type_id} onValueChange={(v) => set('device_type_id', v)}>
            <SelectTrigger className="w-full text-[14px]">
              <SelectValue placeholder={t('typePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes.map((dt) => (
                <SelectItem key={dt.id} value={dt.id}>
                  {dt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('facilityLabel')}</Label>
          <Select value={form.facility_id} onValueChange={(v) => set('facility_id', v)}>
            <SelectTrigger className="w-full text-[14px]">
              <SelectValue placeholder={t('facilityPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Passport specs */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('passportLabel')}</Label>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
          <PassportSpecsEditor
            value={form.passport_specifications}
            onChange={(v) => set('passport_specifications', v)}
            t={t}
          />
        </div>
      </div>

      {/* is_active */}
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
        <Checkbox
          id="dev_is_active"
          checked={form.is_active}
          onCheckedChange={(v) => set('is_active', v)}
          className={'-blue-500'}
        />
        <Label htmlFor="dev_is_active" className="cursor-pointer font-normal text-[14px]">
          {t('isActiveLabel')}
        </Label>
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

export default DeviceForm;
