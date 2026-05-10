'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { api, buildQueryString } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatTime } from '@/lib/utils';
import type { PaginatedResponse, Shift } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<Shift>>(url);

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray' | 'teal'> = {
  OPEN: 'teal',
  PENDING: 'warning',
  ACCEPTED: 'success',
  COMPLETED: 'purple',
  CANCELLED: 'gray',
  FLAGGED: 'danger',
};

function ShiftActionMenu({ shift, onAction }: { shift: Shift; onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
            <Link href={`/shifts/${shift.shift_id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              View Details
            </Link>
            {(shift.status === 'OPEN' || shift.status === 'ACCEPTED') && (
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full" onClick={() => { setOpen(false); onAction('complete'); }}>
                Mark Complete
              </button>
            )}
            {shift.status !== 'CANCELLED' && shift.status !== 'COMPLETED' && (
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full" onClick={() => { setOpen(false); onAction('boost'); }}>
                Boost Shift
              </button>
            )}
            {shift.status !== 'CANCELLED' && shift.status !== 'COMPLETED' && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full" onClick={() => { setOpen(false); onAction('cancel'); }}>
                  Cancel Shift
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ShiftsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qs = buildQueryString({ status, search, page, limit: 15 });
  const { data, mutate } = useSWR(`/shifts${qs}`, fetcher);

  const handleAction = async (shiftId: string, action: string) => {
    try {
      if (action === 'complete') await api.post(`/shifts/${shiftId}/complete`);
      else if (action === 'cancel') await api.post(`/shifts/${shiftId}/cancel`);
      else if (action === 'boost') await api.post(`/shifts/${shiftId}/boost`);
      await mutate();
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-56"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <Select
            options={[
              { value: 'OPEN', label: 'Open' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'FLAGGED', label: 'Flagged' },
            ]}
            placeholder="All Statuses"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/shifts/export`; }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </Button>
          <Link href="/shifts/new">
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Post Shift
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['ID', 'Role', 'Business', 'Apps', 'Date', 'Time', 'Pay', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.data || []).map((shift) => (
                <tr key={shift.shift_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    #{shift.shift_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/shifts/${shift.shift_id}`} className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors">
                      {shift.shift_title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(shift as any).businesses?.business_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">
                    {shift.applicant_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(shift.shift_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {shift.shift_start_time ? `${formatTime(shift.shift_start_time)}–${formatTime(shift.shift_end_time)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {shift.pay_rate ? `$${shift.pay_rate}/${shift.pay_type === 'PER_HOUR' ? 'hr' : 'session'}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[shift.status] || 'gray'}>{shift.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ShiftActionMenu
                      shift={shift}
                      onAction={(action) => handleAction(shift.shift_id, action)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.data?.length && (
            <div className="py-16 text-center text-gray-400">No shifts found</div>
          )}
        </div>
        {data && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={15} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
