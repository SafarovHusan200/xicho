'use client';

import React from 'react';
import { TEST_STATUS_CONFIG } from './statusConfig';

function StatusBadge({ status, t }) {
  const cfg = TEST_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-muted-foreground text-[12px]">—</span>;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color, borderColor: `${cfg.color}30` }}
    >
      <Icon size={11} />
      {t(cfg.label)}
    </span>
  );
}

export default StatusBadge;
