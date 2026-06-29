'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import { cn } from '@/lib/utils';

const UNIT_CODES = [
  '1010',
  '1020',
  '1030',
  '1040',
  '1050',
  '1060',
  '1070',
  '1080',
  '1090',
  '1100',
  '1110',
  '1120',
  '1130',
  '1140',
  '1150',
];

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

function CreatableSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const filtered = options.filter((opt) => opt.toLowerCase().includes(inputValue.toLowerCase()));

  function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setOpen(true);
  }

  function handleSelect(opt) {
    setInputValue(opt);
    onChange(opt);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        aria-invalid={!!error}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover py-1 shadow-md">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left',
                value === opt && 'text-primary font-medium'
              )}
              onMouseDown={() => handleSelect(opt)}
            >
              <CheckIcon
                className={cn('size-4 shrink-0', value === opt ? 'opacity-100' : 'opacity-0')}
              />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FacilityFormComponent({
  facilities = [],
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
  const isFacility = watch('is_facilities');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="facility-name" className="text-[15px]">{t('name')}</Label>
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
          render={({ field }) => (
            <CreatableSelect
              value={field.value}
              onChange={field.onChange}
              options={UNIT_CODES}
              placeholder={t('unitCodePlaceholder')}
              error={errors.unit_code}
            />
          )}
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
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
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
          type="submit" disabled={isPending}
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
