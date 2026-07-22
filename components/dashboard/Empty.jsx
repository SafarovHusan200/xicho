'use client';

import React from 'react';
import { Activity } from 'lucide-react';

/* ── Empty ───────────────────────────────────────────────── */
const Empty = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#94a3b8]">
    <Activity size={24} strokeWidth={1.5} />
    <p className="text-[13px]">{text}</p>
  </div>
);

export default Empty;
