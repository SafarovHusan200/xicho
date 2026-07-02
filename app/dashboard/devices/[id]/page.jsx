'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  MonitorSpeaker,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  MapPin,
  Building2,
  User,
  Calendar,
  Hash,
  Cpu,
  ClipboardList,
  Loader2,
  Edit,
  Phone,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
      <Loader2 size={18} className="animate-spin text-emerald-500" />
    </div>
  ),
});

/* ── Status config (icons only; labels come from t()) ───────── */
const STATUS_ICONS = {
  ok:            { color: '#10B981', bg: '#10B98118', icon: CheckCircle2 },
  expiring_soon: { color: '#f59e0b', bg: '#f59e0b18', icon: Clock },
  overdue:       { color: '#ef4444', bg: '#ef444418', icon: XCircle },
  never_tested:  { color: '#94a3b8', bg: '#94a3b818', icon: HelpCircle },
};

const fmt = (iso, locale) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

/* ── InfoRow ─────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, iconColor = '#7B8499' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${iconColor}15` }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-500">
          {label}
        </p>
        <p className="text-[14px] font-medium text-[#031634] dark:text-slate-100 mt-0.5 wrap-break-word">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
function Section({ title, icon: Icon, iconColor = '#3b82f6', children }) {
  return (
    <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}18` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100">{title}</span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

/* ── PersonCard ──────────────────────────────────────────────── */
function PersonCard({ person, index, t, locale }) {
  const badges = [
    person.is_main      && { label: t('personMain'),       color: '#8b5cf6' },
    person.is_inspector && { label: t('personInspector'),  color: '#3b82f6' },
    person.is_active    && { label: t('personActive'),      color: '#10B981' },
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-semibold text-[13px]">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {badges.map((b) => (
            <span key={b.label}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
              style={{ backgroundColor: `${b.color}18`, color: b.color, borderColor: `${b.color}30` }}>
              {b.label}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">
          {t('orderNumber')}:{' '}
          <span className="font-mono font-medium text-foreground">{person.appointment_order_number}</span>
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {fmt(person.appointment_date, locale)} → {fmt(person.end_date, locale)}
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DeviceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('deviceDetail');
  const locale = useLocale();

  const { isLoading, data } = useGetQuery({
    key: [KEYS.device, id],
    url: `${URLS.device}/${id}`,
    params: { expires_in_days: 15 },
    headers: { Authorization: `Bearer ${session?.accessToken}`, Accept: 'application/json' },
    enabled: !!session?.accessToken && !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-[#7B8499]">
        <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  const device = data?.data;
  if (!device) return null;

  const statusKey = device.test_status in STATUS_ICONS ? device.test_status : 'never_tested';
  const st = STATUS_ICONS[statusKey];
  const StatusIcon = st.icon;

  const statusLabelMap = {
    ok:            t('statusOk'),
    expiring_soon: t('statusExpiring'),
    overdue:       t('statusOverdue'),
    never_tested:  t('statusNever'),
  };
  const statusLabel = statusLabelMap[statusKey];

  const specEntries = device.passport_specifications
    ? Object.entries(device.passport_specifications)
    : [];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm mt-0.5">
            <ArrowLeft size={18} className="text-[#7B8499]" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100">{device.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border"
                style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}40` }}>
                <StatusIcon size={12} />
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">
              {device.device_type?.name ?? '—'} · {device.facility?.name ?? '—'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/dashboard/devices?edit=${id}`)}
          className="gap-2 rounded-xl px-4 h-10 text-sm text-white font-semibold self-start"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          <Edit size={15} /> {t('edit')}
        </Button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('totalTests'), value: device.all_tests_count ?? 0,               color: '#3b82f6', icon: ClipboardList },
          { label: t('nextTest'),   value: fmt(device.next_test_date, locale),          color: '#8b5cf6', icon: Calendar },
          {
            label: t('daysLeft'),
            value: device.days_until_next_test != null
              ? `${device.days_until_next_test} ${t('daysUnit')}`
              : '—',
            color: '#f59e0b',
            icon: Clock,
          },
          { label: t('statusLabel'), value: statusLabel, color: st.color, icon: StatusIcon },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label}
            className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8499]">{label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-[15px] font-bold text-[#031634] dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic info */}
        <Section title={t('sectionBasic')} icon={MonitorSpeaker} iconColor="#3b82f6">
          <InfoRow icon={Hash}        label={t('serial')}        value={device.serial_number}           iconColor="#3b82f6" />
          <InfoRow icon={Hash}        label={t('eco')}           value={device.ecosystem_reg_number}    iconColor="#3b82f6" />
          <InfoRow icon={Phone}       label={t('manufacturer')}  value={device.manufacturer_details}    iconColor="#8b5cf6" />
          <InfoRow icon={Calendar}    label={t('commissioning')} value={fmt(device.commissioning_date, locale)} iconColor="#f59e0b" />
          <InfoRow icon={Calendar}    label={t('createdAt')}     value={fmt(device.created_at, locale)} iconColor="#94a3b8" />
          <InfoRow icon={Calendar}    label={t('updatedAt')}     value={fmt(device.updated_at, locale)} iconColor="#94a3b8" />
          <InfoRow
            icon={CheckCircle2}
            label={t('activeStatus')}
            value={device.is_active ? t('active') : t('inactive')}
            iconColor={device.is_active ? '#10B981' : '#94a3b8'}
          />
        </Section>

        {/* Facility + Location */}
        <div className="flex flex-col gap-6">
          <Section title={t('sectionFacility')} icon={Building2} iconColor="#8b5cf6">
            <InfoRow icon={Building2}  label={t('facilityName')} value={device.facility?.name}      iconColor="#8b5cf6" />
            <InfoRow icon={Hash}       label={t('unitCode')}     value={device.facility?.unit_code} iconColor="#8b5cf6" />
            <InfoRow
              icon={ShieldCheck}
              label={t('facilityType')}
              value={device.facility?.is_facilities ? t('facilityMain') : t('facilityBranch')}
              iconColor="#8b5cf6"
            />
          </Section>

          {device.location && (
            <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                    <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100">{t('sectionLocation')}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${device.location.latitude},${device.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold border transition-opacity hover:opacity-75 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                >
                  <ExternalLink size={11} />
                  Google Maps
                </a>
              </div>

              <div className="h-52">
                <LeafletMap
                  lat={device.location.latitude}
                  lng={device.location.longitude}
                  label={device.location.address_line}
                />
              </div>

              <div className="flex items-center gap-3 px-5 py-3 border-t border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
                <MapPin size={12} className="shrink-0 text-emerald-500" />
                <span className="text-[12px] font-medium text-[#031634] dark:text-slate-200 flex-1 truncate">
                  {device.location.address_line || '—'}
                </span>
                <span className="font-mono text-[10px] text-[#7B8499] dark:text-slate-500 shrink-0">
                  {device.location.latitude?.toFixed(5)}, {device.location.longitude?.toFixed(5)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Device type ────────────────────────────────────── */}
      <Section title={t('sectionDeviceType')} icon={Cpu} iconColor="#f59e0b">
        <InfoRow icon={Cpu} label={t('typeName')} value={device.device_type?.name} iconColor="#f59e0b" />
      </Section>

      {/* ── Passport specs ─────────────────────────────────── */}
      {specEntries.length > 0 && (
        <Section title={t('sectionPassport')} icon={ClipboardList} iconColor="#6366f1">
          {specEntries.map(([key, val]) => (
            <InfoRow key={key} icon={ClipboardList} label={key}
              value={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
              iconColor="#6366f1" />
          ))}
        </Section>
      )}

      {/* ── Responsible persons ────────────────────────────── */}
      <Section
        title={`${t('sectionPersons')} (${device.responsible_persons?.length ?? 0})`}
        icon={User}
        iconColor="#3b82f6"
      >
        {!device.responsible_persons?.length ? (
          <div className="py-8 text-center">
            <User size={32} className="mx-auto text-slate-200 dark:text-slate-600 mb-2" />
            <p className="text-sm text-muted-foreground">{t('noPersons')}</p>
          </div>
        ) : (
          device.responsible_persons.map((p, i) => (
            <PersonCard key={p.id} person={p} index={i} t={t} locale={locale} />
          ))
        )}
      </Section>

    </div>
  );
}
