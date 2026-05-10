'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentShifts } from '@/components/dashboard/RecentShifts';
import type { DashboardMetrics, RevenueData, ActivityItem, Shift } from '@/types';

const fetcher = (url: string) => api.get<any>(url);

export default function DashboardPage() {
  const { data: metrics } = useSWR<DashboardMetrics>('/dashboard/metrics', fetcher, { refreshInterval: 30000 });
  const { data: revenueChart } = useSWR<RevenueData[]>('/dashboard/revenue-chart', fetcher);
  const { data: activity } = useSWR<ActivityItem[]>('/dashboard/activity', fetcher, { refreshInterval: 30000 });
  const { data: recentShifts } = useSWR<Shift[]>('/dashboard/recent-shifts', fetcher, { refreshInterval: 30000 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers ?? '—'}
          color="teal"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Shifts Posted Today"
          value={metrics?.shiftsToday ?? '—'}
          color="blue"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Platform Revenue"
          value={metrics?.platformRevenue ? `$${metrics.platformRevenue.toLocaleString()}` : '—'}
          color="purple"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Pending Verifications"
          value={metrics?.pendingVerifications ?? '—'}
          color="yellow"
          trend="neutral"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={revenueChart || []} />
        </div>
        <div>
          <ActivityFeed items={activity || []} />
        </div>
      </div>

      <RecentShifts shifts={recentShifts || []} />
    </div>
  );
}
