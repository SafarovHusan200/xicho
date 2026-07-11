'use client';

import React from 'react';
import { getMimeLabel, getMimeColor } from './fileUtils';

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

export default TypeBadge;
