'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Business, PaginatedResponse } from '@/types';

const fetcher = (url: string) => api.get<PaginatedResponse<Business>>(url);

export default function NewShiftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const { data: businesses } = useSWR('/businesses?limit=100', fetcher);

  const [form, setForm] = useState({
    shift_title: '', business_id: '', location: '', shift_date: '',
    shift_start_time: '', shift_end_time: '', shift_type: 'ACCEPT_PENDING_REVIEW',
    verification_level_required: 1, qualifications_required: '',
    contact_person_name: '', contact_person_email: '', additional_info: '',
    pay_rate: '', pay_type: 'PER_HOUR', payment_timeline: '',
    request_document_uploads: false, flexible_rate_allowed: false,
  });

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const toggleJobType = (t: string) => setJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const togglePayment = (m: string) => setPaymentMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_id) {
      setError('Select a business before posting the shift.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/shifts', {
        shift_title: form.shift_title.trim(),
        business_id: form.business_id,
        location: form.location.trim() || undefined,
        shift_date: form.shift_date || undefined,
        shift_start_time: form.shift_start_time || undefined,
        shift_end_time: form.shift_end_time || undefined,
        shift_type: form.shift_type,
        contact_person_name: form.contact_person_name.trim() || undefined,
        contact_person_email: form.contact_person_email.trim() || undefined,
        additional_info: form.additional_info.trim() || undefined,
        pay_rate: parseFloat(form.pay_rate) || undefined,
        pay_type: form.pay_type,
        payment_timeline: form.payment_timeline || undefined,
        request_document_uploads: form.request_document_uploads,
        flexible_rate_allowed: form.flexible_rate_allowed,
        verification_level_required: Number(form.verification_level_required),
        required_skills: skills,
        job_types: jobTypes,
        payment_methods: paymentMethods,
        qualifications_required: form.qualifications_required ? [form.qualifications_required] : [],
      });
      router.push('/shifts');
    } catch (err: any) {
      setError(err.message || 'Failed to create shift');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Post a New Shift</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">1. Shift Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Role Title *" placeholder="e.g. ER Nurse" value={form.shift_title} onChange={e => set('shift_title', e.target.value)} required />
            <Select
              label="Business *"
              placeholder="Select business"
              value={form.business_id}
              onChange={e => set('business_id', e.target.value)}
              options={(businesses?.data || []).map(business => ({
                value: business.business_id,
                label: business.business_name || business.email,
              }))}
              required
            />
            <Input label="Location" placeholder="Address, City, State" value={form.location} onChange={e => set('location', e.target.value)} className="sm:col-span-2" />
            <Input label="Shift Date" type="date" value={form.shift_date} onChange={e => set('shift_date', e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Start Time" type="time" value={form.shift_start_time} onChange={e => set('shift_start_time', e.target.value)} />
              <Input label="End Time" type="time" value={form.shift_end_time} onChange={e => set('shift_end_time', e.target.value)} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Shift Type</p>
            <div className="flex gap-4">
              {['INSTANT_ACCEPT', 'ACCEPT_PENDING_REVIEW'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shift_type" value={t} checked={form.shift_type === t} onChange={e => set('shift_type', e.target.value)} className="accent-teal-500" />
                  <span className="text-sm text-gray-600">{t === 'INSTANT_ACCEPT' ? 'Instant Accept' : 'Accept Pending Review'}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Job Type</p>
            <div className="flex flex-wrap gap-4">
              {['FULL_TIME', 'PART_TIME', 'VOLUNTEER', 'SHIFTS', 'REMOTE'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={jobTypes.includes(t)} onChange={() => toggleJobType(t)} className="accent-teal-500 rounded" />
                  <span className="text-sm text-gray-600">{t.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">2. Requirements</h3>
          <Select label="Verification Level Required" options={[{ value: '1', label: 'Level 1' }, { value: '2', label: 'Level 2' }, { value: '3', label: 'Level 3' }]} value={String(form.verification_level_required)} onChange={e => set('verification_level_required', e.target.value)} />
          <Input label="Qualifications" placeholder="e.g. Master of Science in Nursing" value={form.qualifications_required} onChange={e => set('qualifications_required', e.target.value)} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type skill and press Enter"
                className="flex-1 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSkill}>Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-0.5 text-xs font-medium">
                    {s}
                    <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="ml-1 hover:text-teal-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3. Logistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Contact Person Name" placeholder="Dr. Sarah Johnson" value={form.contact_person_name} onChange={e => set('contact_person_name', e.target.value)} />
            <Input label="Contact Email" type="email" placeholder="contact@hospital.com" value={form.contact_person_email} onChange={e => set('contact_person_email', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Additional Info</label>
            <textarea
              value={form.additional_info}
              onChange={e => set('additional_info', e.target.value)}
              rows={3}
              placeholder="Epic EMR competency required, bring your scrubs..."
              className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
            />
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">4. Payment & Terms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Pay Rate ($)" type="number" placeholder="95" value={form.pay_rate} onChange={e => set('pay_rate', e.target.value)} />
            <Select label="Rate Type" options={[{ value: 'PER_HOUR', label: 'Per Hour' }, { value: 'PER_SESSION', label: 'Per Session' }]} value={form.pay_type} onChange={e => set('pay_type', e.target.value)} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Payment Methods</p>
            <div className="flex flex-wrap gap-4">
              {['CASH', 'CARD', 'BANK_TRANSFER', 'OTHERS'].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={paymentMethods.includes(m)} onChange={() => togglePayment(m)} className="accent-teal-500 rounded" />
                  <span className="text-sm text-gray-600">{m.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <Select label="Payment Timeline" options={[{ value: 'Same Day', label: 'Same Day' }, { value: 'Next Day', label: 'Next Day' }, { value: 'Weekly', label: 'Weekly' }]} placeholder="Select timeline" value={form.payment_timeline} onChange={e => set('payment_timeline', e.target.value)} />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.request_document_uploads} onChange={e => set('request_document_uploads', e.target.checked)} className="accent-teal-500 rounded" />
              <span className="text-sm text-gray-600">Request Document Uploads</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.flexible_rate_allowed} onChange={e => set('flexible_rate_allowed', e.target.checked)} className="accent-teal-500 rounded" />
              <span className="text-sm text-gray-600">Flexible Rate Allowed</span>
            </label>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Post Shift</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
