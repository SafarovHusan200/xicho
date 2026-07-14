'use client';

import React, { useEffect } from 'react';
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
  ClipboardList,
  Loader2,
  Edit,
  Phone,
  ShieldCheck,
  ExternalLink,
  Eye,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  FolderOpen,
  FlaskConical,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import { request } from '@/services/api';
import toast from 'react-hot-toast';
import TestLogCards from '@/components/devices/TestLogCards';
import { TestResultBadge } from '@/components/devices/testLogStatus';

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
  ok: { color: '#10B981', bg: '#10B98118', icon: CheckCircle2 },
  expiring_soon: { color: '#f59e0b', bg: '#f59e0b18', icon: Clock },
  overdue: { color: '#ef4444', bg: '#ef444418', icon: XCircle },
  never_tested: { color: '#94a3b8', bg: '#94a3b818', icon: HelpCircle },
};

const fmt = (iso, locale) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

/* ── MIME helpers ────────────────────────────────────────────── */
const getMimeColor = (mime) => {
  if (!mime) return '#94a3b8';
  const m = mime.toLowerCase();
  if (m === 'application/pdf') return '#ef4444';
  if (m.startsWith('image/')) return '#3b82f6';
  if (m.includes('word')) return '#2563eb';
  if (m.includes('sheet') || m.includes('excel')) return '#16a34a';
  if (m === 'text/plain') return '#6b7280';
  return '#94a3b8';
};

const getMimeIcon = (mime) => {
  if (!mime) return File;
  const m = mime.toLowerCase();
  if (m.startsWith('image/')) return FileImage;
  if (m.includes('sheet') || m.includes('excel')) return FileSpreadsheet;
  return FileText;
};

const getMimeLabel = (mime) => {
  if (!mime) return '—';
  const m = mime.toLowerCase();
  if (m === 'application/pdf') return 'PDF';
  if (m.startsWith('image/')) return m.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
  if (m.includes('wordprocessingml') || m.includes('msword')) return 'DOCX';
  if (m.includes('spreadsheetml') || m.includes('excel')) return 'XLSX';
  if (m === 'text/plain') return 'TXT';
  return (mime.split('/')[1] ?? '').toUpperCase().slice(0, 6) || '—';
};

const fmtSize = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── DocCard ─────────────────────────────────────────────────── */
function DocCard({ doc, onView, loadingId, t }) {
  const MimeIcon = getMimeIcon(doc.file_type);
  const color = getMimeColor(doc.file_type);
  const label = getMimeLabel(doc.file_type);
  const isLoading = loadingId === doc.id;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(197,198,207,0.25)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <MimeIcon size={18} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate leading-tight">
          {doc.file_name ?? '—'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold tracking-wide" style={{ color }}>
            {label}
          </span>
          <span className="text-[10px] text-[#7B8499] dark:text-slate-500 font-mono">
            {fmtSize(doc.file_size)}
          </span>
        </div>
      </div>
      <button
        onClick={() => onView(doc)}
        disabled={isLoading}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-600 transition-all disabled:opacity-50"
        title={t('viewTitle')}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={15} />}
      </button>
    </div>
  );
}

