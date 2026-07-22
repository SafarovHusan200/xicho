'use client';

import React from 'react';

/* ── Pulse dot ───────────────────────────────────────────── */
const PulseDot = ({ color }) => (
  <span className="relative flex h-2.5 w-2.5 shrink-0">
    <span
      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex rounded-full h-2.5 w-2.5"
      style={{ backgroundColor: color }}
    />
  </span>
);

export default PulseDot;
