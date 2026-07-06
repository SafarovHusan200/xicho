'use client';
import React, { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import {
  Monitor,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MapPin,
  Users,
  Building2,
  Activity,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import Link from 'next/link';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = ({ w = 'w-14', h = 'h-10' }) => (
  <span
    className={`inline-block ${w} ${h} animate-pulse rounded-xl bg-white/40 dark:bg-slate-700`}
  />
);

/* ── Radial Gauge (recharts) ────────────────────────────── */
function RadialGauge({ pct, label }) {
  const color = pct >= 80 ? '#10B981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const data = [{ name: 'passRate', value: pct, fill: color }];
  const config = { value: { label } };

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-40">
      <RadialBarChart
        data={data}
        startAngle={90}
        endAngle={-270}
        innerRadius="72%"
        outerRadius="100%"
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" background={{ fill: '#e2e8f0' }} cornerRadius={20} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-black"
                    >
                      {pct}%
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

/* ── KPI Card (gradient bg) ──────────────────────────────── */
function KpiCard({ icon: Icon, color, bg, label, value, sub, isLoading, alert }) {
  return (
    <div
      className="relative flex flex-col gap-3 rounded-2xl px-5 py-4 overflow-hidden shadow-sm"
      style={{ background: bg }}
    >
      {/* decorative blob top-right */}
      {/* <div
        className="absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-20"
        style={{ backgroundColor: color }}
      /> */}
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>

        {/* icon with optional ping rings */}
        <div className="relative h-10 w-10 shrink-0">
          {alert && (
            <>
              <span
                className="absolute inset-0 rounded-xl animate-ping"
                style={{ backgroundColor: `${color}35`, animationDuration: '1.6s' }}
              />
              <span
                className="absolute inset-0 rounded-xl animate-ping"
                style={{
                  backgroundColor: `${color}20`,
                  animationDuration: '1.6s',
                  animationDelay: '0.5s',
                }}
              />
            </>
          )}
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}25` }}
          >
            <Icon size={18} style={{ color }} className={alert ? 'animate-pulse' : ''} />
          </div>
        </div>
      </div>

      <span className="relative text-[38px] font-black leading-none text-[#031634] dark:text-slate-900">
        {isLoading ? <Skel /> : <CountUp start={0} end={value ?? 0} duration={1.4} separator=" " />}
      </span>
      {sub && (
        <p className="relative text-[12px] font-medium" style={{ color: `${color}cc` }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Progress bar ────────────────────────────────────────── */
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1.5 text-[#44474E] dark:text-slate-400">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="font-semibold text-[#031634] dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── Pulse dot ───────────────────────────────────────────── */
const PulseDot = ({ color }) => (
  <span className="relative flex h-2.5 w-2.5 shrink-0">
    <span
      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex rounded-full h-2.5 w-2.5"
      style={{ backgroundColor: color }}
    />
  </span>
);

/* ── Device alert row ────────────────────────────────────── */
function DeviceRow({ device, badge, badgeColor, pulse }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20 last:border-0">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${badgeColor}15` }}
      >
        <Monitor size={14} style={{ color: badgeColor }} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {pulse && <PulseDot color={badgeColor} />}
          <span className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate">
            {device.name}
          </span>
        </div>
        <span className="text-[11px] text-[#7B8499] truncate">
          {device.facility_name}
          {device.serial_number && ` · ${device.serial_number}`}
        </span>
      </div>
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border shrink-0"
        style={{
          backgroundColor: `${badgeColor}12`,
          color: badgeColor,
          borderColor: `${badgeColor}30`,
        }}
      >
        {badge}
      </span>
    </div>
  );
}

/* ── Person avatar card ──────────────────────────────────── */
function PersonCard({
  name,
  facility,
  orderNo,
  endDate,
  isInspector,
  isMain,
  inspectorLabel,
  mainLabel,
  untilLabel,
}) {
  const initials =
    name && name !== '-'
      ? name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '?';
  const colors = ['#3b82f6', '#10B981', '#8b5cf6', '#f59e0b', '#ec4899'];
  const color = colors[name.charCodeAt(0) % colors.length] ?? '#3b82f6';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(197,198,207,0.18)] dark:border-slate-700/30 bg-[rgba(255,255,255,0.6)] dark:bg-slate-700/20">
      {/* avatar */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-white text-[13px] font-bold"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 leading-tight truncate">
          {name}
        </span>
        <span className="text-[11px] text-[#7B8499] truncate">{facility}</span>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex gap-1">
          {isInspector && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              {inspectorLabel}
            </span>
          )}
          {isMain && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              {mainLabel}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#94a3b8]">#{orderNo}</span>
      </div>
    </div>
  );
}

