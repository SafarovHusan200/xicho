'use client';

import React, { useRef, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ACCEPT, validateFile, fmtSize } from './fileUtils';

function FileDropZone({ file, onChange, t }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (f) => {
    if (!f) {
      onChange(null);
      return;
    }
    const error = validateFile(f, t);
    if (error) {
      toast.error(error);
      return;
    }
    onChange(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
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
        onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
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
            JPEG, PNG, WebP, PDF, DOC/DOCX, XLS/XLSX, TXT · max 100 MB
          </p>
        </>
      )}
    </div>
  );
}

export default FileDropZone;
