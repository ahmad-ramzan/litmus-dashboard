'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/auth';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/professionals': 'Professionals',
  '/businesses': 'Business',
  '/admins': 'Admin Users',
  '/shifts': 'Shifts',
  '/shifts/new': 'Create Shift',
  '/verifications': 'Verifications',
  '/reviews': 'Reviews',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/audit': 'Audit Logs',
  '/settings': 'Settings',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('litmus_token') : null;
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  const title = Object.entries(pageTitles).find(([key]) =>
    key === '/' ? pathname === '/' : pathname.startsWith(key),
  )?.[1] || 'Litmus';

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
