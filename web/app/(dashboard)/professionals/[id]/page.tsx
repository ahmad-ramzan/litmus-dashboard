'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => api.get<any>(url);
const tabs = ['Personal Details', 'Verification', 'Reviews'];

const ROLES = ['Nurse', 'Doctor', 'Pharmacist', 'Lab Technician', 'Physiotherapist', 'Radiologist', 'Other'];
const SPECIALTIES = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Radiology', 'Emergency', 'ICU'];

export default function ProfessionalDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: user, mutate } = useSWR(`/users/${id}`, fetcher);
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    primary_role: '', specialty: '', year_of_experience: '',
    license_number: '', about: '',
  });
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');

  useEffect(() => {
    if (!user) return;
    const p = user.profile || {};
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      primary_role: p.primary_role || '',
      specialty: p.specialty || '',
      year_of_experience: p.year_of_experience ? String(p.year_of_experience) : '',
      license_number: p.license_number || '',
      about: p.about || '',
    });
    setCertifications(p.certifications || []);
  }, [user]);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.patch(`/users/${id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        profile: {
          primary_role: form.primary_role,
          specialty: form.specialty,
          year_of_experience: Number(form.year_of_experience) || undefined,
          license_number: form.license_number,
          certifications,
        },
      });
      await mutate();
    } catch {}
    setSaveLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const profile = user.profile || {};

  return (
    <div className="max-w-4xl space-y-0">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Professionals
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Teal banner */}
        <div className="h-36 bg-gradient-to-r from-teal-500 to-teal-400" />

        <div className="px-6 pb-0">
          <div className="flex items-end gap-4 -mt-12 mb-3">
            <Avatar
              firstName={user.first_name}
              lastName={user.last_name}
              imageUrl={user.profile_image_url}
              size="xl"
              className="border-4 border-white shadow-md"
            />
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {user.rating > 0 && (
                  <span className="text-sm text-yellow-500 font-semibold">★ {user.rating} ({user.review_count})</span>
                )}
                {user.verification_level === 'LEVEL_2' && (
                  <Badge variant="teal">Level 2: Verified</Badge>
                )}
              </div>
            </div>
            <div className="pb-2">
              <Button loading={saveLoading} onClick={handleSave}>Save Changes</Button>
            </div>
          </div>

          <div className="flex border-b border-gray-100 -mx-6 px-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab ? 'text-teal-600 border-teal-500' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          {/* ── Personal Details Tab ── */}
          {activeTab === 'Personal Details' && (
            <div className="space-y-7">
              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="FIRST NAME">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} value={form.first_name} onChange={v => setForm(p => ({ ...p, first_name: v }))} />
                  </FormField>
                  <FormField label="LAST NAME">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} value={form.last_name} onChange={v => setForm(p => ({ ...p, last_name: v }))} />
                  </FormField>
                  <FormField label="EMAIL">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
                  </FormField>
                  <FormField label="PHONE NUMBER">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} value={form.phone_number} onChange={v => setForm(p => ({ ...p, phone_number: v }))} />
                  </FormField>
                  <FormField label="JOINED">
                    <div className="border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50">{formatDate(user.joined_date)}</div>
                  </FormField>
                  <FormField label="RATING">
                    <div className="border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50">★ {user.rating || 0} ({user.review_count || 0})</div>
                  </FormField>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="PRIMARY ROLE*">
                    <select value={form.primary_role} onChange={e => setForm(p => ({ ...p, primary_role: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/40 bg-white">
                      <option value="">Select</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </FormField>
                  <FormField label="SPECIALTY">
                    <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/40 bg-white">
                      <option value="">Select</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>
                  <FormField label="YEARS EXPERIENCE">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} value={form.year_of_experience} onChange={v => setForm(p => ({ ...p, year_of_experience: v }))} />
                  </FormField>
                  <FormField label="LICENSE NUMBER">
                    <FieldInput icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} value={form.license_number} onChange={v => setForm(p => ({ ...p, license_number: v }))} />
                  </FormField>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {certifications.map(c => (
                    <span key={c} className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {c}
                      <button onClick={() => setCertifications(p => p.filter(x => x !== c))} className="text-teal-400 hover:text-teal-700 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (certInput.trim()) { setCertifications(p => [...p, certInput.trim()]); setCertInput(''); } } }}
                    placeholder="Certification name"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                  />
                  <Button size="sm" type="button" onClick={() => { if (certInput.trim()) { setCertifications(p => [...p, certInput.trim()]); setCertInput(''); } }}>Add</Button>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">About</h3>
                <textarea
                  value={form.about}
                  onChange={e => setForm(p => ({ ...p, about: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 resize-none"
                />
              </section>
            </div>
          )}

          {/* ── Verification Tab ── */}
          {activeTab === 'Verification' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm font-semibold text-gray-700">Verification Level</span>
                <Badge variant={user.verification_level === 'LEVEL_2' ? 'teal' : 'warning'}>
                  {user.verification_level === 'LEVEL_2' ? 'Level 2: Verified' : user.verification_level || 'Not Verified'}
                </Badge>
              </div>

              {[
                { key: 'gov_id', label: 'Government-Issued ID', verified: profile.government_id_verified, docUrl: profile.government_id_url },
                { key: 'license', label: 'Professional License', verified: profile.license_verified, docUrl: profile.license_document_url },
                { key: 'cert', label: 'Professional Certificate', verified: false, docUrl: null },
              ].map(doc => (
                <div key={doc.key} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{doc.label}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!doc.docUrl && !doc.verified}
                      className={!doc.docUrl && !doc.verified ? 'opacity-40 cursor-not-allowed' : ''}
                      onClick={async () => { await api.post(`/professionals/${id}/verify`); mutate(); }}
                    >
                      Mark As Verified
                    </Button>
                  </div>
                  {doc.docUrl ? (
                    <img src={doc.docUrl} alt="doc" className="h-20 w-28 object-cover rounded-lg border border-gray-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <p className="text-sm text-gray-400">No Document for review</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === 'Reviews' && (
            <ReviewsTab userId={id} rating={user.rating || 0} reviewCount={user.review_count || 0} />
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FieldInput({ icon, value, onChange }: { icon: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">{icon}</div>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 bg-white" />
    </div>
  );
}

function ReviewsTab({ userId, rating, reviewCount }: { userId: string; rating: number; reviewCount: number }) {
  const { data } = useSWR(`/reviews?entityId=${userId}&entityType=PROFESSIONAL&limit=12`, fetcher);
  const reviews = data?.data || [];
  const stars = [5, 4, 3, 2, 1];
  const counts = stars.map(s => reviews.filter((r: any) => Math.round(r.rating) === s).length);
  const max = Math.max(...counts, 1);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-800">Reviews</h3>
      <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-5 flex items-center gap-8">
        <div className="flex-1 space-y-1.5">
          {stars.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-xs text-yellow-500 w-3">{s}</span>
              <span className="text-yellow-400 text-sm">★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${(counts[i] / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-4xl font-bold text-gray-900">{rating.toFixed(1)}</p>
          <div className="flex gap-0.5 mt-1 justify-end">
            {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{reviewCount} Reviews</p>
        </div>
      </div>
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review: any) => {
            const reviewer = review.users;
            return (
              <div key={review.review_id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {reviewer?.first_name?.[0]}{reviewer?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : 'Anonymous'}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      )}
    </div>
  );
}
