'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, Search, ChevronsUpDown, Check, User, CalendarIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import useGetQuery from '@/hooks/all/useGetQuery';
import { staffio } from '@/services/staffio';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import useEmployeeStore from '@/store/useEmployeeStore';

export function EmployeeCombobox({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const { employees, setEmployees } = useEmployeeStore();
  const t = useTranslations('personForm');
  const tc = useTranslations('common');

  const { data: employeesData, isLoading } = useGetQuery({
    key: 'staffio-employees',
    url: 'employee/',
    params: { limit: 10000 },
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
  });

  useEffect(() => {
    const data = employeesData?.data?.data;
    if (data?.length) setEmployees(data);
  }, [employeesData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees.slice(0, 50);
    const q = search.toLowerCase();
    return employees
      .filter(
        (e) =>
          e.first_name?.toLowerCase().includes(q) ||
          e.last_name?.toLowerCase().includes(q) ||
          e.middle_name?.toLowerCase().includes(q) ||
          e.tabel_number?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [employees, search]);

  const selected = employees.find((e) => e.id === value);
  const selectedLabel = selected ? `${selected.last_name} ${selected.first_name}` : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-[14px]  transition-colors',
            'hover:bg-accent/30 ',
            error ? 'border-destructive' : 'border-input',
            !selectedLabel && 'text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <User size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedLabel ?? t('employeePlaceholder')}</span>
          </div>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width) min-w-72"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          ) : (
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('employeeSearchPlaceholder')}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>

        <div className="max-h-64 overflow-y-auto py-1" onWheel={(e) => e.stopPropagation()}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" />
              {tc('loading')}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{tc('notFound')}</p>
          ) : (
            filtered.map((emp) => {
              const isSelected = emp.id === value;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    onChange(emp.id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                    isSelected && 'bg-accent'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-[12px] font-semibold">
                    {emp.first_name?.charAt(0)}
                    {emp.last_name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {emp.last_name} {emp.first_name} {emp.middle_name}
                    </p>
                    {emp.workplace?.position?.name && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {emp.workplace.position.name}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {emp.tabel_number}
                    </span>
                    {isSelected && <Check size={12} className="text-[#3b82f6]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {!isLoading && employees.length > 0 && (
          <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
            {t('employeeTotalCount', { count: employees.length })}
            {filtered.length < employees.length &&
              ` • ${t('employeeShowingCount', { count: filtered.length })}`}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function DatePickerField({ value, onChange, error, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const tc = useTranslations('common');
  const locale = useLocale();
  const date = value ? new Date(value) : undefined;

  const formatted = date
    ? date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-[14px] bg-background transition-colors',
            'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            error ? 'border-destructive' : 'border-input',
            !formatted && 'text-muted-foreground'
          )}
        >
          <span>{formatted ?? placeholder ?? tc('selectDate')}</span>
          <CalendarIcon size={15} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          endMonth={new Date(new Date().getFullYear() + 10, 11, 31)}
          onSelect={(d) => {
            onChange(d ? d.toISOString() : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

const toISOString = (val) => {
  if (!val) return '';
  return new Date(val).toISOString();
};

export default function PersonFormComponent({
  facilities = [],
  onSubmit,
  onClose,
  initialData,
  isPending,
}) {
  const t = useTranslations('personForm');

  const [form, setForm] = useState({
    employee_id: '',
    appointment_order_number: '',
    appointment_date: '',
    end_date: '',
    facility_id: '',
    is_inspector: false,
    is_main: false,
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        employee_id: initialData.employee_id ?? '',
        appointment_order_number: initialData.appointment_order_number ?? '',
        appointment_date: initialData.appointment_date ?? '',
        end_date: initialData.end_date ?? '',
        facility_id: initialData.facility_id ?? '',
        is_inspector: initialData.is_inspector ?? false,
        is_main: initialData.is_main ?? false,
        is_active: initialData.is_active ?? true,
      });
    } else {
      setForm({
        employee_id: '',
        appointment_order_number: '',
        appointment_date: '',
        end_date: '',
        facility_id: '',
        is_inspector: false,
        is_main: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [initialData]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = t('employeeError');
    if (!form.appointment_order_number.trim()) e.appointment_order_number = t('orderError');
    if (!form.appointment_date) e.appointment_date = t('dateError');
    if (!form.end_date) e.end_date = t('dateError');
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      employee_id: form.employee_id,
      appointment_order_number: form.appointment_order_number,
      appointment_date: toISOString(form.appointment_date),
      end_date: toISOString(form.end_date),
      is_inspector: form.is_inspector,
      is_main: form.is_main,
      is_active: form.is_active,
    };
    if (form.facility_id) payload.facility_id = form.facility_id;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Employee */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('employeeId')}</Label>
        <EmployeeCombobox
          value={form.employee_id}
          onChange={(val) => set('employee_id', val)}
          error={errors.employee_id}
        />
        {errors.employee_id && <p className="text-xs text-destructive">{errors.employee_id}</p>}
      </div>

      {/* Order number */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('orderNumber')}</Label>
        <Input
          placeholder={t('orderNumberPlaceholder')}
          value={form.appointment_order_number}
          onChange={(e) => set('appointment_order_number', e.target.value)}
          className="text-[14px]"
        />
        {errors.appointment_order_number && (
          <p className="text-xs text-destructive">{errors.appointment_order_number}</p>
        )}
      </div>

      {/* Facility */}
      {facilities.length > 0 && (
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
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('appointmentDate')}</Label>
          <DatePickerField
            value={form.appointment_date}
            onChange={(val) => set('appointment_date', val)}
            error={errors.appointment_date}
          />
          {errors.appointment_date && (
            <p className="text-xs text-destructive">{errors.appointment_date}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('endDate')}</Label>
          <DatePickerField
            value={form.end_date}
            onChange={(val) => set('end_date', val)}
            error={errors.end_date}
          />
          {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
        {[
          { key: 'is_inspector', label: t('isInspector') },
          { key: 'is_main', label: t('isMain') },
          { key: 'is_active', label: t('isActive') },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2.5">
            <Checkbox id={key} checked={form[key]} onCheckedChange={(val) => set(key, val)} />
            <Label htmlFor={key} className="cursor-pointer font-normal text-[14px]">
              {label}
            </Label>
          </div>
        ))}
      </div>

      {/* Actions */}
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
