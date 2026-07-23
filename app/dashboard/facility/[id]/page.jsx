'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertTriangle,
  Building2,
  LayoutGrid,
  Hash,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Users,
  MonitorSpeaker,
  Activity,
  Clock,
  XCircle,
  HelpCircle,
  FolderOpen,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react';

import useGetQuery from '@/hooks/all/useGetQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useEmployeeStore from '@/store/useEmployeeStore';
import useFacilityStore from '@/store/useFacilityStore';
import { staffio } from '@/services/staffio';
import { request } from '@/services/api';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { getUnitCodeName } from '@/constants/unit_codes';
import { Button } from '@/components/ui/button';
import CustomModal from '@/components/modals/CustomModal';
import FacilityFormComponent from '@/components/forms/FacilityFormComponent';
import { getMimeIcon, getMimeColor, getMimeLabel, fmtSize } from '@/components/documents/fileUtils';
import { hasManageAccess } from '@/lib/permissions';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
      <Loader2 size={18} className="animate-spin text-[#3b82f6]" />
    </div>
  ),
});

const fmt = (iso, locale) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

/* ── Section ─────────────────────────────────────────────────── */
function Section({ title, icon: Icon, iconColor = '#3b82f6', headerRight, children }) {
  return (
    <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2.5 px-5 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon size={16} style={{ color: iconColor }} />
          </div>
          <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100 truncate">
            {title}
          </span>
        </div>
        {headerRight}
      </div>
      <div className="px-5">{children}</div>
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

/* ── StatTile ────────────────────────────────────────────────── */
function StatTile({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
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
      <p className="text-xl font-bold text-[#031634] dark:text-slate-100">{value ?? 0}</p>
    </div>
  );
}

/* ── FacilityLink (parent / child card) ─────────────────────── */
function FacilityLink({ facility, isChild, locale }) {
  const router = useRouter();
  const color = isChild ? '#f59e0b' : '#3b82f6';
  const officialName = getUnitCodeName(facility.unit_code, locale);
  const showOfficialName = officialName && officialName !== facility.unit_code;

  return (
    <div
      onClick={() => router.push(`/dashboard/facility/${facility.id}`)}
      className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0 cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}18` }}
        >
          {isChild ? (
            <LayoutGrid size={16} style={{ color }} />
          ) : (
            <Building2 size={16} style={{ color }} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#031634] dark:text-slate-100 truncate">
            {facility.name}
          </p>
          <p className="text-[11px] text-[#94a3b8] truncate">
            <span className="font-mono">{facility.unit_code}</span>
            {showOfficialName && ` · ${officialName}`}
          </p>
        </div>
      </div>
      <ExternalLink
        size={14}
        className="shrink-0 text-[#7B8499] group-hover:text-[#3b82f6] transition-colors"
      />
    </div>
  );
}

/* ── PersonRow ───────────────────────────────────────────────── */
function PersonRow({ person, index, t, getEmployeeName }) {
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
        <div className="flex flex-wrap items-center gap-1.5">
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
      </div>
    </div>
  );
}

/* ── DocCard ─────────────────────────────────────────────────── */
function DocCard({ doc, onView, loadingId, t }) {
  const color = getMimeColor(doc.file_type);
  const label = getMimeLabel(doc.file_type);
  const isLoading = loadingId === doc.id;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(197,198,207,0.25)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        {React.createElement(getMimeIcon(doc.file_type), { size: 18, style: { color } })}
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

/* ── Page ────────────────────────────────────────────────────── */
export default function FacilityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('facilityDetail');
  const tf = useTranslations('facility');
  const tc = useTranslations('common');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { employees, setEmployees } = useEmployeeStore();
  const { facilities: storedFacilities, setFacilities, reset: resetFacilityStore } =
    useFacilityStore();
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const canManage = hasManageAccess(session);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { mutate: deleteFacility, isPending: isDeleting } = useDeleteQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
  });

  const handleDelete = () => {
    deleteFacility(
      { url: `${URLS.facilities}/${id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          toast.success(tf('successDeleted'));
          resetFacilityStore();
          router.push('/dashboard/facility');
        },
        onError: () => toast.error(tf('errorDelete')),
      }
    );
  };

  const { mutate: updateFacility, isPending: isUpdating } = usePatchPythonQuery({
    listKeyId: KEYS.facilities,
    hideSuccessToast: true,
  });

  const handleFormSubmit = (payload) => {
    updateFacility(
      { url: `${URLS.facilities}/${id}`, attributes: payload, config: { headers: authHeader } },
      {
        onSuccess: () => {
          toast.success(tf('successUpdated'));
          queryClient.invalidateQueries({ queryKey: [[KEYS.facilities, id]] });
          resetFacilityStore();
          setIsEditOpen(false);
        },
        onError: () => toast.error(tf('errorUpdate')),
      }
    );
  };

  const { isLoading, data } = useGetQuery({
    key: [KEYS.facilities, id],
    url: `${URLS.facilities}/${id}`,
    params: { expires_in_days: 15 },
    headers: { ...authHeader, Accept: 'application/json' },
    enabled: !!session?.accessToken && !!id,
  });

  /* ── full facilities list, for the edit form's parent picker ── */
  const { data: allFacilitiesData } = useGetQuery({
    key: KEYS.facilities,
    url: URLS.facilities,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session?.accessToken && storedFacilities.length === 0,
  });

  useEffect(() => {
    const list = allFacilitiesData?.data?.data;
    if (list?.length) setFacilities(list);
  }, [allFacilitiesData]);

  const allFacilities = storedFacilities.filter(Boolean);

  const { data: employeesData } = useGetQuery({
    key: KEYS.employees,
    url: URLS.employee,
    params: { limit: 10000 },
    headers: authHeader,
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
  });

  useEffect(() => {
    const list = employeesData?.data?.data;
    if (list?.length) setEmployees(list);
  }, [employeesData]);

  const getEmployeeName = (employeeId) => {
    const emp = employees?.find((e) => e.id === employeeId);
    if (!emp) return '—';
    return `${emp.last_name} ${emp.first_name}`;
  };

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
      setPreviewDoc({
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

  const closePreview = () => {
    if (previewDoc?.isBlobUrl) URL.revokeObjectURL(previewDoc.url);
    setPreviewDoc(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-[#7B8499]">
        <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  const facility = data?.data;
  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[#7B8499]">
        <Building2 size={36} className="text-slate-200 dark:text-slate-600" />
        <p className="text-sm">{t('notFound')}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/facility')}
          className="gap-2 rounded-xl"
        >
          <ArrowLeft size={14} />
          {t('back')}
        </Button>
      </div>
    );
  }

  const color = facility.is_facilities ? '#3b82f6' : '#f59e0b';
  const officialName = getUnitCodeName(facility.unit_code, locale);
  const showOfficialName = officialName && officialName !== facility.unit_code;
  const summary = facility.devices_summary ?? {};
  const mappedLocations = (facility.locations ?? []).map((loc, i) => ({
    ...loc,
    id: `${facility.id}-loc-${i}`,
    facility_name: facility.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: color }}
          >
            {facility.is_facilities ? (
              <Building2 size={20} className="text-white" />
            ) : (
              <LayoutGrid size={20} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100">
                {facility.name}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border"
                style={{ backgroundColor: `${color}18`, color, borderColor: `${color}40` }}
              >
                {facility.is_facilities ? t('typeMain') : t('typeBranch')}
              </span>
            </div>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">
              <span className="font-mono">{facility.unit_code}</span>
              {showOfficialName && ` · ${officialName}`}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 self-start">
            <Button
              onClick={() => setIsEditOpen(true)}
              className="gap-2 rounded-xl px-4 h-10 text-[13px] text-white font-semibold bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              <Pencil size={15} /> {t('edit')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-2 rounded-xl px-4 h-10 text-[13px] font-semibold border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-600"
            >
              <Trash2 size={15} /> {tc('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* ── Devices summary ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile
          label={t('devicesTotal')}
          value={summary.total}
          color="#3b82f6"
          icon={MonitorSpeaker}
        />
        <StatTile
          label={t('devicesActive')}
          value={summary.active}
          color="#10B981"
          icon={Activity}
        />
        <StatTile
          label={t('devicesExpiring')}
          value={summary.expiring_soon}
          color="#f59e0b"
          icon={Clock}
        />
        <StatTile
          label={t('devicesOverdue')}
          value={summary.overdue}
          color="#ef4444"
          icon={XCircle}
        />
        <StatTile
          label={t('devicesNeverTested')}
          value={summary.never_tested}
          color="#94a3b8"
          icon={HelpCircle}
        />
      </div>

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <Section title={t('sectionBasic')} icon={Building2} iconColor="#3b82f6">
            <InfoRow
              icon={Hash}
              label={t('unitCode')}
              value={facility.unit_code}
              iconColor="#3b82f6"
            />
            {showOfficialName && (
              <InfoRow
                icon={ShieldCheck}
                label={t('officialName')}
                value={officialName}
                iconColor="#3b82f6"
              />
            )}
            <InfoRow
              icon={ShieldCheck}
              label={t('type')}
              value={facility.is_facilities ? t('typeMain') : t('typeBranch')}
              iconColor={color}
            />
            <InfoRow
              icon={Calendar}
              label={t('createdAt')}
              value={fmt(facility.created_at, locale)}
              iconColor="#94a3b8"
            />
            <InfoRow
              icon={Calendar}
              label={t('updatedAt')}
              value={fmt(facility.updated_at, locale)}
              iconColor="#94a3b8"
            />
          </Section>

          {facility.parent && (
            <Section title={t('sectionParent')} icon={Building2} iconColor="#3b82f6">
              <FacilityLink facility={facility.parent} isChild={false} locale={locale} />
            </Section>
          )}

          {facility.is_facilities && (
            <Section
              title={`${t('sectionChildren')} (${facility.children?.length ?? 0})`}
              icon={LayoutGrid}
              iconColor="#f59e0b"
            >
              {!facility.children?.length ? (
                <div className="py-8 text-center">
                  <LayoutGrid
                    size={32}
                    className="mx-auto text-slate-200 dark:text-slate-600 mb-2"
                  />
                  <p className="text-sm text-muted-foreground">{t('noChildren')}</p>
                </div>
              ) : (
                facility.children.map((child) => (
                  <FacilityLink key={child.id} facility={child} isChild locale={locale} />
                ))
              )}
            </Section>
          )}

          <Section
            title={`${t('sectionDocuments')} (${facility.documents?.length ?? 0})`}
            icon={FolderOpen}
            iconColor="#0ea5e9"
          >
            {!facility.documents?.length ? (
              <div className="py-8 text-center">
                <FolderOpen size={32} className="mx-auto text-slate-200 dark:text-slate-600 mb-2" />
                <p className="text-sm text-muted-foreground">{t('noDocuments')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 py-3">
                {facility.documents.map((doc) => (
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

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {mappedLocations.length > 0 && (
            <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[rgba(197,198,207,0.20)] dark:border-slate-700/40 bg-[#FAFBFC] dark:bg-slate-800/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                  <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-[14px] text-[#031634] dark:text-slate-100">
                  {t('sectionLocations')} ({mappedLocations.length})
                </span>
              </div>

              <div className="h-52 relative z-0">
                <LeafletMap locations={mappedLocations} />
              </div>

              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/40">
                {mappedLocations.map((loc) => (
                  <div key={loc.id} className="flex items-center gap-3 px-5 py-3">
                    <MapPin size={12} className="shrink-0 text-emerald-500" />
                    <span className="text-[12px] font-medium text-[#031634] dark:text-slate-200 flex-1 truncate">
                      {loc.address_line || '—'}
                    </span>
                    <span className="font-mono text-[10px] text-[#7B8499] dark:text-slate-500 shrink-0">
                      {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Section title={t('sectionInspector')} icon={ShieldCheck} iconColor="#3b82f6">
            {!facility.inspector ? (
              <div className="py-8 text-center">
                <ShieldCheck
                  size={32}
                  className="mx-auto text-slate-200 dark:text-slate-600 mb-2"
                />
                <p className="text-sm text-muted-foreground">{t('noInspector')}</p>
              </div>
            ) : (
              <div className="flex items-start gap-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                  <User size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#031634] dark:text-slate-100">
                    {getEmployeeName(facility.inspector.employee_id)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {t('inspectorOrderNumber')}:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {facility.inspector.appointment_order_number ?? '—'}
                    </span>
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {t('inspectorAppointmentDate')}:{' '}
                    {fmt(facility.inspector.appointment_date, locale)}
                  </p>
                  {facility.inspector.inherited_from && (
                    <span className="inline-flex items-center mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                      {t('inspectorInherited')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </Section>

          <Section
            title={`${t('sectionPersons')} (${facility.responsible_persons?.length ?? 0})`}
            icon={Users}
            iconColor="#8b5cf6"
          >
            {!facility.responsible_persons?.length ? (
              <div className="py-8 text-center">
                <Users size={32} className="mx-auto text-slate-200 dark:text-slate-600 mb-2" />
                <p className="text-sm text-muted-foreground">{t('noPersons')}</p>
              </div>
            ) : (
              facility.responsible_persons.map((p, i) => (
                <PersonRow
                  key={p.id}
                  person={p}
                  index={i}
                  t={t}
                  getEmployeeName={getEmployeeName}
                />
              ))
            )}
          </Section>
        </div>
      </div>

      {/* ── Edit modal ─────────────────────────────────────── */}
      <CustomModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={tf('editTitle')}
        className="max-w-180! w-full"
      >
        <FacilityFormComponent
          facilities={allFacilities.filter((f) => f.is_facilities)}
          allFacilities={allFacilities}
          onSubmit={handleFormSubmit}
          onClose={() => setIsEditOpen(false)}
          initialData={facility}
          isPending={isUpdating}
        />
      </CustomModal>

      {/* ── Delete modal ──────────────────────────────────── */}
      <CustomModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={tf('deleteTitle')}
        className="max-w-md! w-full"
      >
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              <span className="font-semibold">«{facility.name}»</span> {tf('deleteWarning')}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsDeleteOpen(false)}>
              {tf('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              {isDeleting ? tf('deleting') : tf('confirmDelete')}
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* ── Document preview modal ──────────────────────────── */}
      {previewDoc && (
        <CustomModal
          open
          onClose={closePreview}
          title={previewDoc.file_name ?? t('viewTitle')}
          className="max-w-200! w-full"
        >
          <div className="pt-2">
            {previewDoc.file_type?.startsWith('image/') ? (
              <img
                src={previewDoc.url}
                alt={previewDoc.file_name}
                className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain"
              />
            ) : previewDoc.file_type === 'application/pdf' ? (
              <iframe
                src={previewDoc.url}
                title={previewDoc.file_name}
                className="h-[75vh] w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                <p className="text-[14px] text-[#7B8499] dark:text-slate-400">
                  {t('previewUnsupported')}
                </p>
                <a
                  href={previewDoc.presignedUrl ?? previewDoc.url}
                  download={previewDoc.file_name}
                  className="inline-flex items-center gap-2 rounded-xl px-4 h-9 text-[13px] font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
                >
                  <Download size={14} />
                  {t('downloadTitle')}
                </a>
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </div>
  );
}
