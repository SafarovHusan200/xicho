import {
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  AlertTriangle,
  CircleCheckBig,
  CircleX,
} from 'lucide-react';

const WARNING_DAYS = 60;
const EXPIRING_DAYS = 15;
const STATUS_PRIORITY = ['overdue', 'expiring_soon', 'warning', 'ok', 'never_tested'];

export const TEST_LOG_STATUS_CFG = {
  ok: { labelKey: 'statusOk', color: '#10B981', icon: CheckCircle2 },
  warning: { labelKey: 'statusWarning', color: '#eab308', icon: AlertTriangle },
  expiring_soon: { labelKey: 'statusExpiring', color: '#f97316', icon: Clock },
  overdue: { labelKey: 'statusOverdue', color: '#ef4444', icon: XCircle },
  never_tested: { labelKey: 'statusNever', color: '#94a3b8', icon: HelpCircle },
};

export const TEST_LOG_ROW_BG = {
  warning: 'bg-yellow-50 dark:bg-yellow-950/20',
  expiring_soon: 'bg-orange-50 dark:bg-orange-950/20',
  overdue: 'bg-red-50 dark:bg-red-950/20',
  passed: 'bg-emerald-50 dark:bg-emerald-950/20',
};

export const getTestLogStatus = (next_test_date, isPassed) => {
  if (isPassed === true) return 'ok';
  if (!next_test_date) return 'never_tested';
  const diff = (new Date(next_test_date) - Date.now()) / 86400000;
  if (diff < 0) return 'overdue';
  if (diff <= EXPIRING_DAYS) return 'expiring_soon';
  if (diff <= WARNING_DAYS) return 'warning';
  return 'ok';
};

/* ── worst status among a set of logs sharing a day/group (already-passed logs count as ok) ── */
export const getWorstStatus = (logs) => {
  for (const p of STATUS_PRIORITY) {
    if (logs.some((l) => getTestLogStatus(l.next_test_date, l.is_passed) === p)) return p;
  }
  return 'never_tested';
};

export function TestLogStatusBadge({ status, t }) {
  const cfg = TEST_LOG_STATUS_CFG[status];
  if (!cfg) return <span className="text-muted-foreground text-[13px]">—</span>;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-semibold border whitespace-nowrap"
      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color, borderColor: `${cfg.color}30` }}
    >
      <Icon size={14} />
      {t(cfg.labelKey)}
    </span>
  );
}

/* ── Test result (pass/fail) — independent of the timing-based status above ── */
export function TestResultBadge({ isPassed, t }) {
  if (isPassed == null) return null;
  const passed = isPassed === true;
  const color = passed ? '#10B981' : '#ef4444';
  const Icon = passed ? CircleCheckBig : CircleX;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-semibold border whitespace-nowrap"
      style={{ backgroundColor: `${color}18`, color, borderColor: `${color}30` }}
    >
      <Icon size={14} />
      {t(passed ? 'resultPassed' : 'resultFailed')}
    </span>
  );
}
