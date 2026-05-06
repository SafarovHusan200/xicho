'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertOctagon,
  AlertTriangle,
  Lock,
  Flame,
  CheckCircle2,
  Circle,
  HardHat,
  Eye,
  Wrench,
  Hand,
  PersonStanding,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const lifecycleSteps = [
  { label: 'ЗАПРОШЕНО', status: 'done' },
  { label: 'ЗАПЛАНИРОВАНО', status: 'done' },
  { label: 'УТВЕРЖДЕНИЕ', status: 'active' },
  { label: 'ИСПОЛНЕНИЕ', status: 'pending' },
  { label: 'ПОДТВЕРЖДЕНО', status: 'pending' },
];

const hazards = [
  {
    icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
    title: 'Выброс пара высокого давления',
    desc: 'Возможны термические ожоги и усталость конструкции.',
    badge: { label: 'Контейнер', class: 'bg-blue-100 text-blue-600 border border-blue-300' },
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    title: 'Ограниченный доступ к конструкции',
    desc: 'Требуются меры для работы в замкнутом пространстве в отсеке 09.',
    badge: null,
  },
];

const safetyChecks = [
  {
    icon: <Lock className="w-5 h-5 text-white" />,
    bg: 'bg-slate-900',
    label: 'LOCKOUT/TAGOUT',
    value: 'Isolation Verified',
    checked: true,
  },
  {
    icon: <Flame className="w-5 h-5 text-white" />,
    bg: 'bg-red-500',
    label: 'FIRE HAZARD CHECK',
    value: 'Extinguishers Present',
    checked: true,
  },
];

const ppeItems = [
  {
    label: 'Защитная каска (класс 1)',
    icon: <HardHat className="w-4 h-4 text-slate-400" />,
    checked: true,
  },
  { label: 'Прочные перчатки', icon: <Hand className="w-4 h-4 text-slate-400" />, checked: true },
  {
    label: 'Стальные ботинки',
    icon: <PersonStanding className="w-4 h-4 text-slate-400" />,
    checked: true,
  },
  {
    label: 'Защитные очки с вентиляцией',
    icon: <Eye className="w-4 h-4 text-slate-400" />,
    checked: false,
  },
];

const telemetry = [
  { label: 'ТЕМПЕРАТУРА КОРПУСА', value: '184', unit: '°C' },
  { label: 'АТМ. ДАВЛЕНИЕ', value: '14.7', unit: 'PSI' },
  { label: 'УРОВЕНЬ ШУМА', value: '112', unit: 'dB' },
  { label: 'ПОСЛЕДНЯЯ ПРОВЕРКА', value: '4Ч', unit: 'НАЗАД' },
];

// ─── Lifecycle Bar ────────────────────────────────────────────────────────────

function LifecycleBar() {
  return (
    <div className="flex items-start gap-0">
      {lifecycleSteps.map((step, i) => (
        <div key={i} className="flex items-start">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${
                step.status === 'done'
                  ? 'bg-slate-700 border-slate-700'
                  : step.status === 'active'
                    ? 'bg-white border-orange-400 ring-2 ring-orange-300'
                    : 'bg-white border-slate-300'
              }`}
            >
              {step.status === 'done' && <div className="w-2 h-2 rounded-full bg-white" />}
              {step.status === 'active' && <div className="w-2 h-2 rounded-full bg-orange-400" />}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest mt-1.5
              ${step.status === 'active' ? 'text-orange-400' : step.status === 'done' ? 'text-slate-600' : 'text-slate-300'}`}
            >
              {step.label}
            </span>
          </div>
          {i < lifecycleSteps.length - 1 && (
            <div className={`h-0.5 w-14 mt-3 ${i < 2 ? 'bg-slate-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SafetyApproval() {
  const [ppe, setPpe] = useState(ppeItems.map((p) => p.checked));

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Одобрение безопасности №SA-9042
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Местоположение: паровая турбина высокого давления — отсек 09
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-bold">
            <span>Жизненный цикл обслуживания</span>
            <span className="text-orange-400">Статус: текущая проверка</span>
          </div>
          <LifecycleBar />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Left: Risk Assessment */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Risk Assessment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center">
                <div className="w-3 h-3 border border-slate-400 rounded-sm" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                Сводка оценки риска
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Hazards */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Классификация опасностей
                </p>
                <div className="flex flex-col gap-4">
                  {hazards.map((h, i) => (
                    <div key={i}>
                      {h.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border mb-1 inline-block ${h.badge.class}`}
                        >
                          {h.badge.label}
                        </span>
                      )}
                      <div className="flex items-start gap-2">
                        {h.icon}
                        <div>
                          <p
                            className={`text-sm font-bold ${i === 0 ? 'text-slate-900 border-b-2 border-blue-400 pb-0.5' : 'text-slate-800'}`}
                          >
                            {h.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{h.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Risk Index */}
              <div className="border-l border-slate-100 pl-6">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">
                  Критический индекс риска
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-black text-slate-900">7.4</span>
                  <span className="text-lg text-slate-400 mb-2">/ 10.0</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Уровень: повышенная опасность. Требуется подпись вторичного контроллера.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Checks */}
          <div className="grid grid-cols-2 gap-4">
            {safetyChecks.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{s.value}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-orange-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: PPE + Actions */}
        <div className="flex flex-col gap-4">
          {/* PPE Checklist */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-orange-400" />
              <h2 className="text-sm font-black uppercase tracking-widest">
                Обязательный список СИЗ
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {ppe.map((checked, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPpe((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all
                        ${checked ? 'bg-orange-400 border-orange-400' : 'border-slate-600 bg-transparent'}`}
                    >
                      {checked && <span className="text-white text-xs font-black">✓</span>}
                    </button>
                    <span
                      className={`text-sm font-semibold ${checked ? 'text-white' : 'text-slate-400'}`}
                    >
                      {ppeItems[i].label}
                    </span>
                  </div>
                  {ppeItems[i].icon}
                </div>
              ))}
            </div>
          </div>

          {/* Approve / Reject */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <Button className="w-full bg-slate-900 text-white rounded-xl h-12 font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700">
              <Shield className="w-4 h-4" />
              Утвердить разрешение по безопасности
            </Button>
            <Button
              variant="outline"
              className="w-full border-orange-400 text-orange-500 rounded-xl h-12 font-bold uppercase tracking-widest hover:bg-orange-50"
            >
              Отклонить / Требуется исправление
            </Button>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Подтверждая, вы удостоверяете, что все меры безопасности визуально проверены и
              соответствуют стандартам завода 22-A.
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-4 gap-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {telemetry.map((t, i) => (
          <div key={i} className={`px-8 py-6 ${i < 3 ? 'border-r border-slate-100' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {t.label}
            </p>
            <p className="text-4xl font-black text-slate-900">
              {t.value}
              <span className="text-lg font-bold text-slate-500 ml-1">{t.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
