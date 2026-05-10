'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, buildQueryString } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse, Review, ReviewStatus } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<Review>>(url);

const statusVariant: Record<ReviewStatus, 'success' | 'warning' | 'danger' | 'gray'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  FLAGGED: 'danger',
  REJECTED: 'gray',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [entityType, setEntityType] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState('');

  const qs = buildQueryString({ entityType, status, page, limit: 15 });
  const { data, mutate } = useSWR(`/reviews${qs}`, fetcher);

  const handleApprove = async (reviewId: string) => {
    setLoading(reviewId);
    try { await api.patch(`/reviews/${reviewId}/approve`); await mutate(); } catch {}
    setLoading('');
  };

  const handleReject = async (reviewId: string) => {
    setLoading(reviewId + 'r');
    try { await api.patch(`/reviews/${reviewId}/reject`); await mutate(); } catch {}
    setLoading('');
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    setLoading(reviewId + 'd');
    try { await api.delete(`/reviews/${reviewId}`); await mutate(); } catch {}
    setLoading('');
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <Select
          options={[{ value: 'PROFESSIONAL', label: 'Professional' }, { value: 'BUSINESS', label: 'Business' }]}
          placeholder="All Types"
          value={entityType}
          onChange={e => { setEntityType(e.target.value); setPage(1); }}
          className="w-36"
        />
        <Select
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'FLAGGED', label: 'Flagged' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
          placeholder="All Statuses"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-36"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Reviewer', 'Subject', 'Rating', 'Comment', 'Date', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.data || []).map(review => {
              const reviewer = review.users;
              const subject = review.entity_type === 'PROFESSIONAL'
                ? review.professionals?.users ? `${review.professionals.users.first_name} ${review.professionals.users.last_name}` : '—'
                : review.businesses?.business_name || '—';
              return (
                <tr key={review.review_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar firstName={reviewer?.first_name} lastName={reviewer?.last_name} imageUrl={reviewer?.profile_image_url} size="sm" />
                      <span className="text-sm text-gray-900">{reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">{subject}</p>
                      <Badge variant={review.entity_type === 'PROFESSIONAL' ? 'teal' : 'purple'} className="mt-0.5">{review.entity_type}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StarRating rating={review.rating} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{review.comment || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(review.review_date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[review.status] || 'gray'}>{review.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {review.status !== 'APPROVED' && (
                        <Button variant="ghost" size="sm" loading={loading === review.review_id} onClick={() => handleApprove(review.review_id)}>
                          Approve
                        </Button>
                      )}
                      {review.status !== 'REJECTED' && (
                        <Button variant="ghost" size="sm" loading={loading === review.review_id + 'r'} onClick={() => handleReject(review.review_id)}>
                          Reject
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" loading={loading === review.review_id + 'd'} onClick={() => handleDelete(review.review_id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.data?.length && (
          <div className="py-16 text-center text-gray-400">No reviews found</div>
        )}
        {data && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={15} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
