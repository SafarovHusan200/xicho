'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

function ActiveBadge({ value }) {
  const tc = useTranslations('common');
  const color = value ? '#10B981' : '#94a3b8';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
      style={{ backgroundColor: `${color}18`, color, borderColor: `${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {value ? tc('yes') : tc('no')}
    </span>
  );
}

export default ActiveBadge;
