'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getUnitCodes } from '@/constants/unit_codes';

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

const schema = z
  .object({
    name: z.string().min(2, "Nom kamida 2 ta belgi bo'lishi kerak"),
    unit_code: z.string().min(1, 'Unit code kiritilishi shart'),
    is_facilities: z.boolean(),
    parent_id: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_facilities && !data.parent_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bo'linma uchun asosiy ob'ekt tanlanishi shart",
        path: ['parent_id'],
      });
    }
  });

export default function FacilityFormComponent({
  facilities = [],
  allFacilities = [],
  onSubmit,
  onClose,
  initialData,
  isPending,
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      unit_code: '',
      is_facilities: true,
      parent_id: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',
        unit_code: initialData.unit_code ?? '',
        is_facilities: initialData.is_facilities ?? true,
        parent_id: initialData.parent_id ? String(initialData.parent_id) : null,
      });
    } else {
      reset({ name: '', unit_code: '', is_facilities: true, parent_id: null });
    }
  }, [initialData, reset]);

  const t = useTranslations('facilityForm');
  const locale = useLocale();
  const unitCodes = getUnitCodes(locale);
  const isFacility = watch('is_facilities');
  const parentIdWatch = watch('parent_id');

  useEffect(() => {
    if (isFacility || initialData?.unit_code || !parentIdWatch) return;
    const parent = allFacilities.find((f) => f.id === parentIdWatch);
    if (!parent) return;
    const siblingCount = allFacilities.filter((f) => f.parent_id === parentIdWatch).length;
    const suffix = String(siblingCount + 1).padStart(2, '0');
    setValue('unit_code', `${parent.unit_code}-${suffix}`, { shouldValidate: true });
  }, [parentIdWatch, isFacility, initialData, allFacilities, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="facility-name" className="text-[15px]">
          {t('name')}
        </Label>
        <Input
          id="facility-name"
          placeholder={t('namePlaceholder')}
          {...register('name')}
          aria-invalid={!!errors.name}
          className="text-[15px]"
        />
        {errors.name && <p className="text-sm text-destructive">{t('nameError')}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[15px]">{t('unitCode')}</Label>
        <Controller
          name="unit_code"
          control={control}
          render={({ field }) =>
            isFacility ? (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('unitCodePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {unitCodes.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      <div className="w-full  flex items-center gap-3">
                        <span className="font-mono text-[14px] text-muted-foreground w-10 shrink-0">
                          {opt.code}
                        </span>
                        <div className="flex items-center justify-between gap-10 ">
                          <p className="text-[14px]">{opt.name}</p>
                          {opt.city && (
                            <p className="text-[12px] text-muted-foreground">{opt.city}</p>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={field.value ?? ''}
                disabled
                readOnly
                className="text-[15px] font-mono bg-muted/40"
              />
            )
          }
        />
        {errors.unit_code && <p className="text-sm text-destructive">{t('unitCodeError')}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="is_facilities"
          control={control}
          render={({ field }) => (
            <Checkbox id="is-facilities" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="is-facilities" className="cursor-pointer font-normal text-[15px]">
          {t('isMain')}
        </Label>
      </div>

      {!isFacility && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px]">{t('parentLabel')}</Label>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('parentPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {facilities.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">{t('noParents')}</div>
                  ) : (
                    facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.parent_id && <p className="text-sm text-destructive">{t('parentError')}</p>}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="rounded-md" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-md gap-2 text-white font-semibold"
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
