'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  Monitor,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MapPin,
  Users,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { Cell, Pie, PieChart, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import Link from 'next/link';
import KpiCard from '@/components/dashboard/KpiCard';
import Bar from '@/components/dashboard/Bar';
import DeviceRow from '@/components/dashboard/DeviceRow';
import PersonCard from '@/components/dashboard/PersonCard';
import Empty from '@/components/dashboard/Empty';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

/* ═══════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { data: session } = useSession();
  const t = useTranslations('dashboard');
  const ts = useTranslations('stats');
  const locale = useLocale();
  const { employees, setEmployees } = useEmployeeStore();
  const [expiresInDays, setExpiresInDays] = useState(60);

  const { data: dashRes, isLoading } = useGetQuery({
    key: KEYS.dashboard,
    url: `/${URLS.dashboard}/`,
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    params: { expires_in_days: expiresInDays },
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
    // redirectOn403: false,
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

  const facilitiesData = useMemo(() => {
    if (!dash) return [];
    return [
      { name: t('rootObjects'), value: dash.facilities.root_objects, fill: '#6366f1' },
      { name: t('subdivisions'), value: dash.facilities.subdivisions, fill: '#06b6d4' },
    ].filter((d) => d.value > 0);
  }, [dash, t]);

  const facilitiesConfig = { value: { label: t('facilitiesCard') } };

  const testsData = useMemo(() => {
    if (!dash) return [];
    return [
      { name: ts('barPassed'), value: dash.tests.passed_on_time, fill: '#10B981' },
      { name: ts('barFailed'), value: dash.tests.overdue_or_failed, fill: '#ef4444' },
      { name: ts('barNever'), value: dash.devices.never_tested, fill: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [dash, ts]);

  const testsConfig = { value: { label: ts('barTitle') } };

  /* ── Today date badge ── */
  const today = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
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
        <div className="flex gap-3 items-center ">
          <Link
            href={'/dashboard/calendar'}
            className="shrink-0 mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 dark:bg-[#3b82f6]/15 px-3 py-1 text-[12px] font-semibold text-[#3b82f6] transition-colors hover:bg-[#3b82f6]/20"
          >
            <CalendarDays size={13} />
            {t('calendarLink')}
          </Link>
          <span className="shrink-0 mt-1 inline-flex items-center gap-1.5 rounded-full border border-[rgba(197,198,207,0.40)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-3 py-1 text-[12px] font-medium text-[#7B8499] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {today}
          </span>
        </div>
      </div>

      {/* ─── KPI  1-row ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          icon={Monitor}
          color="#3b82f6"
          bg="bg-blue-50 dark:bg-blue-500/10"
          label={t('devicesCard')}
          value={dash?.devices.total}
          isLoading={isLoading}
          sub={`${dash?.devices.active ?? 0} ${t('devicesActive')} · ${dash?.devices.inactive ?? 0} ${t('devicesInactive')}`}
        />
        <KpiCard
          icon={CheckCircle2}
          color="#10B981"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
          label={t('testsPassed')}
          value={dash?.tests.passed_on_time}
          isLoading={isLoading}
          sub={`${passRate}% · ${dash?.tests.total_logged ?? 0} ${t('testsTotal')}`}
        />
        <KpiCard
          icon={Clock}
          color="#f59e0b"
          bg="bg-amber-50 dark:bg-amber-500/10"
          label={t('expiringCard')}
          value={dash?.expiring_soon.count}
          isLoading={isLoading}
          sub={t('sectionExpiring')}
        />
        <KpiCard
          icon={ShieldAlert}
          color="#ef4444"
          bg="bg-red-50 dark:bg-red-500/25"
          label={t('overdueCard')}
          value={dash?.overdue.count}
          isLoading={isLoading}
          sub={t('sectionOverdue')}
          alert={(dash?.overdue.count ?? 0) > 0}
        />
      </div>

      {/* ─── Charts 2-row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-5">
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
          <CardContent className="flex flex-col items-center gap-1 pb-5 pt-2">
            <ChartContainer config={facilitiesConfig} className="aspect-square h-57.5 shrink-0">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={
                    facilitiesData.length
                      ? facilitiesData
                      : [{ name: '—', value: 1, fill: '#e2e8f0' }]
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  cornerRadius={5}
                  paddingAngle={1}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {(facilitiesData.length ? facilitiesData : [{ fill: '#e2e8f0' }]).map((e, i) => (
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
                            {dash?.facilities.total ?? 0}
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
            <div className="flex flex-col gap-4 flex-1 w-full">
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
                color="#06b6d4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Donut — device status */}
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
          <CardContent className="flex  flex-col  items-center gap-1 pb-5 pt-2">
            {/* chart */}
            <ChartContainer config={pieConfig} className="aspect-square h-57.5 shrink-0">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData.length ? pieData : [{ name: '—', value: 1, fill: '#e2e8f0' }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  cornerRadius={5}
                  paddingAngle={1}
                  stroke="var(--surface)"
                  strokeWidth={2}
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

        {/* Gauge + test bars */}
        <Card className="rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-[15px] font-semibold">{ts('barTitle')}</CardTitle>
            <CardDescription className="text-[12px] mt-0.5">
              {dash?.tests.total_logged ?? 0} {t('testsTotal')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-1 pt-2 pb-3">
            <ChartContainer config={testsConfig} className="aspect-square h-60 shrink-0 p-0">
              <PieChart className="">
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={testsData.length ? testsData : [{ name: '—', value: 1, fill: '#e2e8f0' }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={67}
                  cornerRadius={5}
                  paddingAngle={1}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {(testsData.length ? testsData : [{ fill: '#e2e8f0' }]).map((e, i) => (
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
                            y={(viewBox.cy || 0) - 5}
                            className="fill-foreground text-[32px] font-black"
                          >
                            {passRate}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-[11px]"
                          >
                            {ts('passRate')}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="w-full flex flex-col gap-4 px-1">
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
          <CardContent className="flex flex-col gap-2.5 pb-4 ">
            {dash?.responsible_persons.items.map((p, i) => (
              <Link href={`/dashboard/users/${p.id}`} key={`${p.id}-${i}`}>
                <PersonCard
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
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Expiring soon */}
        <Card className="rounded-2xl dark:bg-slate-800  border-l-amber-400 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-1">
          <CardHeader className="pb-3! border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
                  <Clock size={14} className="text-amber-500" />
                </div>
                <CardTitle className="text-[14px] font-semibold">{t('sectionExpiring')}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(expiresInDays)}
                  onValueChange={(v) => setExpiresInDays(Number(v))}
                >
                  <SelectTrigger
                    className="h-7 w-auto gap-1 rounded-full border-none bg-amber-100/70 dark:bg-amber-950/40 px-2.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 shadow-none"
                    title={t('expiresInDaysLabel')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {[1, 7, 15, 30, 60, 90, 180, 360].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {t('daysUnit')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(dash?.expiring_soon.count ?? 0) > 0 && (
                  <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    {dash.expiring_soon.count}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            {!dash?.expiring_soon?.devices?.length ? (
              <Empty text={t('noExpiring')} />
            ) : (
              dash.expiring_soon.devices.map((d, i) => (
                <Link
                  key={`${d.id}-${i}`}
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
        <Card className="rounded-2xl dark:bg-slate-800  border-l-red-500 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm gap-1">
          <CardHeader className="pb-3! border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20">
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
              dash.overdue.devices.map((d, i) => (
                <Link
                  key={`${d.id}-${i}`}
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
        <Card className=" xl:col-span-2 rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm overflow-hidden gap-3">
          <CardHeader className="pb-0!">
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
          <div className="min-h-65 h-full px-4 ">
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
