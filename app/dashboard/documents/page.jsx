'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FolderOpen,
  Plus,
  Loader2,
  Search,
  Eye,
  Download,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import CountUp from 'react-countup';

import useGetQuery from '@/hooks/all/useGetQuery';
import usePersonStore from '@/store/usePersonStore';
import usePatchPythonQuery from '@/hooks/all/usePatchQuery';
import useDeleteQuery from '@/hooks/all/useDeleteQuery';
import { request } from '@/services/api';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableComponent from '@/components/tableComponent';
import CustomModal from '@/components/modals/CustomModal';
import PaginationComponent from '@/components/PaginationComponent';
import useEmployeeStore from '@/store/useEmployeeStore';

const LIMIT = 15;

const ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt';

/* ── file type helpers ──────────────────────────────────────────── */
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

const fmtSize = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[#7B8499] dark:text-slate-400">
          {label}
        </span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
      <span className="text-3xl font-bold text-[#031634] dark:text-slate-100">
        <CountUp start={0} end={value ?? 0} duration={1.2} />
      </span>
    </div>
  );
}

/* ── file type badge ────────────────────────────────────────────── */
function TypeBadge({ mime }) {
  const label = getMimeLabel(mime);
  const color = getMimeColor(mime);
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

/* ── file drop zone ─────────────────────────────────────────────── */
function FileDropZone({ file, onChange, t }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onChange(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer py-6 transition-colors ${
        dragging
          ? 'border-[#3b82f6] bg-[#3b82f6]/5'
          : file
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#3b82f6]/60 hover:bg-[#3b82f6]/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <FileText size={24} className="text-emerald-500" />
          <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 text-center px-3 break-all">
            {file.name}
          </p>
          <p className="text-[11px] text-[#7B8499]">{fmtSize(file.size)}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 hover:bg-red-200 transition"
          >
            <X size={11} />
          </button>
        </>
      ) : (
        <>
          <UploadCloud size={28} className="text-[#7B8499] dark:text-slate-500" />
          <p className="text-[13px] text-[#7B8499] dark:text-slate-400 text-center px-3">
            {t('fileDrop')}
          </p>
          <p className="text-[11px] text-[#7B8499]/70">
            PDF, DOCX, XLSX, JPG, PNG, TXT · max 10 MB
          </p>
        </>
      )}
    </div>
  );
}

