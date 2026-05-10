'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import type { Shift } from '@/types';

const fetcher = (url: string) => api.get<Shift>(url);

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'teal' | 'purple' | 'gray'> = {
  OPEN: 'teal',
  PENDING: 'warning',
  ACCEPTED: 'success',
  COMPLETED: 'purple',
  CANCELLED: 'gray',
  FLAGGED: 'danger',
};

export default function ShiftDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: shift, mutate } = useSWR(`/shifts/${id}`, fetcher);
  const [loading, setLoading] = useState('');

  const action = async (type: string) => {
    setLoading(type);
    try {
      await api.post(`/shifts/${id}/${type}`);
      await mutate();
    } catch {}
    setLoading('');
  };

  if (!shift) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading shift...</p>
        </div>
      </div>
    );
  }

  const business = (shift as any).businesses;
  const professional = (shift as any).professionals;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shifts
        </button>
        <div className="flex gap-2">
          {shift.status !== 'COMPLETED' && shift.status !== 'CANCELLED' && (
            <Button size="sm" loading={loading === 'complete'} onClick={() => action('complete')}>
              Mark Complete
            </Button>
          )}
          {shift.status !== 'CANCELLED' && shift.status !== 'COMPLETED' && (
            <Button variant="danger" size="sm" loading={loading === 'cancel'} onClick={() => action('cancel')}>
              Cancel
            </Button>
          )}
          <Button variant="secondary" size="sm" loading={loading === 'boost'} onClick={() => action('boost')}>
            Boost
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{shift.shift_title}</h2>
            {business && <p className="text-gray-500 mt-0.5">{business.business_name}</p>}
          </div>
          <Badge variant={statusVariant[shift.status] || 'gray'}>{shift.status}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <InfoField label="Location" value={shift.location} />
          <InfoField label="Date" value={formatDate(shift.shift_date)} />
          <InfoField label="Time" value={shift.shift_start_time ? `${formatTime(shift.shift_start_time)} – ${formatTime(shift.shift_end_time)}` : undefined} />
          <InfoField label="Shift Type" value={shift.shift_type?.replace('_', ' ')} />
          <InfoField label="Applicants" value={shift.applicant_count} />
          <InfoField label="Verification Required" value={`Level ${shift.verification_level_required}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment</h3>
          <p className="text-2xl font-bold text-gray-900">
            {shift.pay_rate ? formatCurrency(shift.pay_rate) : '—'}
            <span className="text-sm font-normal text-gray-400 ml-1">
              / {shift.pay_type === 'PER_HOUR' ? 'hour' : 'session'}
            </span>
          </p>
          {shift.payment_methods?.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">{shift.payment_methods.join(', ')}</p>
          )}
          {shift.payment_timeline && (
            <p className="text-sm text-gray-500">Timeline: {shift.payment_timeline}</p>
          )}
        </div>

        {(shift.contact_person_name || shift.contact_person_email) && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Person</h3>
            <p className="text-gray-900 font-medium">{shift.contact_person_name || '—'}</p>
            <p className="text-gray-500 text-sm mt-0.5">{shift.contact_person_email || '—'}</p>
          </div>
        )}
      </div>

      {shift.required_skills?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {shift.required_skills.map(s => (
              <Badge key={s} variant="teal">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {shift.additional_info && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Additional Info</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{shift.additional_info}</p>
        </div>
      )}

      {professional?.users && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Assigned Professional</h3>
          <p className="text-gray-900 font-medium">
            {professional.users.first_name} {professional.users.last_name}
          </p>
          <p className="text-gray-500 text-sm">{professional.primary_role}</p>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value ?? '—'}</p>
    </div>
  );
}
