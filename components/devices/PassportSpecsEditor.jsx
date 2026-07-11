'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

function PassportSpecsEditor({ value, onChange, t }) {
  const [rows, setRows] = useState(() => {
    const obj = value && typeof value === 'object' ? value : {};
    return Object.entries(obj).map(([k, v]) => ({
      k,
      v: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
    }));
  });

  const parseVal = (v) => {
    const s = v.trim();
    if (s.startsWith('{') || s.startsWith('[')) {
      try {
        return JSON.parse(s);
      } catch {}
    }
    return v;
  };

  const syncToParent = (newRows) => {
    const obj = {};
    newRows.forEach(({ k, v }) => {
      if (k.trim()) obj[k.trim()] = parseVal(v);
    });
    onChange(obj);
  };

  const addRow = () => setRows((prev) => [...prev, { k: '', v: '' }]);

  const removeRow = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    syncToParent(next);
  };

  const updateRow = (i, field, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r));
    setRows(next);
    syncToParent(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.k}
            onChange={(e) => updateRow(i, 'k', e.target.value)}
            placeholder={t('passportKeyPlaceholder')}
            className="text-[13px] flex-1"
          />
          <Input
            value={row.v}
            onChange={(e) => updateRow(i, 'v', e.target.value)}
            placeholder={t('passportValPlaceholder')}
            className="text-[13px] flex-1"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-red-400 hover:text-red-600 p-1 shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-[13px] text-[#3b82f6] hover:underline text-left w-fit"
      >
        {t('passportAddRow')}
      </button>
    </div>
  );
}

export default PassportSpecsEditor;
