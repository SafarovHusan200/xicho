import { CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';

export const TEST_STATUS_CONFIG = {
  ok: { label: 'statusOk', color: '#10B981', icon: CheckCircle2 },
  expiring_soon: { label: 'statusExpiring', color: '#f59e0b', icon: Clock },
  overdue: { label: 'statusOverdue', color: '#ef4444', icon: XCircle },
  never_tested: { label: 'statusNever', color: '#94a3b8', icon: HelpCircle },
};