/* ── Empty ───────────────────────────────────────────────── */
const Empty = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#94a3b8]">
    <Activity size={24} strokeWidth={1.5} />
    <p className="text-[13px]">{text}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { data: session } = useSession();
  const t = useTranslations('dashboard');
  const ts = useTranslations('stats');
  const { employees, setEmployees } = useEmployeeStore();

  const { data: dashRes, isLoading } = useGetQuery({
    key: KEYS.dashboard,
    url: `/${URLS.dashboard}/`,
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    params: { expires_in_days: 60 },
    enabled: !!session?.accessToken,
  });
  const dash = dashRes?.data;

  const { data: employeesData } = useGetQuery({
    key: KEYS.employees,
    url: URLS.employee,
    params: { limit: 10000 },
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
    redirectOn403: false,
  });

  useEffect(() => {
    const data = employeesData?.data?.data;
    if (data?.length) setEmployees(data);
  }, [employeesData]);

  const getEmployeeName = (employee_id) => {
    const emp = employees?.find((f) => f.id === employee_id);
    if (!emp) return '-';
    return `${emp.last_name} ${emp.first_name}`;
  };

  const passRate = useMemo(() => {
    if (!dash || !dash.tests.total_logged) return 0;
    return Math.round((dash.tests.passed_on_time / dash.tests.total_logged) * 100);
  }, [dash]);

  const pieData = useMemo(() => {
    if (!dash) return [];
    return [
      { name: ts('pieActive'), value: dash.devices.active, fill: '#10B981' },
      { name: ts('pieInactive'), value: dash.devices.inactive, fill: '#94a3b8' },
      { name: ts('pieNeverTested'), value: dash.devices.never_tested, fill: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [dash, ts]);

  const pieConfig = { value: { label: ts('pieLabelTotal') } };

  /* ── Today date badge ── */
  const today = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[#031634] dark:text-slate-100 text-[28px] font-black leading-tight tracking-[-0.5px]">
            {t('title')}
          </h2>
          <p className="text-[#44474E] dark:text-slate-400 text-[14px] mt-0.5">{t('subtitle')}</p>
        </div>
        <span className="shrink-0 mt-1 inline-flex items-center gap-1.5 rounded-full border border-[rgba(197,198,207,0.40)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-3 py-1 text-[12px] font-medium text-[#7B8499] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {today}
        </span>
      </div>

      {/* ─── KPI row ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={Monitor}
          color="#3b82f6"
          bg="linear-gradient(135deg,#eff6ff 0%)"
          label={t('devicesCard')}
          value={dash?.devices.total}
          isLoading={isLoading}
          sub={`${dash?.devices.active ?? 0} ${t('devicesActive')} · ${dash?.devices.inactive ?? 0} ${t('devicesInactive')}`}
        />
        <KpiCard
          icon={CheckCircle2}
          color="#10B981"
          bg="linear-gradient(135deg,#f0fdf4 0%)"
          label={t('testsPassed')}
          value={dash?.tests.passed_on_time}
          isLoading={isLoading}
          sub={`${passRate}% · ${dash?.tests.total_logged ?? 0} ${t('testsTotal')}`}
        />
        <KpiCard
          icon={Clock}
          color="#f59e0b"
          bg="linear-gradient(135deg,#fffbeb 0%)"
          label={t('expiringCard')}
          value={dash?.expiring_soon.count}
          isLoading={isLoading}
          sub={t('sectionExpiring')}
        />
        <KpiCard
          icon={ShieldAlert}
          color="#ef4444"
          bg="linear-gradient(135deg,#fef2f2 0%)"
          label={t('overdueCard')}
          value={dash?.overdue.count}
          isLoading={isLoading}
          sub={t('sectionOverdue')}
          alert={(dash?.overdue.count ?? 0) > 0}
        />
      </div>

      {/* ─── Charts 2-col ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Donut — device status */}

        <div className="flex flex-col gap-3">
          <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-0">
            <CardHeader className="pb-0 mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[15px] font-semibold">{ts('pieTitle')}</CardTitle>
                  <CardDescription className="text-[12px] mt-0.5">
                    {t('devicesCard')}: {dash?.devices.total ?? 0}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 pb-5 pt-2">
              {/* chart */}
              <ChartContainer config={pieConfig} className="aspect-square h-57.5 shrink-0">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData.length ? pieData : [{ name: '—', value: 1, fill: '#e2e8f0' }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    strokeWidth={6}
                  >
                    {(pieData.length ? pieData : [{ fill: '#e2e8f0' }]).map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !('cx' in viewBox)) return null;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-[32px] font-black"
                            >
                              {dash?.devices.total ?? 0}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-[11px]"
                            >
                              {ts('pieLabelTotal')}
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* legend with bars */}
              <div className="flex flex-col gap-4 flex-1 w-full">
                {pieData.map((d) => (
                  <Bar
                    key={d.name}
                    label={d.name}
                    value={d.value}
                    max={dash?.devices.total || 1}
                    color={d.fill}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-0">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366f115] shrink-0">
                  <Building2 size={17} className="text-[#6366f1]" />
                </div>
                <div>
                  <CardTitle className="text-[15px] font-semibold">{t('facilitiesCard')}</CardTitle>
                  <CardDescription className="text-[12px]">
                    {t('rootObjects')} + {t('subdivisions')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-end gap-6 pb-5">
              <span className="text-[46px] font-black leading-none text-[#031634] dark:text-slate-100 shrink-0">
                {isLoading ? (
                  <Skel h="h-12" w="w-12" />
                ) : (
                  <CountUp start={0} end={dash?.facilities.total ?? 0} duration={1.4} />
                )}
              </span>
              <div className="flex flex-col gap-3 flex-1 pb-1">
                <Bar
                  label={t('rootObjects')}
                  value={dash?.facilities.root_objects ?? 0}
                  max={dash?.facilities.total || 1}
                  color="#6366f1"
                />
                <Bar
                  label={t('subdivisions')}
                  value={dash?.facilities.subdivisions ?? 0}
                  max={dash?.facilities.total || 1}
                  color="#8b5cf6"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gauge + test bars */}
        <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-[15px] font-semibold">{ts('barTitle')}</CardTitle>
            <CardDescription className="text-[12px] mt-0.5">
              {dash?.tests.total_logged ?? 0} {t('testsTotal')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-2 pb-5">
            <RadialGauge pct={passRate} label={ts('passRate')} />
            <div className="w-full flex flex-col gap-3 px-1">
              <Bar
                label={ts('barPassed')}
                value={dash?.tests.passed_on_time ?? 0}
                max={dash?.tests.total_logged || 1}
                color="#10B981"
              />
              <Bar
                label={ts('barFailed')}
                value={dash?.tests.overdue_or_failed ?? 0}
                max={dash?.tests.total_logged || 1}
                color="#ef4444"
              />
              <Bar
                label={ts('barNever')}
                value={dash?.devices.never_tested ?? 0}
                max={dash?.devices.total || 1}
                color="#f59e0b"
              />
            </div>
          </CardContent>
        </Card>

        {/*  Persons mini row ─── */}

        {/* Persons mini */}
        <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ec489912] shrink-0">
                <Users size={17} className="text-[#ec4899]" />
              </div>
              <div>
                <CardTitle className="text-[15px] font-semibold">{t('personsTitle')}</CardTitle>
                <CardDescription className="text-[12px]">
                  {dash?.responsible_persons.count ?? 0} {t('personsTitle').toLowerCase()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 pb-4">
            {dash?.responsible_persons.items.map((p) => (
              <PersonCard
                key={p.id}
                name={getEmployeeName(p.employee_id)}
                facility={p.facility_name}
                orderNo={p.appointment_order_number}
                endDate={p.end_date}
                isInspector={p.is_inspector}
                isMain={p.is_main}
                inspectorLabel={t('inspector')}
                mainLabel={t('main')}
                untilLabel={t('until')}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ─── Alerts ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Expiring soon */}
        <Card className="rounded-2xl dark:bg-slate-800  border-l-amber-400 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
                  <Clock size={14} className="text-amber-500" />
                </div>
                <CardTitle className="text-[14px] font-semibold">{t('sectionExpiring')}</CardTitle>
              </div>
              {(dash?.expiring_soon.count ?? 0) > 0 && (
                <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  {dash.expiring_soon.count}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-3">
            {!dash?.expiring_soon?.devices?.length ? (
              <Empty text={t('noExpiring')} />
            ) : (
              dash.expiring_soon.devices.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/devices/${d.id}`}
                  className="block rounded-lg -mx-2 px-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <DeviceRow
                    device={d}
                    badge={`${d.days_left} ${t('daysLeft')}`}
                    badgeColor={d.days_left <= 15 ? '#f97316' : '#f59e0b'}
                  />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="rounded-2xl dark:bg-slate-800  border-l-red-500 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40">
                  <ShieldAlert size={14} className="text-red-500" />
                </div>
                <CardTitle className="text-[14px] font-semibold">{t('sectionOverdue')}</CardTitle>
              </div>
              {(dash?.overdue.count ?? 0) > 0 && (
                <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  {dash.overdue.count}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-3">
            {!dash?.overdue?.devices?.length ? (
              <Empty text={t('noOverdue')} />
            ) : (
              dash.overdue.devices.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/devices/${d.id}`}
                  className="block rounded-lg -mx-2 px-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <DeviceRow
                    device={d}
                    pulse
                    badge={`${d.days_overdue} ${t('daysOverdue')}`}
                    badgeColor="#ef4444"
                  />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* ─── Map full-width ─── */}
        <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-blue-500" />
              <CardTitle className="text-[15px] font-semibold">{t('locationsTitle')}</CardTitle>
              {dash && (
                <span className="text-[12px] font-semibold text-[#7B8499] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">
                  {dash.locations.count}
                </span>
              )}
            </div>
          </CardHeader>
          <div className="h-80 px-4 pb-4">
            {dash?.locations?.count > 0 ? (
              <LeafletMap locations={dash.locations.items} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[rgba(197,198,207,0.40)] dark:border-slate-700/40 text-[13px] text-[#94a3b8]">
                {t('noLocations')}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
