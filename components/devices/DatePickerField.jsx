'use client';

import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function DatePickerField({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
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
            'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-input',
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
            onChange(d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString() : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePickerField;
