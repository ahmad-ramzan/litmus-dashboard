import { Badge } from '@/components/ui/Badge';
import type { ShiftStatus } from '@/types';

const statusConfig: Record<ShiftStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray' }> = {
  OPEN: { label: 'Open', variant: 'info' },
  PENDING: { label: 'Pending', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'purple' },
  CANCELLED: { label: 'Cancelled', variant: 'gray' },
  FLAGGED: { label: 'Flagged', variant: 'danger' },
};

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
