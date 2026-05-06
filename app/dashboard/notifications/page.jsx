'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  MapPin,
  Hash,
  ImagePlus,
  AlertOctagon,
  AlignLeft,
  Layers,
  CheckCircle2,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const priorities = [
  {
    id: 'emergency',
    label: 'АВАРИЙНЫЙ',
    icon: <AlertOctagon className="w-4 h-4" />,
    active: true,
    activeClass: 'bg-red-50 border-red-400 text-red-600',
    iconClass: 'text-red-500',
  },
  {
    id: 'high',
    label: 'ВЫСОКИЙ ПРИОРИТЕТ',
    icon: <span className="font-black text-base leading-none">!</span>,
    active: false,
    activeClass: 'bg-white border-slate-200 text-slate-700',
    iconClass: 'text-slate-700',
  },
  {
    id: 'medium',
    label: 'СРЕДНИЙ',
    icon: <Layers className="w-4 h-4" />,
    active: false,
    activeClass: 'bg-white border-slate-200 text-slate-700',
    iconClass: 'text-slate-700',
  },
  {
    id: 'low',
    label: 'НИЗКИЙ / РУТИННЫЙ',
    icon: <AlignLeft className="w-4 h-4" />,
    active: false,
    activeClass: 'bg-white border-slate-200 text-slate-700',
    iconClass: 'text-slate-700',
  },
];

const recentHistory = [
  {
    id: '#WO-2024-00712',
    title: 'Перегрев подшипника турбины - сектор B-12',
    resolved: 'Решено 14 дней назад',
  },
  {
    id: '#WO-2024-00685',
    title: 'Дрейф калибровки датчика - блок 04',
    resolved: 'Решено 21 день назад',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BreakdownNotification() {
  const [selectedPriority, setSelectedPriority] = useState('emergency');
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full uppercase tracking-widest">
            Требуется действие
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mt-2">
            Создать уведомление о неисправности
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Инициировать отчет о критическом отказе оборудования для инфраструктуры блока 04.
          </p>
        </div>
        <div className="flex items-center gap-3 border border-slate-200 bg-white rounded-xl px-5 py-3 shadow-sm">
          <Hash className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Авто-созданный ЗР</p>
            <p className="text-lg font-black text-slate-900 tracking-wide">WO-2024-00892-TH</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Equipment + Location */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                Оборудование / модель
              </label>
              <Select>
                <SelectTrigger className="h-12! w-full bg-white border-slate-200 rounded-xl text-slate-600">
                  <SelectValue placeholder="Выберите актив..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turbine-04">Турбина блока 04</SelectItem>
                  <SelectItem value="condenser-a">Конденсатор 04-А</SelectItem>
                  <SelectItem value="boiler-b12">Котел B-12</SelectItem>
                  <SelectItem value="generator-g1">Генератор G-001</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                Местоположение на объекте
              </label>
              <div className="relative">
                <Input
                  placeholder="например Уровень 3, сектор B-12"
                  className="h-12 w-full bg-white border-slate-200 rounded-xl pr-10 text-slate-600"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Подробное описание проблемы
            </label>
            <Textarea
              placeholder="Опишите симптомы, последовательность событий и принятые меры..."
              className="bg-white border-slate-200 rounded-xl min-h-35 text-slate-600 resize-none"
            />
          </div>

          {/* Upload */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Визуальные данные / загрузка фото
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-14 cursor-pointer transition-all
                ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
            >
              <ImagePlus className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                Нажмите для загрузки или перетащите файл
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG или PDF до 10 МБ</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              className="flex-1 h-12 text-sm font-bold uppercase tracking-widest text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              Сохранить черновик
            </Button>
            <Button className="flex-1 h-12 text-sm font-bold uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-slate-700">
              Отправить уведомление
            </Button>
          </div>
        </div>

        {/* Right: Priority + Safety + History */}
        <div className="flex flex-col gap-5">
          {/* Incident Priority */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Приоритет инцидента
            </p>
            <div className="flex flex-col gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPriority(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wide transition-all
                    ${selectedPriority === p.id ? p.activeClass + ' shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <span className={selectedPriority === p.id ? p.iconClass : 'text-slate-400'}>
                    {p.icon}
                  </span>
                  {p.label}
                  {selectedPriority === p.id && p.id === 'emergency' && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-red-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Protocol */}
          <Card className="rounded-2xl bg-slate-900 text-white border-0 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">
                Протокол безопасности
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Неисправность в блоке 04 требует обязательной процедуры «Lock-Out Tag-Out» (LOTO)
                перед расследованием.
              </p>
              <div className="flex items-center gap-2 text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Среда высокого напряжения
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent History */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Связанная недавняя история
            </p>
            <div className="flex flex-col gap-3">
              {recentHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3"
                >
                  <div className="w-1 rounded-full bg-orange-400 self-stretch" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{h.id}</p>
                    <p className="text-sm text-slate-700 font-medium">{h.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{h.resolved}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
