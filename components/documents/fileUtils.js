import { File, FileText, FileImage, FileSpreadsheet } from 'lucide-react';

export const ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt';
export const ACCEPT_EXTENSIONS = ACCEPT.split(',');
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const getFileExtension = (name) => {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(idx).toLowerCase();
};

export const validateFile = (file, t) => {
  if (!ACCEPT_EXTENSIONS.includes(getFileExtension(file.name))) return t('fileTypeError');
  if (file.size > MAX_FILE_SIZE) return t('fileSizeError');
  return null;
};

/* ── file type helpers ──────────────────────────────────────────── */
export const getMimeLabel = (mime) => {
  if (!mime) return '—';
  const m = mime.toLowerCase();
  if (m === 'application/pdf') return 'PDF';
  if (m.startsWith('image/')) return m.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
  if (m.includes('wordprocessingml') || m.includes('msword')) return 'DOCX';
  if (m.includes('spreadsheetml') || m.includes('excel')) return 'XLSX';
  if (m === 'text/plain') return 'TXT';
  return (mime.split('/')[1] ?? '').toUpperCase().slice(0, 6) || '—';
};

export const getMimeColor = (mime) => {
  if (!mime) return '#94a3b8';
  const m = mime.toLowerCase();
  if (m === 'application/pdf') return '#ef4444';
  if (m.startsWith('image/')) return '#3b82f6';
  if (m.includes('word')) return '#2563eb';
  if (m.includes('sheet') || m.includes('excel')) return '#16a34a';
  if (m === 'text/plain') return '#6b7280';
  return '#94a3b8';
};

export const getMimeIcon = (mime) => {
  if (!mime) return File;
  const m = mime.toLowerCase();
  if (m.startsWith('image/')) return FileImage;
  if (m.includes('sheet') || m.includes('excel')) return FileSpreadsheet;
  return FileText;
};

export const fmtSize = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
