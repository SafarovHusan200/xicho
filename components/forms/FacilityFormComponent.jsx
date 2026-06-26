'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from 'lucide-react';

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

  const isFacility = watch('is_facilities');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5 ">
        <Label htmlFor="facility-name" className={'text-[16px]'}>
          Nomi
        </Label>
        <Input
          id="facility-name"
          placeholder="Gaz Taqsimlash Stansiyasi №1"
          {...register('name')}
          aria-invalid={!!errors.name}
          className={'text-[16px]'}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={'text-[16px]'}>Unit Code</Label>
        <Controller
          name="unit_code"
          className={'text-[16px]'}
          control={control}
          render={({ field }) => (
            <CreatableSelect
              value={field.value}
              onChange={field.onChange}
              options={UNIT_CODES}
              placeholder="Kodni tanlang yoki kiriting..."
              error={errors.unit_code}
            />
          )}
        />
        {errors.unit_code && <p className="text-sm text-destructive">{errors.unit_code.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="is_facilities"
          className={'text-[16px]'}
          control={control}
          render={({ field }) => (
            <Checkbox id="is-facilities" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="is-facilities" className="cursor-pointer font-normal text-[16px]">
          Bu asosiy ob'ekt (ОПО)
        </Label>
      </div>

      {!isFacility && (
        <div className="flex flex-col gap-1.5">
          <Label className={'text-[16px]'}>Asosiy ob'ekt (ota-ob'ekt)</Label>
          <Controller
            name="parent_id"
            className={'text-[16px]'}
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ob'ektni tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Asosiy ob'ektlar mavjud emas
                    </div>
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
          {errors.parent_id && (
            <p className="text-sm text-destructive">{errors.parent_id.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </form>
  );
}
