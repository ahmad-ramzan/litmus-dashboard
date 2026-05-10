import { Badge } from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { Shift } from '@/types';

interface RecentShiftsProps {
  shifts: Shift[];
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray' | 'teal'> = {
  OPEN: 'teal',
  PENDING: 'warning',
  ACCEPTED: 'success',
  COMPLETED: 'purple',
  CANCELLED: 'gray',
  FLAGGED: 'danger',
};

export function RecentShifts({ shifts }: RecentShiftsProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Shifts</h3>
        <a href="/shifts" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View all →</a>
      </div>
      {shifts.length === 0 ? (
        <p className="text-gray-400 text-sm">No shifts yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Shift Title', 'Business', 'Date & Time', 'Professional', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shifts.map((shift) => {
                const pro = shift.professionals?.users;
                return (
                  <tr key={shift.shift_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 text-sm text-gray-900 font-medium">{shift.shift_title}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">
                      {(shift as any).businesses?.business_name || '—'}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">
                      {formatDate(shift.shift_date)}{' '}
                      {shift.shift_start_time && `${formatTime(shift.shift_start_time)}–${formatTime(shift.shift_end_time)}`}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">
                      {pro ? `${pro.first_name} ${pro.last_name}` : '—'}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[shift.status] || 'gray'}>{shift.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
