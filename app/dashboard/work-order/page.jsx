'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ClipboardList,
  AlertTriangle,
  Users,
  BadgeCheck,
  Plus,
  Download,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Smile,
} from 'lucide-react';

const PDFDownloadClient = dynamic(() => import('@/components/ui/PDFDownloadClient'), {
  ssr: false,
});

// ─── Stats ───────────────────────────────────────────────────────────────────

const stats = [
  {
    label: 'ВСЕГО АКТИВНЫХ',
    value: '42',
    icon: <ClipboardList className="w-8 h-8 text-slate-200" />,
    highlight: false,
  },
  {
    label: 'КРИТИЧЕСКАЯ БЕЗОПАСНОСТЬ',
    value: '03',
    icon: <AlertTriangle className="w-8 h-8 text-red-200" />,
    highlight: false,
    valueClass: 'text-red-500',
  },
  {
    label: 'ДОСТУПНОСТЬ КОМАНДЫ',
    value: '88%',
    icon: <Users className="w-8 h-8 text-slate-200" />,
    highlight: false,
  },
  {
    label: 'СРОЧНЫЕ УТВЕРЖДЕНИЯ',
    value: '12',
    icon: <BadgeCheck className="w-8 h-8 text-orange-300" />,
    highlight: true,
    valueClass: 'text-orange-500',
  },
];

// ─── Work Orders ─────────────────────────────────────────────────────────────

const workOrders = [
  {
    id: '#WO-2024-0891',
    created: 'СОЗДАНО: 2 ЧАСА НАЗАД',
    equipment: 'Паровая турбина A',
    assetId: 'Актив: STA-04-BLK',
    icon: '1',
    priority: 'КРИТИЧЕСКИЙ',
    priorityClass: 'bg-red-100 text-red-600 border border-red-200',
    lifecycle: ['done', 'active', 'done', 'pending', 'pending'],
    team: { avatars: ['A'], extra: '+3', name: 'МОБИЛЬНАЯ ОПЕРАЦИОННАЯ ГРУППА DELTA' },
    assigned: true,
  },
  {
    id: '#WO-2024-0902',
    created: 'СОЗДАНО: 5 ЧАСОВ НАЗАД',
    equipment: 'Циркуляционный насос J-20',
    assetId: 'Актив: PUMP-20-C',
    icon: '2',
    priority: 'ВЫСОКИЙ',
    priorityClass: 'bg-orange-100 text-orange-600 border border-orange-200',
    lifecycle: ['done', 'pending', 'done', 'pending', 'warn'],
    team: { avatars: ['B'], extra: null, name: 'ОТДЕЛ ТЕХОБСЛУЖИВАНИЯ B' },
    assigned: true,
  },
  {
    id: '#WO-2024-1105',
    created: 'СОЗДАНО: 1 ДЕНЬ НАЗАД',
    equipment: 'Массив датчиков давления 12',
    assetId: 'Актив: SEN-PR-12',
    icon: '3',
    priority: 'НОРМАЛЬНЫЙ',
    priorityClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    lifecycle: ['warn', 'pending', 'pending', 'pending', 'pending'],
    team: null,
    assigned: false,
  },
];

const lifecycleLabels = ['УВЕД', '', 'БЕЗОПАС', '', 'ФИНАЛ'];

// ─── Lifecycle Step ───────────────────────────────────────────────────────────

function LifecycleStep({ steps }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        if (i % 2 === 1) {
          // connector line
          const prev = steps[i - 1];
          return (
            <div
              key={i}
              className={`h-0.5 w-8 rounded-full ${prev === 'done' ? 'bg-slate-300' : 'bg-slate-200'}`}
            />
          );
        }
        const label = lifecycleLabels[i];
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            {s === 'done' ? (
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
            ) : s === 'warn' ? (
              <Smile className="w-5 h-5 text-orange-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-200" />
            )}
            {label && (
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest">
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkOrderTracking() {
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Отслеживание заказов работ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Мониторинг статуса обслуживания блока 04 в реальном времени.
          </p>
        </div>
        <PDFDownloadClient
          children={
            <Button className="bg-slate-900 text-white rounded-xl h-12 px-6 font-bold uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Создать заказ работы
            </Button>
          }
          filename="my-document.pdf"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-1  border-slate-200  mb-6 overflow-hidden ">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`flex items-center rounded-2xl bg-white shadow-sm justify-between px-6 py-5 ${i < 3 ? '' : ''} ${s.highlight ? 'border-l-4 border-l-orange-400' : ''}`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                {s.label}
              </p>
              <p className={`text-4xl font-black ${s.valueClass || 'text-slate-900'}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Приоритет:
        </span>
        <button className="text-xs font-bold uppercase tracking-widest border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-50">
          Все приоритеты
        </button>

        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">
          Тип оборудования:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-50">
              Все устройства <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Все устройства</DropdownMenuItem>
            <DropdownMenuItem>Турбины</DropdownMenuItem>
            <DropdownMenuItem>Насосы</DropdownMenuItem>
            <DropdownMenuItem>Датчики</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">
          Статус:
        </span>
        {['active', 'on hold', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 transition-all
              ${status === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {s === 'active' ? 'Активные' : s === 'on hold' ? 'Приостановлено' : 'Решено'}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800">
            Сбросить фильтры
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[1.2fr_2fr_1fr_2fr_1.5fr_1fr] bg-slate-900 text-white px-6 py-4">
          {[
            'НОМЕР ЗР',
            'ОБОРУДОВАНИЕ / АКТИВ',
            'ПРИОРИТЕТ',
            'СТАТУС ЖИЗНЕННОГО ЦИКЛА',
            'НАЗНАЧЕННАЯ КОМАНДА',
            'ДЕЙСТВИЯ',
          ].map((h) => (
            <div key={h} className="text-xs font-bold uppercase tracking-widest">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {workOrders.map((wo, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1.2fr_2fr_1fr_2fr_1.5fr_1fr] px-6 py-5 items-center ${i < workOrders.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition`}
          >
            {/* WO Number */}
            <div>
              <p className="text-sm font-black text-slate-900">{wo.id}</p>
              <p className="text-xs text-slate-400 mt-0.5">{wo.created}</p>
            </div>

            {/* Equipment */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                {wo.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{wo.equipment}</p>
                <p className="text-xs text-slate-400">{wo.assetId}</p>
              </div>
            </div>

            {/* Priority */}
            <div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${wo.priorityClass}`}>
                {wo.priority}
              </span>
            </div>

            {/* Lifecycle */}
            <LifecycleStep steps={wo.lifecycle} />

            {/* Team */}
            <div>
              {wo.assigned && wo.team ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {wo.team.avatars.map((a, j) => (
                      <div
                        key={j}
                        className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs"
                      >
                        {a}
                      </div>
                    ))}
                    {wo.team.extra && (
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        {wo.team.extra}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 uppercase leading-tight">
                    {wo.team.name}
                  </p>
                </div>
              ) : (
                <button className="text-xs font-bold uppercase tracking-widest border border-slate-300 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50">
                  Назначить команду
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button className="bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl h-9 px-4 hover:bg-slate-700">
                Просмотр
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Редактировать</DropdownMenuItem>
                  <DropdownMenuItem>Приостановить</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Отменить</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Показано 1-15 из 142 заказов работ
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all
                  ${page === n ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(3, p + 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