/* ── upload form ────────────────────────────────────────────────── */
function UploadForm({ onSubmit, onClose, isPending, t, devices, testLogs, persons }) {
  const [ownerType, setOwnerType] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { employees } = useEmployeeStore();

  const getEmployeeName = (employeeId) => {
    const emp = employees?.find((e) => e.id === employeeId);
    if (!emp) return '—';
    return `${emp.last_name} ${emp.first_name}`;
  };

  const handleOwnerTypeChange = (val) => {
    setOwnerType(val);
    setOwnerId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!ownerType) errs.ownerType = t('ownerTypeError');
    if (!ownerId.trim()) errs.ownerId = t('ownerIdError');
    if (!file) errs.file = t('fileError');
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const fd = new FormData();
    fd.append('owner_type', ownerType);
    fd.append('owner_id', ownerId.trim());
    fd.append('file', file);
    onSubmit(fd);
  };

  const ownerIdContent = () => {
    if (ownerType === 'device_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectDevice')} />
          </SelectTrigger>
          <SelectContent>
            {(devices ?? []).map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
                {d.serial_number ? ` · ${d.serial_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (ownerType === 'test_log_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectTestLog')} />
          </SelectTrigger>
          <SelectContent>
            {(testLogs ?? []).map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.test_type ?? '—'}
                {l.test_protocol_number ? ` · ${l.test_protocol_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (ownerType === 'responsible_person_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectPerson')} />
          </SelectTrigger>
          <SelectContent>
            {(persons ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.employee_id ? getEmployeeName(p.employee_id) : p.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        value={ownerId}
        onChange={(e) => setOwnerId(e.target.value)}
        placeholder="UUID"
        className="text-[14px]"
        disabled
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Owner type */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('ownerTypeLabel')} *</Label>
        <Select value={ownerType} onValueChange={handleOwnerTypeChange}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('ownerTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="device_id">{t('ownerTypeDevice')}</SelectItem>
            <SelectItem value="test_log_id">{t('ownerTypeTestLog')}</SelectItem>
            <SelectItem value="responsible_person_id">{t('ownerTypePerson')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.ownerType && <p className="text-xs text-destructive">{errors.ownerType}</p>}
      </div>

      {/* Owner ID */}
      {ownerType && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('ownerIdLabel')} *</Label>
          {ownerIdContent()}
          {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId}</p>}
        </div>
      )}

      {/* File */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('fileLabel')} *</Label>
        <FileDropZone file={file} onChange={setFile} t={t} />
        {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onClose} className="text-[13px]">
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="text-[13px] bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              {t('uploading')}
            </span>
          ) : (
            t('upload')
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── main page ──────────────────────────────────────────────────── */
export default function DocumentsPage() {
  const { data: session } = useSession();
  const t = useTranslations('documents');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const offset = (page - 1) * LIMIT;

  /* ── queries ──────────────────────────────────────────────────── */
  const { data: docsData, isLoading } = useGetQuery({
    key: KEYS.documents,
    url: URLS.documents,
    params: { limit: LIMIT, offset },
    headers: authHeader,
    enabled: !!session,
  });

  const { data: devicesData } = useGetQuery({
    key: `${KEYS.device}-for-docs`,
    url: URLS.device,
    params: { limit: 200 },
    headers: authHeader,
    enabled: !!session,
  });

  const { data: testLogsData } = useGetQuery({
    key: `${KEYS.testLogs}-for-docs`,
    url: URLS.testLogs,
    params: { limit: 200 },
    headers: authHeader,
    enabled: !!session,
  });

  const { persons: allPersons, setPersons } = usePersonStore();

  const { data: getPersonsData } = useGetQuery({
    key: KEYS.person,
    url: URLS.person,
    params: { limit: 10000 },
    headers: authHeader,
    enabled: !!session && allPersons.length === 0,
  });

  const personsData = getPersonsData?.data?.data;

  useEffect(() => {
    if (personsData) setPersons(personsData);
  }, [personsData]);

  const docs = (docsData?.data?.data ?? []).filter(Boolean);
  const totalCount = docsData?.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);

  const devices = (devicesData?.data?.data ?? []).filter(Boolean);
  const testLogs = (testLogsData?.data?.data ?? []).filter(Boolean);
  const persons = allPersons.filter(Boolean);

  /* ── local search filter ────────────────────────────────────────*/
  const filtered = search.trim()
    ? docs.filter((d) => d.file_name?.toLowerCase().includes(search.trim().toLowerCase()))
    : docs;

  /* ── stats (from current page) ─────────────────────────────────*/
  const statsImages = docs.filter((d) => d.file_type?.startsWith('image/')).length;
  const statsDocs = docs.filter(
    (d) =>
      ['application/pdf', 'application/msword', 'text/plain'].some((t) =>
        d.file_type?.includes(t)
      ) ||
      d.file_type?.includes('word') ||
      d.file_type?.includes('sheet') ||
      d.file_type?.includes('excel')
  ).length;

  /* ── upload mutation (direct axios — multipart/form-data) ───── */
  const { mutate: uploadDoc, isPending: uploading } = useMutation({
    mutationFn: (formData) =>
      request.post(`/${URLS.documents}/`, formData, {
        headers: {
          Authorization: authHeader.Authorization,
          'Content-Type': undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.documents] });
      toast.success(t('successUploaded'));
      setUploadOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || t('errorUpload');
      toast.error(msg);
    },
  });

  /* ── rename mutation ────────────────────────────────────────────*/
  const { mutate: renameDoc, isPending: renaming } = usePatchPythonQuery({
    listKeyId: KEYS.documents,
    hideSuccessToast: true,
  });

  /* ── delete mutation ────────────────────────────────────────────*/
  const { mutate: deleteDoc, isPending: deleting } = useDeleteQuery({
    listKeyId: KEYS.documents,
    hideSuccessToast: true,
  });

  /* ── presigned URL helper ───────────────────────────────────────*/
  const getPresignedUrl = async (docId) => {
    const res = await request.post(`/${URLS.documents}/${docId}`, null, {
      headers: { Authorization: authHeader.Authorization },
    });
    const url = typeof res.data === 'string' ? res.data : (res.data?.url ?? res.data);
    if (!url) throw new Error('no url');
    return url;
  };

  /* ── view handler (inline preview modal) ───────────────────────*/
  const handleView = async (doc) => {
    setViewingId(doc.id);
    try {
      const presignedUrl = await getPresignedUrl(doc.id);
      const isPdf = doc.file_type === 'application/pdf';

      let displayUrl = presignedUrl;
      if (isPdf) {
        // Content-Disposition: attachment prevents iframe display.
        // Fetch as blob → create blobURL (no headers) → iframe shows it inline.
        const res = await fetch(presignedUrl);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        displayUrl = URL.createObjectURL(blob);
      }

      setPreviewModal({
        url: displayUrl,
        file_type: doc.file_type,
        file_name: doc.file_name,
        isBlobUrl: isPdf,
      });
    } catch {
      toast.error(t('errorDownload'));
    } finally {
      setViewingId(null);
    }
  };

  /* ── download handler (force download) ─────────────────────────*/
  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const url = await getPresignedUrl(doc.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name ?? 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error(t('errorDownload'));
    } finally {
      setDownloadingId(null);
    }
  };

  /* ── rename handlers ────────────────────────────────────────────*/
  const openRename = (row) => {
    setRenameTarget(row);
    setRenameValue(row.file_name ?? '');
  };

  const handleRename = () => {
    if (!renameValue.trim() || !renameTarget?.id) return;
    renameDoc(
      {
        url: `${URLS.documents}/${renameTarget.id}`,
        attributes: { file_name: renameValue.trim() },
        config: { headers: authHeader },
      },
      {
        onSuccess: () => {
          toast.success(t('successRenamed'));
          setRenameTarget(null);
        },
        onError: () => toast.error(t('errorRename')),
      }
    );
  };

  /* ── delete handler ─────────────────────────────────────────────*/
  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteDoc(
      { url: `${URLS.documents}/${deleteTarget.id}`, config: { headers: authHeader } },
      {
        onSuccess: () => {
          toast.success(t('successDeleted'));
          setDeleteTarget(null);
        },
        onError: () => toast.error(t('errorDelete')),
      }
    );
  };

  /* ── owner label ────────────────────────────────────────────────*/
  const ownerLabel = (ownerType) => {
    if (ownerType === 'device_id') return t('ownerTypeDevice');
    if (ownerType === 'test_log_id') return t('ownerTypeTestLog');
    if (ownerType === 'responsible_person_id') return t('ownerTypePerson');
    return ownerType ?? '—';
  };

  /* ── table data ─────────────────────────────────────────────────*/
  const tableData = filtered.map((doc) => {
    const MimeIcon = getMimeIcon(doc.file_type);
    return {
      ...doc,
      _name: (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${getMimeColor(doc.file_type)}15` }}
          >
            <MimeIcon size={16} style={{ color: getMimeColor(doc.file_type) }} />
          </div>
          <span className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate max-w-50">
            {doc.file_name ?? '—'}
          </span>
        </div>
      ),
      _type: <TypeBadge mime={doc.file_type} />,
      _size: (
        <span className="text-[13px] text-[#7B8499] dark:text-slate-400 font-mono">
          {fmtSize(doc.file_size)}
        </span>
      ),
      _owner: (
        <span className="text-[12px] text-[#7B8499] dark:text-slate-400">
          {ownerLabel(doc.owner_type)}
        </span>
      ),
      _date: doc.created_at
        ? new Date(doc.created_at).toLocaleDateString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '—',
      _actions: (
        <div className="flex items-center justify-end gap-1.5">
          {/* View — yangi tabda ochish */}
          <button
            onClick={() => handleView(doc)}
            disabled={viewingId === doc.id}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-150 disabled:opacity-50"
            title={t('viewTitle')}
          >
            {viewingId === doc.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Eye size={15} />
            )}
          </button>
          {/* Download — yuklab olish */}
          <button
            onClick={() => handleDownload(doc)}
            disabled={downloadingId === doc.id}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-600 dark:hover:text-emerald-300 transition-all duration-150 disabled:opacity-50"
            title={t('downloadTitle')}
          >
            {downloadingId === doc.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
          </button>
          {/* Rename */}
          <button
            onClick={() => openRename(doc)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 dark:border-orange-800/70 bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 hover:text-orange-600 dark:hover:text-orange-300 transition-all duration-150"
            title={t('renameTitle')}
          >
            <Pencil size={15} />
          </button>
          {/* Delete */}
          <button
            onClick={() => setDeleteTarget(doc)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 dark:border-red-800/70 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-600 dark:hover:text-red-300 transition-all duration-150"
            title={t('deleteTitle')}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    };
  });

  const columns = [
    { key: '_name', label: t('colFileName') },
    { key: '_type', label: t('colType') },
    { key: '_size', label: t('colSize') },
    { key: '_owner', label: t('colOwner') },
    { key: '_date', label: t('colDate') },
    { key: '_actions', label: t('colActions'), align: 'right' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b82f6]/10 dark:bg-[#3b82f6]/20">
            <FolderOpen size={22} className="text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#031634] dark:text-slate-100">{t('title')}</h1>
            <p className="text-[13px] text-[#7B8499] dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl h-10 px-5 text-[13px] font-medium shadow-sm"
        >
          <Plus size={16} />
          {t('addNew')}
        </Button>
      </div>

      {/* ── stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('total')} value={totalCount} icon={FolderOpen} iconColor="#3b82f6" />
        <StatCard
          label={t('statImages')}
          value={statsImages}
          icon={FileImage}
          iconColor="#3b82f6"
        />
        <StatCard label={t('statDocs')} value={statsDocs} icon={FileText} iconColor="#ef4444" />
      </div>

      {/* ── table card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#F0F1F5] dark:border-slate-700/40">
          <h2 className="text-[15px] font-semibold text-[#031634] dark:text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-[#3b82f6]" />
            {t('listTitle')}
            <span className="ml-1 rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6]">
              {totalCount}
            </span>
          </h2>
          <div className="relative w-full sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8499] dark:text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8F9FB] dark:bg-slate-700/50 pl-8 pr-4 py-2 text-[13px] text-[#031634] dark:text-slate-100 placeholder:text-[#7B8499] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
            />
          </div>
        </div>

        {/* table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FolderOpen size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-[14px] text-[#7B8499] dark:text-slate-400">{t('empty')}</p>
          </div>
        ) : (
          <TableComponent column={columns} data={tableData} />
        )}

        <PaginationComponent
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={LIMIT}
          onChange={setPage}
        />
      </div>

      {/* ── upload modal ───────────────────────────────────────── */}
      <CustomModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={t('uploadTitle')}
        className="max-w-lg"
      >
        <UploadForm
          onSubmit={uploadDoc}
          onClose={() => setUploadOpen(false)}
          isPending={uploading}
          t={t}
          devices={devices}
          testLogs={testLogs}
          persons={persons}
        />
      </CustomModal>

      {/* ── rename modal ───────────────────────────────────────── */}
      <CustomModal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title={t('renameTitle')}
        className="max-w-sm"
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[14px] font-medium">{t('fileNameLabel')}</Label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={t('fileNamePlaceholder')}
              className="text-[14px]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
            <Button variant="outline" onClick={() => setRenameTarget(null)} className="text-[13px]">
              {t('cancel')}
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || !renameValue.trim()}
              className="text-[13px] bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              {renaming ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  {t('saving')}
                </span>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* ── delete modal ───────────────────────────────────────── */}
      <CustomModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('deleteTitle')}
        className="max-w-sm"
      >
        <div className="flex flex-col gap-5 pt-1">
          <p className="text-[14px] text-[#3C4043] dark:text-slate-300">
            <span className="font-semibold text-[#031634] dark:text-slate-100">
              {deleteTarget?.file_name}
            </span>{' '}
            {t('deleteWarning')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="text-[13px]">
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

      {/* ── preview modal ──────────────────────────────────────── */}
      {previewModal && (
        <CustomModal
          open
          onClose={() => setPreviewModal(null)}
          title={previewModal.file_name ?? t('viewTitle')}
          className="max-w-200! w-full"
        >
          <div className="pt-2">
            {previewModal.file_type?.startsWith('image/') ? (
              <img
                src={previewModal.url}
                alt={previewModal.file_name}
                className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain"
              />
            ) : previewModal.file_type === 'application/pdf' ? (
              <iframe
                src={previewModal.url}
                title={previewModal.file_name}
                className="h-[75vh] w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                <p className="text-[14px] text-[#7B8499] dark:text-slate-400">
                  {t('previewUnsupported')}
                </p>
                <Button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewModal.url;
                    a.download = previewModal.file_name ?? 'download';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="text-[13px] bg-[#3b82f6] hover:bg-[#2563eb]"
                >
                  <Download size={14} className="mr-1.5" />
                  {t('downloadTitle')}
                </Button>
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </div>
  );
}
