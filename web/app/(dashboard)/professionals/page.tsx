'use client';

import { useState } from 'react';
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
import type { PaginatedResponse, User } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<User>>(url);

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray' | 'orange'> = {
  ACTIVE: 'success',
  INACTIVE: 'gray',
  BANNED: 'danger',
  SUSPENDED: 'orange',
  PENDING: 'warning',
};

function ActionMenu({ user, onBan, onUnban, onDelete }: {
  user: User; onBan: () => void; onUnban: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
            <Link href={`/professionals/${user.user_id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              View Profile
            </Link>
            {user.status === 'BANNED' ? (
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setOpen(false); onUnban(); }}>Unban User</button>
            ) : (
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setOpen(false); onBan(); }}>Ban User</button>
            )}
            <div className="my-1 border-t border-gray-100" />
            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setOpen(false); onDelete(); }}>Permanently Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

const ROLES = ['Nurse', 'Doctor', 'Pharmacist', 'Lab Technician', 'Physiotherapist', 'Radiologist', 'Other'];

export default function ProfessionalsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', username: '',
    phone_number: '', primary_role: '', specialty: '',
  });
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const qs = buildQueryString({ type: 'PROFESSIONAL', status, search, page, limit: 15 });
  const { data, mutate } = useSWR(`/users${qs}`, fetcher);

  const handleBan = async () => {
    if (!banModal) return;
    try { await api.post(`/users/${banModal.user_id}/ban`, { reason: banReason }); await mutate(); setBanModal(null); setBanReason(''); } catch {}
  };

  const handleUnban = async (userId: string) => {
    try { await api.post(`/users/${userId}/unban`); await mutate(); } catch {}
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Permanently delete this professional?')) return;
    try { await api.delete(`/users/${userId}`); await mutate(); } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true); setAddError('');
    try {
      await api.post('/users', { ...form, user_type: 'PROFESSIONAL' });
      await mutate(); setAddModal(false);
      setForm({ first_name: '', last_name: '', email: '', password: '', username: '', phone_number: '', primary_role: '', specialty: '' });
    } catch (err: any) { setAddError(err.message || 'Failed to add professional'); }
    setAddLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-52"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
        <Select
          options={ROLES.map(r => ({ value: r, label: r }))}
          placeholder="Role / Specialty"
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'BANNED', label: 'Banned' },
            { value: 'SUSPENDED', label: 'Suspended' },
            { value: 'PENDING', label: 'Pending' },
          ]}
          placeholder="Status"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-36"
        />
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </Button>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Professional
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Professionals</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/40">
              {['Full Name', 'Email', 'Joined Date', 'Role', 'Last Active', 'Status', 'Action'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.data || []).map(user => {
              const profile = (user as any).profile;
              return (
                <tr key={user.user_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={user.first_name} lastName={user.last_name} imageUrl={user.profile_image_url} size="sm" />
                      <Link href={`/professionals/${user.user_id}`} className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                        {user.first_name} {user.last_name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{user.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(user.joined_date)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{profile?.primary_role || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(user.last_active)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={statusVariant[user.status] || 'gray'}>{user.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionMenu user={user} onBan={() => setBanModal(user)} onUnban={() => handleUnban(user.user_id)} onDelete={() => handleDelete(user.user_id)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.data?.length && (
          <div className="py-16 text-center text-gray-400">No professionals found</div>
        )}
        {data && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={15} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={!!banModal} onClose={() => setBanModal(null)} title="Ban Professional">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Banning <strong className="text-gray-900">{banModal?.first_name} {banModal?.last_name}</strong> will prevent platform access.
          </p>
          <textarea value={banReason} onChange={e => setBanReason(e.target.value)} rows={3} placeholder="Reason..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/40" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setBanModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} disabled={!banReason.trim()}>Ban</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Professional" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name *" value={form.first_name} onChange={e => setF('first_name', e.target.value)} required />
            <Input label="Last Name *" value={form.last_name} onChange={e => setF('last_name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Username *" value={form.username} onChange={e => setF('username', e.target.value)} required />
            <Input label="Email *" type="email" value={form.email} onChange={e => setF('email', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password *" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setF('password', e.target.value)} required />
            <Input label="Phone Number" value={form.phone_number} onChange={e => setF('phone_number', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Primary Role" options={ROLES.map(r => ({ value: r, label: r }))} placeholder="Select role" value={form.primary_role} onChange={e => setF('primary_role', e.target.value)} />
            <Input label="Specialty" placeholder="e.g. Cardiology" value={form.specialty} onChange={e => setF('specialty', e.target.value)} />
          </div>
          {addError && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</div>}
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={addLoading}>Add Professional</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
