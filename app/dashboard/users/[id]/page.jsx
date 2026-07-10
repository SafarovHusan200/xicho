'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  Edit,
  User,
  Building2,
  ClipboardList,
  FolderOpen,
  Hash,
  Briefcase,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Loader2,
  Eye,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import { request } from '@/services/api';
import toast from 'react-hot-toast';

/* ── status config (icons only; labels come from t()) ──────────── */
const STATUS_CFG = {
  active: { color: '#10B981', bg: '#10B98118', icon: CheckCircle2, labelKey: 'statusActive' },
  expiringSoon: { color: '#f59e0b', bg: '#f59e0b18', icon: Clock, labelKey: 'statusExpiringSoon' },
  expired: { color: '#ef4444', bg: '#ef444418', icon: XCircle, labelKey: 'statusExpired' },
  inactive: { color: '#94a3b8', bg: '#94a3b818', icon: HelpCircle, labelKey: 'statusInactive' },
};

const fmt = (iso, locale) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

/* ── MIME helpers ────────────────────────────────────────────────── */
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

const AVATAR_COLORS = ['#3b82f6', '#10B981', '#8b5cf6', '#f59e0b', '#ec4899'];

/* ── DocCard ─────────────────────────────────────────────────────── */
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

/* ── InfoRow ─────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, iconColor = '#7B8499', mono = false }) {
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
        <p
          className={`text-[14px] font-medium text-[#031634] dark:text-slate-100 mt-0.5 wrap-break-word ${mono ? 'font-mono text-[12px]' : ''}`}
        >
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
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

/* ── Page ────────────────────────────────────────────────────────── */
export default function PersonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('personDetail');
  const locale = useLocale();
  const { employees, setEmployees } = useEmployeeStore();
  const [docPreview, setDocPreview] = useState(null);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [now] = useState(() => Date.now());

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
    key: [KEYS.person, id],
    url: `${URLS.person}/${id}`,
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken && !!id,
    redirectOn403: false,
  });

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
    const list = employeesData?.data?.data;
    if (list?.length) setEmployees(list);
  }, [employeesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-[#7B8499]">
        <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  const person = data?.data;

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <User size={28} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-[14px] text-[#7B8499] dark:text-slate-400">{t('notFound')}</p>
        <Button
          onClick={() => router.push('/dashboard/users')}
          variant="outline"
          className="gap-2 rounded-xl"
        >
          <ArrowLeft size={14} />
          {t('back')}
        </Button>
      </div>
    );
  }

  const employee = employees?.find((e) => e.id === person.employee_id);
  const employeeName = employee
    ? `${employee.last_name ?? ''} ${employee.first_name ?? ''} ${employee.middle_name ?? ''}`.trim()
    : '—';
  const initials = employee
    ? `${employee.last_name?.charAt(0) ?? ''}${employee.first_name?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const avatarColor = AVATAR_COLORS[(employeeName.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  const endMs = person.end_date ? new Date(person.end_date).getTime() : null;
  const daysDiff = endMs != null ? Math.ceil((endMs - now) / 86400000) : null;

  let statusKey = 'active';
  if (!person.is_active) statusKey = 'inactive';
  else if (daysDiff != null && daysDiff < 0) statusKey = 'expired';
  else if (daysDiff != null && daysDiff <= 30) statusKey = 'expiringSoon';

  const st = STATUS_CFG[statusKey];
  const StatusIcon = st.icon;
  const statusLabel = t(st.labelKey);

  const badges = [
    person.is_inspector && { label: t('isInspector'), color: '#3b82f6' },
    person.is_main && { label: t('isMain'), color: '#8b5cf6' },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white text-[15px] font-bold shadow-sm mt-0.5"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100">
                {employeeName}
              </h1>
              {badges.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
                  style={{
                    backgroundColor: `${b.color}18`,
                    color: b.color,
                    borderColor: `${b.color}30`,
                  }}
                >
                  {b.label}
                </span>
              ))}
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border"
                style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}40` }}
              >
                <StatusIcon size={12} />
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">
              {person.facility?.name ?? '—'}
              {person.facility?.unit_code ? ` · ${person.facility.unit_code}` : ''}
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/dashboard/users?edit=${id}`)}
          className="gap-2 rounded-xl px-4 h-10 text-[13px] text-white font-semibold self-start bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Edit size={15} /> {t('edit')}
        </Button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('statusLabel'), value: statusLabel, color: st.color, icon: StatusIcon },
          {
            label: t('daysLeft'),
            value: daysDiff != null ? `${daysDiff} ${t('daysUnit')}` : '—',
            color: '#f59e0b',
            icon: Clock,
          },
          {
            label: t('orderNumber'),
            value: person.appointment_order_number ?? '—',
            color: '#6366f1',
            icon: Hash,
          },
          {
            label: t('endDate'),
            value: fmt(person.end_date, locale),
            color: '#8b5cf6',
            icon: Calendar,
          },
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
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <Section title={t('sectionEmployee')} icon={User} iconColor="#3b82f6">
            <InfoRow icon={User} label={t('fullName')} value={employeeName} iconColor="#3b82f6" />
            <InfoRow
              icon={Briefcase}
              label={t('position')}
              value={employee?.workplace?.position?.name}
              iconColor="#8b5cf6"
            />
            <InfoRow
              icon={Hash}
              label={t('tabelNumber')}
              value={employee?.tabel_number}
              iconColor="#06b6d4"
            />
            <InfoRow
              icon={Hash}
              label={t('employeeId')}
              value={person.employee_id}
              iconColor="#94a3b8"
              mono
            />
          </Section>

          <Section title={t('sectionFacility')} icon={Building2} iconColor="#8b5cf6">
            <InfoRow
              icon={Building2}
              label={t('facilityName')}
              value={person.facility?.name}
              iconColor="#8b5cf6"
            />
            <InfoRow
              icon={Hash}
              label={t('unitCode')}
              value={person.facility?.unit_code}
              iconColor="#8b5cf6"
            />
            <InfoRow
              icon={ShieldCheck}
              label={t('facilityType')}
              value={person.facility?.is_facilities ? t('facilityMain') : t('facilityBranch')}
              iconColor="#8b5cf6"
            />
          </Section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Section title={t('sectionAppointment')} icon={ClipboardList} iconColor="#6366f1">
            <InfoRow
              icon={Hash}
              label={t('orderNumber')}
              value={person.appointment_order_number}
              iconColor="#6366f1"
            />
            <InfoRow
              icon={Calendar}
              label={t('appointmentDate')}
              value={fmt(person.appointment_date, locale)}
              iconColor="#6366f1"
            />
            <InfoRow
              icon={Calendar}
              label={t('endDate')}
              value={fmt(person.end_date, locale)}
              iconColor="#f59e0b"
            />
            <InfoRow
              icon={person.is_active ? ShieldCheck : ShieldAlert}
              label={t('isActive')}
              value={person.is_active ? t('yes') : t('no')}
              iconColor={person.is_active ? '#10B981' : '#94a3b8'}
            />
            <InfoRow
              icon={Calendar}
              label={t('createdAt')}
              value={fmt(person.created_at, locale)}
              iconColor="#94a3b8"
            />
            <InfoRow
              icon={Calendar}
              label={t('updatedAt')}
              value={fmt(person.updated_at, locale)}
              iconColor="#94a3b8"
            />
          </Section>

          <Section
            title={`${t('sectionDocuments')} (${person.documents?.length ?? 0})`}
            icon={FolderOpen}
            iconColor="#0ea5e9"
          >
            {!person.documents?.length ? (
              <div className="py-8 text-center">
                <FolderOpen size={32} className="mx-auto text-slate-200 dark:text-slate-600 mb-2" />
                <p className="text-sm text-muted-foreground">{t('noDocuments')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 py-3">
                {person.documents.map((doc) => (
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
        </div>
      </div>

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
  );
}
