'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => api.get<any>(url);

const tabs = ['Personal Details', 'Verification', 'Reviews'];

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: user, mutate } = useSWR(`/users/${id}`, fetcher);
  const [activeTab, setActiveTab] = useState('Personal Details');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const u = user as any;
  const profile = u.profile;

  return (
    <div className="max-w-4xl space-y-0">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Users
      </button>

      {/* Teal banner header */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-teal-500 to-teal-400 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {u.status !== 'BANNED' ? (
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={async () => {
                const reason = prompt('Ban reason:');
                if (reason) { await api.post(`/users/${id}/ban`, { reason }); mutate(); }
              }}>Ban</Button>
            ) : (
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={async () => { await api.post(`/users/${id}/unban`); mutate(); }}>Unban</Button>
            )}
            <Button size="sm" className="bg-white text-teal-700 hover:bg-teal-50">Edit Profile</Button>
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <Avatar
              firstName={u.first_name}
              lastName={u.last_name}
              imageUrl={u.profile_image_url}
              size="xl"
              className="border-4 border-white shadow-md"
            />
            <div className="pb-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{u.first_name} {u.last_name}</h2>
                <Badge variant={u.user_type === 'PROFESSIONAL' ? 'teal' : u.user_type === 'BUSINESS' ? 'purple' : 'info'}>
                  {u.user_type}
                </Badge>
                <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'BANNED' ? 'danger' : 'warning'}>
                  {u.status}
                </Badge>
                {u.verification_level === 'LEVEL_2' && (
                  <Badge variant="teal">
                    <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{u.email}</p>
              {u.rating > 0 && (
                <p className="text-sm text-yellow-600 font-medium mt-0.5">★ {u.rating} ({u.review_count} reviews)</p>
              )}
            </div>
          </div>

          {u.ban_reason && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <strong>Ban reason:</strong> {u.ban_reason}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100 -mx-6 px-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'text-teal-600 border-teal-500'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'Personal Details' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <InfoField label="Username" value={u.username} />
            <InfoField label="Phone" value={u.phone_number} />
            <InfoField label="Joined" value={formatDate(u.joined_date)} />
            <InfoField label="Last Active" value={formatDate(u.last_active)} />
            <InfoField label="Rating" value={u.rating ? `★ ${u.rating}` : '—'} />
            <InfoField label="Reviews" value={u.review_count || 0} />
          </div>

          {profile && u.user_type === 'PROFESSIONAL' && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Professional Profile</h3>
                <Button variant="outline" size="sm" onClick={async () => { await api.post(`/professionals/${id}/verify`); mutate(); }}>
                  Mark Verified
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Primary Role" value={profile.primary_role} />
                <InfoField label="Specialty" value={profile.specialty} />
                <InfoField label="Experience" value={profile.year_of_experience ? `${profile.year_of_experience} yrs` : undefined} />
                <InfoField label="License No." value={profile.license_number} />
              </div>
              {profile.certifications?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((c: string) => (
                      <Badge key={c} variant="teal">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profile && u.user_type === 'BUSINESS' && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Business Profile</h3>
                <Button variant="outline" size="sm" onClick={async () => { await api.post(`/businesses/${profile.business_id}/verify`); mutate(); }}>
                  Verify Business
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Business Name" value={profile.business_name} />
                <InfoField label="Type" value={profile.business_type} />
                <InfoField label="Country" value={profile.country} />
                <InfoField label="Website" value={profile.website_url} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Verification' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Verification Documents</h3>
          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VerificationCard
                label="Government ID"
                verified={profile.government_id_verified}
              />
              <VerificationCard
                label="Professional License"
                verified={profile.license_verified}
              />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No profile documents on file.</p>
          )}
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Reviews</h3>
          <p className="text-gray-400 text-sm">No reviews yet.</p>
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

function VerificationCard({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${verified ? 'border-teal-200 bg-teal-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <Badge variant={verified ? 'success' : 'gray'}>{verified ? 'Verified' : 'Pending'}</Badge>
      </div>
      {!verified && (
        <p className="text-xs text-gray-400">No document submitted yet.</p>
      )}
      {verified && (
        <p className="text-xs text-teal-600 font-medium">Document verified successfully</p>
      )}
    </div>
  );
}
