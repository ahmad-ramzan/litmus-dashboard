'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { api, buildQueryString } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse, User, UserStatus } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<User>>(url);

const statusVariant: Record<UserStatus, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'orange'> = {
  ACTIVE: 'success',
  INACTIVE: 'gray',
  BANNED: 'danger',
  SUSPENDED: 'orange',
  PENDING: 'warning',
};

function ActionMenu({ user, onBan, onUnban, onDelete }: {
  user: User;
  onBan: () => void;
  onUnban: () => void;
  onDelete: () => void;
}) {
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
          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
            <Link href={`/users/${user.user_id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Profile
            </Link>
            {user.status === 'BANNED' ? (
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full" onClick={() => { setOpen(false); onUnban(); }}>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Unban User
              </button>
            ) : (
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full" onClick={() => { setOpen(false); onBan(); }}>
                <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Ban User
              </button>
            )}
            <div className="my-1 border-t border-gray-100" />
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full" onClick={() => { setOpen(false); onDelete(); }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UsersPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('type') || '');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banError, setBanError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  // Sync URL → tab when navigating from sidebar
  useEffect(() => {
    const typeParam = searchParams.get('type') || '';
    setTab(typeParam);
    setPage(1);
  }, [searchParams]);

  const qs = buildQueryString({ type: tab, status, search, page, limit: 15 });
  const { data, mutate } = useSWR(`/users${qs}`, fetcher);

  const handleBan = async () => {
    if (!banModal) return;
    if (banReason.trim().length < 5) {
      setBanError('Reason must be at least 5 characters.');
      return;
    }
    setActionLoading('ban');
    setBanError('');
    try {
      await api.post(`/users/${banModal.user_id}/ban`, { reason: banReason });
      await mutate();
      setBanModal(null);
      setBanReason('');
    } catch (err: any) {
      setBanError(err.message || 'Failed to ban user');
    }
    setActionLoading('');
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    try { await api.post(`/users/${userId}/unban`); await mutate(); } catch {}
    setActionLoading('');
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    setActionLoading(userId);
    try { await api.delete(`/users/${userId}`); await mutate(); } catch {}
    setActionLoading('');
  };

  const tabs = [
    { label: 'All Users', value: '' },
    { label: 'Professionals', value: 'PROFESSIONAL' },
    { label: 'Businesses', value: 'BUSINESS' },
    { label: 'Admins', value: 'ADMIN' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.value
                ? 'text-teal-600 border-teal-500'
                : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-56"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <Select
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'BANNED', label: 'Banned' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'PENDING', label: 'Pending' },
            ]}
            placeholder="All Statuses"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => api.download(`/users/export${buildQueryString({ type: tab, status, search })}`, 'users.csv')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </Button>
          <Button size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['User', 'Email', 'Type', 'Joined', 'Last Active', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.data || []).map(user => (
              <tr key={user.user_id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={user.first_name} lastName={user.last_name} imageUrl={user.profile_image_url} size="sm" />
                    <Link href={`/users/${user.user_id}`} className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors">
                      {user.first_name} {user.last_name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.user_type === 'PROFESSIONAL' ? 'teal' : user.user_type === 'BUSINESS' ? 'purple' : 'info'}>
                    {user.user_type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.joined_date)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.last_active)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[user.status] || 'gray'}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <ActionMenu
                    user={user}
                    onBan={() => setBanModal(user)}
                    onUnban={() => handleUnban(user.user_id)}
                    onDelete={() => handleDelete(user.user_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.data?.length && (
          <div className="py-16 text-center text-gray-400">No users found</div>
        )}
        {data && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={15} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={!!banModal} onClose={() => setBanModal(null)} title="Ban User">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You are about to ban <strong className="text-gray-900">{banModal?.first_name} {banModal?.last_name}</strong>. This will prevent them from accessing the platform.
          </p>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Reason *</label>
            <textarea
              value={banReason}
              onChange={e => { setBanReason(e.target.value); setBanError(''); }}
              rows={3}
              placeholder="Explain the reason for this ban..."
              className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
            />
            {banError && <p className="mt-1.5 text-xs text-red-600">{banError}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setBanModal(null); setBanError(''); }}>Cancel</Button>
            <Button variant="danger" loading={actionLoading === 'ban'} onClick={handleBan} disabled={banReason.trim().length < 5}>
              Ban User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageContent />
    </Suspense>
  );
}
