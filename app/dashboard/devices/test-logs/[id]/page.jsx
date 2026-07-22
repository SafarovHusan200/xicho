'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FlaskConical,
  Hash,
  Calendar,
  MonitorSpeaker,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';
import useGetQuery from '@/hooks/all/useGetQuery';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import {
  getTestLogStatus,
  getDayDiffLabel,
  TEST_LOG_STATUS_CFG,
  TestLogStatusBadge,
  TestResultBadge,
} from '@/components/devices/testLogStatus';
import { TestLogForm } from '../page';
import CustomModal from '@/components/modals/CustomModal';
import useDeviceStore from '@/store/useDeviceStore';
import useTestLogStore from '@/store/useTestLogStore';

/* ── InfoRow / Section — same visual language as the device detail page ── */
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

export default function TestLogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('testLogs');
  const td = useTranslations('deviceDetail');
  const tc = useTranslations('common');
  const locale = useLocale();
  const queryClient = useQueryClient();

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { isLoading, data } = useGetQuery({
    key: [KEYS.testLogs, id],
    url: `${URLS.testLogs}/${id}`,
    headers: authHeader,
    enabled: !!session?.accessToken && !!id,
  });

  const log = data?.data;

  const { data: deviceData } = useGetQuery({
    key: [KEYS.device, log?.device_id],
    url: `${URLS.device}/${log?.device_id}`,
    headers: authHeader,
    enabled: !!session?.accessToken && !!log?.device_id,
  });

  const device = deviceData?.data;

  /* ── devices list, reused from the shared store for the edit form's select ── */
  const { devices: storedDevices, setDevices } = useDeviceStore();
  const { data: devicesData } = useGetQuery({
    key: KEYS.device,
    url: URLS.device,
    params: { limit: 1000 },
    headers: authHeader,
    enabled: !!session?.accessToken && storedDevices.length === 0,
  });
  useEffect(() => {
    const list = devicesData?.data?.data;
    if (list?.length) setDevices(list);
  }, [devicesData]);
  const devices = storedDevices.filter(Boolean);

  const { reset: resetTestLogStore } = useTestLogStore();
  const { mutate: updateLog, isPending: updating } = usePatchPythonQuery({
    listKeyId: KEYS.testLogs,
    hideSuccessToast: true,
  });
  const { mutate: deleteLog, isPending: deleting } = useDeleteQuery({
    listKeyId: KEYS.testLogs,
    hideSuccessToast: true,
  });

  const handleDelete = () => {
    deleteLog(
      { url: `${URLS.testLogs}/${id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          toast.success(t('successDeleted'));
          resetTestLogStore();
          router.push('/dashboard/devices/test-logs');
        },
        onError: () => toast.error(t('errorDelete')),
      }
    );
  };

  const handleEditSubmit = (payload) => {
    updateLog(
      {
        url: `${URLS.testLogs}/${id}`,
        attributes: payload,
        config: { headers: authHeader },
      },
      {
        onSuccess: () => {
          toast.success(t('successUpdated'));
          queryClient.invalidateQueries({ queryKey: [[KEYS.testLogs, id]] });
          resetTestLogStore();
          setEditOpen(false);
        },
        onError: () => toast.error(t('errorUpdate')),
      }
    );
  };

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  const fmtDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-[#7B8499]">
        <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  if (!log) return null;

  const status = getTestLogStatus(log.next_test_date, log.is_passed);
  const cfg = TEST_LOG_STATUS_CFG[status];
  const dayDiffLabel = getDayDiffLabel(log.next_test_date, t);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${cfg.color}18` }}
          >
            <FlaskConical size={20} style={{ color: cfg.color }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#031634] dark:text-slate-100">
                {log.test_type}
              </h1>
              {log.is_passed ? (
                <TestResultBadge isPassed={log.is_passed} t={t} />
              ) : (
                <TestLogStatusBadge status={status} t={t} label={dayDiffLabel} />
              )}
            </div>
            <p className="text-sm text-[#7B8499] dark:text-slate-400">
              {log.test_protocol_number ?? '—'} · {device?.name ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 h-10 text-[13px] font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-all"
          >
            <Pencil size={15} /> {tc('edit')}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 h-10 text-[13px] font-semibold border border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all"
          >
            <Trash2 size={15} /> {tc('delete')}
          </button>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title={t('colTestType')} icon={FlaskConical} iconColor={cfg.color}>
          <InfoRow
            icon={Hash}
            label={t('colProtocol')}
            value={log.test_protocol_number}
            iconColor="#3b82f6"
          />
          <InfoRow
            icon={Calendar}
            label={t('colTestDate')}
            value={fmt(log.test_date)}
            iconColor="#8b5cf6"
          />
          <InfoRow
            icon={Calendar}
            label={t('colNextDate')}
            value={fmt(log.next_test_date)}
            iconColor="#f59e0b"
          />
          <InfoRow
            icon={Calendar}
            label={td('createdAt')}
            value={fmtDateTime(log.created_at)}
            iconColor="#94a3b8"
          />
          <InfoRow
            icon={Calendar}
            label={td('updatedAt')}
            value={fmtDateTime(log.updated_at)}
            iconColor="#94a3b8"
          />
          {log.description && (
            <InfoRow
              icon={FileText}
              label={t('descriptionLabel')}
              value={log.description}
              iconColor="#3b82f6"
            />
          )}
        </Section>

        <Section title={t('colDevice')} icon={MonitorSpeaker} iconColor="#3b82f6">
          {device ? (
            <>
              <div className="py-3 border-b border-slate-100 dark:border-slate-700/40">
                <Link
                  href={`/dashboard/devices/${device.id}`}
                  className="text-[15px] font-semibold text-[#3b82f6] hover:underline"
                >
                  {device.name}
                </Link>
              </div>
              <InfoRow
                icon={Hash}
                label={td('serial')}
                value={device.serial_number}
                iconColor="#3b82f6"
              />
              <InfoRow
                icon={Building2}
                label={td('facilityName')}
                value={device.facility?.name}
                iconColor="#8b5cf6"
              />
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">—</p>
          )}
        </Section>
      </div>

      {/* ── Edit modal ─────────────────────────────────────── */}
      <CustomModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('editTitle')}
        className="max-w-200! w-full"
      >
        <TestLogForm
          initialData={log}
          onSubmit={handleEditSubmit}
          onClose={() => setEditOpen(false)}
          isPending={updating}
          t={t}
          devices={devices}
          locale={locale}
        />
      </CustomModal>

      {/* ── Delete modal ───────────────────────────────────── */}
      <CustomModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('deleteTitle')}
        className="max-w-sm"
      >
        <div className="flex flex-col gap-5 pt-1">
          <p className="text-[14px] text-[#3C4043] dark:text-slate-300">
            <span className="font-semibold text-[#031634] dark:text-slate-100">
              {log.test_type}
            </span>{' '}
            {t('deleteWarning')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-[13px]">
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  {t('deleting')}
                </span>
              ) : (
                t('confirmDelete')
              )}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
