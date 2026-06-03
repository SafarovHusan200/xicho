'use client';

import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaRegCalendarCheck } from 'react-icons/fa6';
import { BsFillPinAngleFill } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

const upcomingTests = [
  {
    id: 1,
    title: "Markaziy kompressor ko'rigi",
    description: "Texnik xavfsizlik reglamentini bo'yicha...",
    daysLeft: 3,
    type: 'AL BB',
  },
  {
    id: 2,
    title: 'Gidravlik bosim sinovi',
    description: "3-blok bug' qozlonlari tizimi",
    daysLeft: 5,
    type: 'MK',
  },
  {
    id: 3,
    title: "Yong'in xavfsizligi auditi",
    description: 'Bosh bino va omborxonalar',
    daysLeft: 12,
    type: 'YXA',
  },
];

const eventsData = {
  '2026-06-06': [
    {
      id: 1,
      title: "Markaziy kompressor ko'rigi",
      description: "Texnik xavfsizlik reglamentini bo'yicha...",
      type: 'inspection',
    },
  ],
  '2026-06-08': [
    {
      id: 2,
      title: 'Gidravlik bosim sinovi',
      description: "3-blok bug' qozlonlari tizimi",
      type: 'test',
    },
  ],
  '2026-06-15': [
    {
      id: 3,
      title: "Yong'in xavfsizligi auditi",
      description: 'Bosh bino va omborxonalar',
      type: 'audit',
    },
  ],
};

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  const selectedKey = date?.toLocaleDateString('en-CA');
  const selectedEvents = selectedKey ? eventsData[selectedKey] || [] : [];

  // event bor kunlar
  const eventDays = useMemo(() => {
    return Object.keys(eventsData).map((d) => new Date(d));
  }, []);

  const handleSelect = (day) => {
    if (!day) return;
    console.log(day);

    setDate(day);
  };

  return (
    <div className="min-h-screen p-4">
      <Breadcrumb className={'mb-3'}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Asosiy</Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <Link href="/dashboard">Monitoring</Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage className={'font-bold'}>Calendar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-[#031634]  text-[32px] font-bold leading-10 tracking-[-0.64px]">
        Sinov va ko'rik kalendari
      </h2>
      <div className="w-full mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CALENDAR */}
        <div className="lg:col-span-1 rounded-lg bg-white shadow-md p-4 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaRegCalendarCheck className="text-blue-700 text-[20px]" />
            <span className="text-blue-700">Calendar</span>
          </h2>

          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="rounded-md w-full"
            modifiers={{
              hasEvent: eventDays,
            }}
            modifiersClassNames={{
              hasEvent:
                'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full',
              selected: 'bg-slate-300',
            }}
          />
        </div>

        <div className="lg:col-span-1 rounded-lg bg-white shadow-md p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BsFillPinAngleFill className="text-blue-700 text-[20px]" />
            <span className="text-blue-700">Calendar ma'lumotlari</span>
          </h2>

          {date ? (
            <div className="space-y-3">
              <p className="font-semibold text-lg">{date.toDateString()}</p>

              {selectedEvents.length > 0 ? (
                selectedEvents.map((e) => (
                  <Card key={e.id} className="p-4 hover:shadow-md transition rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{e.title}</h3>

                      <Badge
                        className={
                          e.type === 'test'
                            ? 'bg-blue-500'
                            : e.type === 'audit'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                        }
                      >
                        {e.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500">{e.description}</p>
                  </Card>
                ))
              ) : (
                <p className="text-gray-400">Bu kunda event yo‘q</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Sanani tanlang</p>
          )}
        </div>
        {/* SELECTED DATE INFO & PERFORMANCE */}
        <div className=" w-100 flex flex-col gap-6">
          {/* UPCOMING TESTS */}
          <div className="rounded-lg bg-white shadow-md p-5 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#031634]">Yaqinlashayotgan sinovlar</h3>
              <Badge className="bg-blue-100 text-blue-700">{upcomingTests.length} TA</Badge>
            </div>

            <div className="space-y-3">
              {upcomingTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge
                        className={
                          test.daysLeft <= 3
                            ? 'bg-red-100 text-red-600 mb-2 text-xs'
                            : test.daysLeft <= 7
                              ? 'bg-orange-100 text-orange-600 mb-2 text-xs'
                              : 'bg-yellow-100 text-yellow-600 mb-2 text-xs'
                        }
                      >
                        {test.daysLeft} kun qoldi
                      </Badge>
                      <h3 className="font-semibold text-sm text-[#031634]">{test.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{test.description}</p>
                      <Badge className="bg-gray-200 text-gray-700 text-xs mt-2">{test.type}</Badge>
                    </div>
                    <FiArrowRight className="text-gray-400 mt-1 shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm font-medium text-[#031634]">
              Barcha tadbirlarni ko'rish
            </button>
          </div>
          <div className="rounded-lg bg-linear-to-br from-slate-900 to-slate-800 shadow-md p-6 text-white">
            <p className="text-xs font-semibold mb-2 tracking-widest opacity-75">
              OYLIK SAMARADORLIK
            </p>
            <h3 className="text-4xl font-bold mb-4">94.2%</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Ko'riklar vaqtida bajarilishi bo'yicha ko'rsatkichi o'tgan oyga nisbatan 2.4% ga
              oshdi.
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-linear-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: '94.2%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
