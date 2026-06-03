'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import QurilmalarTable from '@/components/QurilmalarTable';

const DevicesPage = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(null);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="">
          <h2 className="title text-[#031634]  text-[24px] font-bold leading-10 tracking-[-0.64px]">
            Qurilmalar reestri
          </h2>
          <p className="text-[#44474E] text-[16px] font-normal leading-6 mb-6 ">
            Barcha texnik vositalar va sanoat qurilmalari ro'yxati
          </p>
        </div>

        <Link href={'/dashboard/devices/add'}>
          <Button className="flex items-center gap-2 px-5 py-5 text-[16px] cursor-pointer ">
            <img src="/icons/plus.svg" alt="icon" />
            <span>Qurilma qo'shish</span>
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6 w-full flex justify-between items-start gap-4 flex-wrap p-6 pt-8 rounded-[8px] border border-[#C5C6CF] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]  ">
        <div className="w-[calc(25%-12px)]">
          <b className=" pl-1 mb-1.5 text-[#44474E] text-[12px] font-semibold leading-4 tracking-[0.6px]">
            Stansiya
          </b>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Barcha stansiyalar" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="stansiya-1">Stansiya 1</SelectItem>
                <SelectItem value="stansiya-2">Stansiya 2</SelectItem>
                <SelectItem value="stansiya-3">Stansiya 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[calc(25%-12px)] ">
          <b className=" pl-1 mb-1.5 text-[#44474E] text-[12px] font-semibold leading-4 tracking-[0.6px]">
            Qurilma turi
          </b>
          <Select className="w-full">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Barcha turlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="tur-1"> 1-tur</SelectItem>
                <SelectItem value="tur-2"> 2-tur</SelectItem>
                <SelectItem value="tur-3"> 3-tur</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[calc(25%-12px)] ">
          <b className=" pl-1 mb-1.5 text-[#44474E] text-[12px] font-semibold leading-4 tracking-[0.6px]">
            Holatlar
          </b>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Barcha holatlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="tur-1"> 1-holat</SelectItem>
                <SelectItem value="tur-2"> 2-holat</SelectItem>
                <SelectItem value="tur-3"> 3-holat</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[calc(25%-12px)] ">
          <Field className="mx-auto w-full gap-0">
            <FieldLabel
              htmlFor="date"
              className=" pl-1 mb-1.5 text-[#44474E] text-[12px] font-semibold leading-4 tracking-[0.6px]"
            >
              Date of birth
            </FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="flex  justify-between font-normal text-[]"
                >
                  {date ? date.toLocaleDateString() : 'mm/dd/yyyy'}
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  defaultMonth={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>
      </div>

      {/* Table */}
      <div>
        <QurilmalarTable />
      </div>
    </div>
  );
};

export default DevicesPage;
