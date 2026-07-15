'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronsUpDown, Check, MonitorSpeaker } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function DeviceCombobox({
  value,
  onChange,
  devices = [],
  placeholder,
  allLabel,
  error,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const tc = useTranslations('common');

  const list = useMemo(() => devices.filter(Boolean), [devices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (d) => d.name?.toLowerCase().includes(q) || d.serial_number?.toLowerCase().includes(q)
    );
  }, [list, search]);

  const selected = list.find((d) => d.id === value);
  const selectedLabel = selected
    ? `${selected.name}${selected.serial_number ? ` · ${selected.serial_number}` : ''}`
    : !value && allLabel
      ? allLabel
      : null;

  const select = (id) => {
    onChange(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-[14px] bg-background transition-colors',
            'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            error ? 'border-destructive' : 'border-input',
            !selectedLabel && 'text-muted-foreground',
            triggerClassName
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MonitorSpeaker size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedLabel ?? placeholder}</span>
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
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tc('search')}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-64 overflow-y-auto py-1" onWheel={(e) => e.stopPropagation()}>
          {allLabel && (
            <button
              type="button"
              onClick={() => select('')}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                !value && 'bg-accent'
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                <MonitorSpeaker size={14} />
              </div>
              <span className="text-[13px] font-medium">{allLabel}</span>
              {!value && <Check size={12} className="ml-auto shrink-0 text-[#3b82f6]" />}
            </button>
          )}

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{tc('notFound')}</p>
          ) : (
            filtered.map((d) => {
              const isSelected = d.id === value;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => select(d.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                    isSelected && 'bg-accent'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                    <MonitorSpeaker size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{d.name}</p>
                    {d.serial_number && (
                      <p className="text-[11px] text-muted-foreground truncate font-mono">
                        {d.serial_number}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check size={12} className="shrink-0 text-[#3b82f6]" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DeviceCombobox;
