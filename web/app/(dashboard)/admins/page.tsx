'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse, AdminUser, AdminRole } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<AdminUser>>(url);

const roleVariant: Record<AdminRole, 'danger' | 'info' | 'success' | 'warning' | 'purple' | 'gray'> = {
  SUPER_ADMIN: 'danger',
  ADMIN: 'info',
  SHIFT_COORDINATOR: 'success',
  CREDENTIALING_MANAGER: 'warning',
  SUPPORT_AGENT: 'purple',
  FINANCE_MANAGER: 'gray',
};

const ADMIN_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SHIFT_COORDINATOR', label: 'Shift Coordinator' },
  { value: 'CREDENTIALING_MANAGER', label: 'Credentialing Manager' },
  { value: 'SUPPORT_AGENT', label: 'Support Agent' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
];

export default function AdminsPage() {
  const { data, mutate } = useSWR('/admin', fetcher);
  const [addModal, setAddModal] = useState(false);
  const [loading, setLoading] = useState('');
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', email: '',
    password: '', admin_role: 'ADMIN' as AdminRole,
    send_welcome_email: false,
  });
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('create');
    setError('');
    try {
      await api.post('/admin', form);
      await mutate();
      setAddModal(false);
      setForm({ username: '', first_name: '', last_name: '', email: '', password: '', admin_role: 'ADMIN', send_welcome_email: false });
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    }
    setLoading('');
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm('Remove this admin user?')) return;
    setLoading(adminId);
    try { await api.delete(`/admin/${adminId}`); await mutate(); } catch {}
    setLoading('');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setAddModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Admin
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Admin', 'Email', 'Role', 'Assigned', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.data || []).map(admin => {
              const user = admin.users;
              return (
                <tr key={admin.admin_id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={user?.first_name} lastName={user?.last_name} imageUrl={user?.profile_image_url} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-400">@{user?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user?.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[admin.admin_role] || 'gray'}>{admin.admin_role.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(admin.assigned_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user?.status === 'ACTIVE' ? 'success' : 'gray'}>{user?.status || 'ACTIVE'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-40"
                      disabled={loading === admin.admin_id}
                      onClick={() => handleDelete(admin.admin_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data?.data?.length && (
          <div className="py-16 text-center text-gray-400">No admin users found</div>
        )}
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Admin User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            <Input label="Last Name" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
          </div>
          <Input label="Username" value={form.username} onChange={e => set('username', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
          <Select label="Role" options={ADMIN_ROLES} value={form.admin_role} onChange={e => set('admin_role', e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.send_welcome_email}
              onChange={e => set('send_welcome_email', e.target.checked)}
              className="rounded border-gray-300 text-teal-500 focus:ring-teal-400"
            />
            <span className="text-sm text-gray-600">Send welcome email</span>
          </label>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={loading === 'create'}>Create Admin</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
