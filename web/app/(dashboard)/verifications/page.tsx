'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, buildQueryString } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse, Verification, DocumentStatus } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<Verification>>(url);

const statusVariant: Record<DocumentStatus, 'warning' | 'success' | 'danger' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REQUEST_MORE_DOCS: 'info',
};

export default function VerificationsPage() {
  const [status, setStatus] = useState('PENDING');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState('');

  const qs = buildQueryString({ status, type, page, limit: 15 });
  const { data, mutate } = useSWR(`/verifications${qs}`, fetcher);

  const handleApprove = async () => {
    if (!selected) return;
    setLoading('approve');
    try {
      await api.patch(`/verifications/${selected.verification_id}/approve`);
      await mutate();
      setSelected(null);
    } catch {}
    setLoading('');
  };

  const handleReject = async () => {
    if (!selected || !rejectReason) return;
    setLoading('reject');
    try {
      await api.patch(`/verifications/${selected.verification_id}/reject`, { reason: rejectReason });
      await mutate();
      setSelected(null);
      setRejectReason('');
    } catch {}
    setLoading('');
  };

  const handleRequestMore = async () => {
    if (!selected || !requestNotes) return;
    setLoading('request');
    try {
      await api.patch(`/verifications/${selected.verification_id}/request-more`, { notes: requestNotes });
      await mutate();
      setSelected(null);
      setRequestNotes('');
    } catch {}
    setLoading('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'REQUEST_MORE_DOCS', label: 'More Docs Needed' },
          ]}
          placeholder="All Statuses"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={[
            { value: 'Government-Issued ID', label: 'Government ID' },
            { value: 'Professional License', label: 'Professional License' },
            { value: 'Business Registration', label: 'Business Registration' },
          ]}
          placeholder="All Types"
          value={type}
          onChange={e => { setType(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Name', 'Type', 'Email', 'Submitted', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.data || []).map(v => {
              const user = v.users;
              const biz = v.businesses;
              const name = user ? `${user.first_name} ${user.last_name}` : biz?.business_name || '—';
              const email = user?.email || biz?.email || '—';
              return (
                <tr key={v.verification_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{v.verification_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(v.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[v.document_status] || 'gray'}>{v.document_status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      onClick={() => { setSelected(v); setAction(''); }}
                    >
                      Review →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.data?.length && (
          <div className="py-16 text-center text-gray-400">No verifications found</div>
        )}
        {data && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={15} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setAction(''); }} title="Review Verification Document" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Type</p><p className="text-gray-900 font-medium">{selected.verification_type}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p><Badge variant={statusVariant[selected.document_status]}>{selected.document_status}</Badge></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Submitted</p><p className="text-gray-900">{formatDate(selected.submitted_at)}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Level</p><p className="text-gray-900">{selected.verification_level || '—'}</p></div>
            </div>

            {selected.document_url && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Document Preview</p>
                <a href={selected.document_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 text-sm font-medium underline">
                  Open Document →
                </a>
                <img
                  src={selected.document_url}
                  alt="Document"
                  className="max-h-48 mx-auto mt-3 rounded-lg object-contain border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            {action === 'reject' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
                  placeholder="Explain why this document was rejected..."
                />
              </div>
            ) : action === 'request' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Instructions for user *</label>
                <textarea
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
                  placeholder="What additional documents do you need?"
                />
              </div>
            ) : null}

            <div className="flex gap-2 flex-wrap pt-1">
              {action === '' && (
                <>
                  <Button loading={loading === 'approve'} onClick={handleApprove}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => setAction('reject')}>Reject</Button>
                  <Button variant="secondary" onClick={() => setAction('request')}>Request More Docs</Button>
                </>
              )}
              {action === 'reject' && (
                <>
                  <Button variant="danger" loading={loading === 'reject'} disabled={!rejectReason} onClick={handleReject}>Confirm Reject</Button>
                  <Button variant="secondary" onClick={() => setAction('')}>Back</Button>
                </>
              )}
              {action === 'request' && (
                <>
                  <Button loading={loading === 'request'} disabled={!requestNotes} onClick={handleRequestMore}>Send Request</Button>
                  <Button variant="secondary" onClick={() => setAction('')}>Back</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
