'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Zap,
  Eye,
  Check,
  ChevronRight,
  Lock,
  Flame,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';

// ─── Static Data ────────────────────────────────────────────────────────────

const stats = [
  {
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    badge: { label: 'ВЫСОКИЙ РИСК', color: 'bg-red-100 text-red-600' },
    value: '02',
    label: 'КРИТИЧЕСКИЕ ОТКАЗЫ',
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-slate-500" />,
    badge: null,
    value: '14',
    label: 'АКТИВНЫЕ ЗАКАЗЫ РАБОТ',
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-orange-400" />,
    badge: null,
    value: '07',
    label: 'ОЖИДАЮТ УТВЕРЖДЕНИЯ',
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-orange-400" />,
    badge: null,
    value: '',
    label: '',
  },
];

const notifications = [
  {
    color: 'bg-red-500',
    title: 'Падение давления: Конденсатор 04-А',
    time: '14:22',
    desc: 'Обнаружено снижение эффективности. Требуется немедленная отправка техника для проверки уплотнений.',
  },
  {
    color: 'bg-orange-400',
    title: 'Плановое обслуживание: Турбинный узел',
    time: '12:05',
    desc: 'Квартальный анализ вибрации должен быть выполнен через 24 часа. Назначена бригада обслуживания №09.',
  },
  {
    color: 'bg-slate-300',
    title: 'Смена передана',
    time: '08:00',
    desc: 'Переход с A-смены на B-смену подтвержден. Открытых инцидентов: 0.',
  },
];

const workOrders = [
  {
    id: 'B-772-TUR',
    task: 'Промывка системы смазки',
    priority: 'ВЫСОКИЙ',
    priorityColor: 'bg-red-100 text-red-600',
    status: 'В РАБОТЕ',
    statusColor: 'text-orange-500',
  },
  {
    id: 'E-412-VLV',
    task: 'Перекалибровка исполнительного механизма',
    priority: 'СРЕДНИЙ',
    priorityColor: 'bg-slate-100 text-slate-600',
    status: 'ЗАПЛАНИРОВАНО',
    statusColor: 'text-slate-400',
  },
  {
    id: 'G-001-GEN',
    task: 'Тест статического разряда',
    priority: 'НИЗКИЙ',
    priorityColor: 'bg-green-100 text-green-700',
    status: 'ЧЕРНОВИК',
    statusColor: 'text-slate-300',
  },
];

const calendar = {
  month: 'Окт 2023',
  days: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'],
  weeks: [
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
  ],
  today: 14,
  dot: 20,
};

const safetyPermits = [
  {
    id: 'LOTO-7721',
    desc: 'Вход в замкнутое пространство',
    icon: <Lock className="w-4 h-4 text-orange-400" />,
  },
  {
    id: 'HOT-4410',
    desc: 'Сварочные работы — отсек 02',
    icon: <Flame className="w-4 h-4 text-orange-400" />,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function OperationalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Операционная панель
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Телеметрия в реальном времени и управление техобслуживанием для блока 04.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Статус сети</p>
            <p className="text-2xl font-black">
              842.4 <span className="text-sm font-normal">MW</span>
            </p>
          </div>
          <div className="bg-yellow-400 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className="rounded-2xl shadow-sm border border-slate-100">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-2 mb-3">
                {s.icon}
                {s.badge && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge.color}`}
                  >
                    {s.badge.label}
                  </span>
                )}
              </div>
              {s.value && <p className="text-4xl font-black text-slate-900">{s.value}</p>}
              {s.label && (
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Notifications + Work Orders */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Notifications */}
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-700">
                  Системные уведомления и сигналы
                </CardTitle>
                <Button
                  variant="ghost"
                  className="text-xs text-slate-400 hover:text-slate-600 h-auto p-0"
                >
                  ПОСМОТРЕТЬ АРХИВ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-3">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-4"
                >
                  <div className={`w-1 self-stretch rounded-full ${n.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <span className="text-xs text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{n.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Orders */}
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-700">
                Предстоящие заказы работ
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white rounded-xl">
                    <th className="text-left text-xs font-semibold tracking-widest px-4 py-3 rounded-l-xl">
                      ИДЕНТИФИКАТОР
                    </th>
                    <th className="text-left text-xs font-semibold tracking-widest px-4 py-3">
                      ОПИСАНИЕ ЗАДАЧИ
                    </th>
                    <th className="text-left text-xs font-semibold tracking-widest px-4 py-3">
                      ПРИОРИТЕТ
                    </th>
                    <th className="text-left text-xs font-semibold tracking-widest px-4 py-3 rounded-r-xl">
                      СТАТУС
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((w, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-bold text-slate-800">{w.id}</td>
                      <td className="px-4 py-3 text-slate-600">{w.task}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md ${w.priorityColor}`}
                        >
                          {w.priority}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 ${w.statusColor}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${w.statusColor.replace('text-', 'bg-')}`}
                        />
                        {w.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Calendar + Temp + Safety */}
        <div className="flex flex-col gap-6">
          {/* Calendar */}
          <Card className="rounded-2xl shadow-sm border border-slate-100 bg-slate-900 text-white">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Окно обслуживания
                </CardTitle>
                <span className="text-xs text-slate-400">{calendar.month}</span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {calendar.days.map((d, i) => (
                  <div key={i} className="text-xs text-slate-500 font-semibold">
                    {d}
                  </div>
                ))}
              </div>
              {calendar.weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 text-center mb-1">
                  {week.map((day, di) => (
                    <div key={di} className="relative flex flex-col items-center">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-semibold
                        ${day === calendar.today ? 'bg-orange-400 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                      >
                        {day}
                      </div>
                      {day === calendar.dot && (
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <Separator className="bg-slate-700 my-3" />
              <div>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
                  Фокус на сегодня
                </p>
                <p className="text-xs text-slate-300">
                  Профилактическая проверка выпускных труб котла блока 04.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exhaust Temp */}
          <Card className="rounded-2xl overflow-hidden shadow-sm border-0 relative min-h-35 bg-slate-800">
            <div className="absolute inset-0 bg-linear-to-br from-slate-900/80 to-slate-700/60 z-10" />
            <CardContent className="relative z-20 pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Температура выхлопа
                </span>
              </div>
              <p className="text-5xl font-black text-white">
                542<span className="text-2xl">°C</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                +1.2% ТРЕНД
              </div>
            </CardContent>
          </Card>

          {/* Safety Permits */}
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Ожидающие разрешения по безопасности
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-2">
              {safetyPermits.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    {p.icon}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.id}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
