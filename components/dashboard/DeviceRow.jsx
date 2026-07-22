'use client';

import React from 'react';
import { Monitor } from 'lucide-react';
import PulseDot from './PulseDot';

/* ── Device alert row ────────────────────────────────────── */
function DeviceRow({ device, badge, badgeColor, pulse }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[rgba(197,198,207,0.15)] dark:border-slate-700/20 last:border-0">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${badgeColor}15` }}
      >
        <Monitor size={14} style={{ color: badgeColor }} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {pulse && <PulseDot color={badgeColor} />}
          <span className="text-[13px] font-semibold text-[#031634] dark:text-slate-100 truncate">
            {device.name}
          </span>
        </div>
        <span className="text-[11px] text-[#7B8499] truncate">
          {device.facility_name}
          {device.serial_number && ` · ${device.serial_number}`}
        </span>
      </div>
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border shrink-0"
        style={{
          backgroundColor: `${badgeColor}12`,
          color: badgeColor,
          borderColor: `${badgeColor}30`,
        }}
      >
        {badge}
      </span>
    </div>
  );
}

export default DeviceRow;