/* ── InfoRow ─────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, iconColor = '#7B8499' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${iconColor}15` }}
      >
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
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100">
          {title}
        </span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

/* ── PersonCard ──────────────────────────────────────────────── */
function PersonCard({ person, index, t, locale, getEmployeeName }) {
  const badges = [
    person.is_main && { label: t('personMain'), color: '#8b5cf6' },
    person.is_inspector && { label: t('personInspector'), color: '#3b82f6' },
    person.is_active && { label: t('personActive'), color: '#10B981' },
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-semibold text-[13px]">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-[#031634] dark:text-slate-100 mb-1.5">
          {getEmployeeName(person.employee_id)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
              style={{
                backgroundColor: `${b.color}18`,
                color: b.color,
                borderColor: `${b.color}30`,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">
          {t('orderNumber')}:{' '}
          <span className="font-mono font-medium text-foreground">
            {person.appointment_order_number}
          </span>
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
  const tt = useTranslations('testLogs');
  const locale = useLocale();
  const { employees, setEmployees } = useEmployeeStore();
  const [docPreview, setDocPreview] = React.useState(null);
  const [loadingDocId, setLoadingDocId] = React.useState(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const handleDocView = async (doc) => {
    setLoadingDocId(doc.id);
    try {
      const res = await request.post(`/${URLS.documents}/${doc.id}`, null, {
        headers: authHeader,
      });
      const presignedUrl = typeof res.data === 'string' ? res.data : (res.data?.url ?? res.data);
      if (!presignedUrl) throw new Error('no url');

      const isPdf = doc.file_type === 'application/pdf';
      let displayUrl = presignedUrl;
      if (isPdf) {
        const fetchRes = await fetch(presignedUrl);
        if (!fetchRes.ok) throw new Error('fetch failed');
        const blob = await fetchRes.blob();
        displayUrl = URL.createObjectURL(blob);
      }
      setDocPreview({
        url: displayUrl,
        file_type: doc.file_type,
        file_name: doc.file_name,
        isBlobUrl: isPdf,
        presignedUrl,
      });
    } catch {
      toast.error(t('fileOpenError'));
    } finally {
      setLoadingDocId(null);
    }
  };

  const closeDocPreview = () => {
    if (docPreview?.isBlobUrl) URL.revokeObjectURL(docPreview.url);
    setDocPreview(null);
  };

  const { isLoading, data } = useGetQuery({
    key: [KEYS.device, id],
    url: `${URLS.device}/${id}`,
    params: { expires_in_days: 15 },
    headers: { Authorization: `Bearer ${session?.accessToken}`, Accept: 'application/json' },
    enabled: !!session?.accessToken && !!id,
  });

  const { isLoading: loading, data: testsData } = useGetQuery({
    key: [KEYS.testLogs, id],
    url: `${URLS.testLogs}`,
    params: { device_id: id },
    headers: { Authorization: `Bearer ${session?.accessToken}`, Accept: 'application/json' },
    enabled: !!session?.accessToken && !!id,
  });

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    error: personsError,
  } = useGetQuery({
    key: KEYS.employees,
    url: URLS.employee,
    params: { limit: 10000 },
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
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
    ok: t('statusOk'),
    expiring_soon: t('statusExpiring'),
    overdue: t('statusOverdue'),
    never_tested: t('statusNever'),
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
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100">
                {device.name}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border"
                style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}40` }}
              >
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
          className="gap-2 rounded-xl px-4 h-10 text-[13px] text-white font-semibold self-start bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Edit size={15} /> {t('edit')}
        </Button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t('totalTests'),
            value: device.all_tests_count ?? 0,
            color: '#3b82f6',
            icon: ClipboardList,
          },
          {
            label: t('nextTest'),
            value: fmt(device.next_test_date, locale),
            color: '#8b5cf6',
            icon: Calendar,
          },
          {
            label: t('daysLeft'),
            value:
              device.days_until_next_test != null
                ? `${device.days_until_next_test} ${t('daysUnit')}`
                : '—',
            color: '#f59e0b',
            icon: Clock,
          },
          { label: t('statusLabel'), value: statusLabel, color: st.color, icon: StatusIcon },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8499]">
                {label}
              </span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}18` }}
              >
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
          <InfoRow
            icon={Hash}
            label={t('serial')}
            value={device.serial_number}
            iconColor="#3b82f6"
          />
          <InfoRow
            icon={Hash}
            label={t('eco')}
            value={device.ecosystem_reg_number}
            iconColor="#3b82f6"
          />
          <InfoRow
            icon={Phone}
            label={t('manufacturer')}
            value={device.manufacturer_details}
            iconColor="#8b5cf6"
          />
          <InfoRow
            icon={Calendar}
            label={t('commissioning')}
            value={fmt(device.commissioning_date, locale)}
            iconColor="#f59e0b"
          />
          <InfoRow
            icon={Calendar}
            label={t('createdAt')}
            value={fmt(device.created_at, locale)}
            iconColor="#94a3b8"
          />
          <InfoRow
            icon={Calendar}
            label={t('updatedAt')}
            value={fmt(device.updated_at, locale)}
            iconColor="#94a3b8"
          />
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
            <InfoRow
              icon={Building2}
              label={t('facilityName')}
              value={device.facility?.name}
              iconColor="#8b5cf6"
            />
            <InfoRow
              icon={Hash}
              label={t('unitCode')}
              value={device.facility?.unit_code}
              iconColor="#8b5cf6"
            />
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
                  <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100">
                    {t('sectionLocation')}
                  </span>
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

              <div className="h-52 relative z-0">
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

        {/* ── All test logs ────────────────────────────────────── */}
        <Section
          title={`${t('sectionAllTests')}${testsData?.data?.count ? ` (${testsData.data.count})` : ''}`}
          icon={FlaskConical}
          iconColor="#3b82f6"
        >
          <TestLogCards logs={testsData?.data?.data} locale={locale} t={tt} isLoading={loading} />
        </Section>

        {/* ── Last test ──────────────────────────────────────── */}
        {device.last_test && (
          <Section title={t('sectionLastTest')} icon={FlaskConical} iconColor="#f97316">
            <InfoRow
              icon={FlaskConical}
              label={t('lastTestType')}
              value={device.last_test.test_type}
              iconColor="#f97316"
            />
            <InfoRow
              icon={Hash}
              label={t('lastTestProtocol')}
              value={device.last_test.test_protocol_number}
              iconColor="#f97316"
            />
            <InfoRow
              icon={Calendar}
              label={t('lastTestDate')}
              value={fmt(device.last_test.test_date, locale)}
              iconColor="#f97316"
            />
            <InfoRow
              icon={Calendar}
              label={t('lastTestNextDate')}
              value={fmt(device.last_test.next_test_date, locale)}
              iconColor="#f97316"
            />
            {device.last_test.is_passed != null && (
              <InfoRow
                icon={device.last_test.is_passed ? CheckCircle2 : XCircle}
                label={t('lastTestResult')}
                value={<TestResultBadge isPassed={device.last_test.is_passed} t={tt} />}
                iconColor={device.last_test.is_passed ? '#10B981' : '#ef4444'}
              />
            )}
            {device.last_test.description && (
              <InfoRow
                icon={FileText}
                label={t('lastTestDescription')}
                value={device.last_test.description}
                iconColor="#f97316"
              />
            )}
            {device.last_test.documents?.length > 0 && (
              <div className="grid grid-cols-1 gap-2 py-3">
                {device.last_test.documents.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    onView={handleDocView}
                    loadingId={loadingDocId}
                    t={t}
                  />
                ))}
              </div>
            )}
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
              <PersonCard
                key={p.id}
                person={p}
                index={i}
                t={t}
                locale={locale}
                getEmployeeName={getEmployeeName}
              />
            ))
          )}
        </Section>

        {/* ── Passport specs ─────────────────────────────────── */}
        {specEntries.length > 0 && (
          <Section title={t('sectionPassport')} icon={ClipboardList} iconColor="#6366f1">
            <div className="grid grid-cols-1  gap-0  divide-slate-100 dark:divide-slate-700/40 sm:divide-y-0">
              {specEntries.map(([key, val], i) => (
                <div key={key} className={`flex flex-col gap-0.5 px-0 py-3 sm:px-4 `}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8499] dark:text-slate-500">
                    {key}
                  </span>
                  <span className="text-[13px] font-medium text-[#031634] dark:text-slate-100 break-all">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Documents ──────────────────────────────────────── */}
        {device.documents?.length > 0 && (
          <Section
            title={`${t('sectionDocuments')} (${device.documents.length})`}
            icon={FolderOpen}
            iconColor="#0ea5e9"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 py-3">
              {device.documents.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onView={handleDocView}
                  loadingId={loadingDocId}
                  t={t}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Doc preview modal ──────────────────────────────── */}
        {docPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeDocPreview}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* modal header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-[#FAFBFC] dark:bg-slate-800/80 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {React.createElement(getMimeIcon(docPreview.file_type), {
                    size: 16,
                    style: { color: getMimeColor(docPreview.file_type), flexShrink: 0 },
                  })}
                  <span className="text-[14px] font-semibold text-[#031634] dark:text-slate-100 truncate">
                    {docPreview.file_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <a
                    href={docPreview.presignedUrl ?? docPreview.url}
                    download={docPreview.file_name}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 hover:bg-emerald-100 transition-all"
                    title={t('downloadTitle')}
                  >
                    <Download size={15} />
                  </a>
                  <button
                    onClick={closeDocPreview}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* modal body */}
              <div className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-slate-900/50 min-h-0">
                {docPreview.file_type?.startsWith('image/') ? (
                  <div className="flex items-center justify-center p-4 min-h-100">
                    <img
                      src={docPreview.url}
                      alt={docPreview.file_name}
                      className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md"
                    />
                  </div>
                ) : docPreview.file_type === 'application/pdf' ? (
                  <iframe
                    src={docPreview.url}
                    title={docPreview.file_name}
                    className="w-full h-[75vh] border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <FileText size={44} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-[14px] text-[#7B8499] dark:text-slate-400">
                      {t('previewUnsupported')}
                    </p>
                    <a
                      href={docPreview.presignedUrl ?? docPreview.url}
                      download={docPreview.file_name}
                      className="flex items-center gap-2 rounded-xl px-4 h-9 text-[13px] font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
                    >
                      <Download size={14} />
                      {t('downloadTitle')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
