'use client';

import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  modifiersClassNames,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-transparent p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      modifiersClassNames={modifiersClassNames}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none rounded-lg text-[#7B8499] transition-colors hover:bg-[#3b82f6]/10 hover:text-[#3b82f6] dark:text-slate-400 dark:hover:bg-[#3b82f6]/20 dark:hover:text-[#60a5fa] aria-disabled:opacity-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none rounded-lg text-[#7B8499] transition-colors hover:bg-[#3b82f6]/10 hover:text-[#3b82f6] dark:text-slate-400 dark:hover:bg-[#3b82f6]/20 dark:hover:text-[#60a5fa] aria-disabled:opacity-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn('relative rounded-(--cell-radius)', defaultClassNames.dropdown_root),
        dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none font-semibold text-[#031634] dark:text-slate-100',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-[#7B8499] dark:[&>svg]:text-slate-400',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex mb-1', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-(--cell-radius) text-[0.7rem] font-semibold uppercase tracking-wide text-[#7B8499] dark:text-slate-500 select-none',
          defaultClassNames.weekday
        ),
        week: cn('mt-1.5 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'text-[0.8rem] text-[#7B8499] dark:text-slate-500 select-none',
          defaultClassNames.week_number
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)'
            : '[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
          defaultClassNames.day
        ),
        range_start: cn(
          'relative isolate z-0 rounded-l-(--cell-radius) bg-[#3b82f6]/15 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-[#3b82f6]/15',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none bg-[#3b82f6]/10', defaultClassNames.range_middle),
        range_end: cn(
          'relative isolate z-0 rounded-r-(--cell-radius) bg-[#3b82f6]/15 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-[#3b82f6]/15',
          defaultClassNames.range_end
        ),
        today: cn(
          'rounded-(--cell-radius) bg-[#3b82f6]/10 text-[#3b82f6] font-semibold dark:bg-[#3b82f6]/20 dark:text-[#60a5fa] data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        outside: cn(
          'text-[#B7BDC9] dark:text-slate-600 aria-selected:text-[#B7BDC9] dark:aria-selected:text-slate-600',
          defaultClassNames.outside
        ),
        disabled: cn('text-[#B7BDC9] dark:text-slate-600 opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} modifiersClassNames={modifiersClassNames} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, locale, modifiersClassNames, ...props }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  /* ── surface any custom modifiers (e.g. per-status day coloring) supplied by the consumer ── */
  const customModifierClass = Object.keys(modifiers)
    .filter((key) => modifiers[key] && modifiersClassNames?.[key])
    .map((key) => modifiersClassNames[key])
    .join(' ');

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) border-0 leading-none font-normal transition-all hover:scale-105 hover:bg-[#3b82f6]/10 hover:text-[#3b82f6] dark:hover:bg-[#3b82f6]/15 dark:hover:text-[#60a5fa] group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-[#3b82f6] group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-[#3b82f6]/30 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-[#3b82f6] data-[range-end=true]:text-white data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-[#3b82f6]/10 data-[range-middle=true]:text-[#031634] dark:data-[range-middle=true]:text-slate-100 data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-[#3b82f6] data-[range-start=true]:text-white data-[selected-single=true]:bg-[#3b82f6] data-[selected-single=true]:text-white data-[selected-single=true]:shadow-sm data-[selected-single=true]:hover:bg-[#2563eb] [&>span]:text-xs [&>span]:opacity-70',
        customModifierClass,
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
