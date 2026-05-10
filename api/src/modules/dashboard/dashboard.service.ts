import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private supabase: SupabaseService) {}

  async getMetrics() {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: activeUsers },
      { count: shiftsToday },
      { count: pendingVerifications },
    ] = await Promise.all([
      this.supabase.db.from('users').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      this.supabase.db.from('shifts').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      this.supabase.db.from('verifications').select('*', { count: 'exact', head: true }).eq('document_status', 'PENDING'),
    ]);

    const { data: revenueData } = await this.supabase.db
      .from('dashboard_metrics')
      .select('subscription_revenue, advertisement_revenue')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const platformRevenue = revenueData
      ? Number(revenueData.subscription_revenue) + Number(revenueData.advertisement_revenue)
      : 0;

    return {
      activeUsers: activeUsers || 0,
      shiftsToday: shiftsToday || 0,
      platformRevenue,
      pendingVerifications: pendingVerifications || 0,
    };
  }

  async getRevenueChart() {
    const { data, error } = await this.supabase.db
      .from('dashboard_metrics')
      .select('month, subscription_revenue, advertisement_revenue, recorded_at')
      .order('recorded_at', { ascending: true })
      .limit(12);

    if (error) throw new BadRequestException(error.message);

    return data.map(row => ({
      month: row.month,
      subscription: Number(row.subscription_revenue),
      advertisement: Number(row.advertisement_revenue),
    }));
  }

  async getActivity() {
    const [verifications, shifts, users] = await Promise.all([
      this.supabase.db
        .from('verifications')
        .select('verification_id, document_status, verified_at, users(first_name, last_name)')
        .eq('document_status', 'APPROVED')
        .order('verified_at', { ascending: false })
        .limit(2),
      this.supabase.db
        .from('shifts')
        .select('shift_id, shift_title, status, accepted_at, professionals(users(first_name, last_name))')
        .eq('status', 'ACCEPTED')
        .order('accepted_at', { ascending: false })
        .limit(2),
      this.supabase.db
        .from('users')
        .select('user_id, first_name, last_name, user_type, joined_date')
        .order('joined_date', { ascending: false })
        .limit(2),
    ]);

    const activities = [];

    (verifications.data || []).forEach(v => {
      const name = v.users ? `${(v.users as any).first_name} ${(v.users as any).last_name}` : 'User';
      activities.push({
        id: v.verification_id,
        type: 'verification',
        message: `Verification Approved — ${name}'s profile has been approved.`,
        timestamp: v.verified_at,
      });
    });

    (shifts.data || []).forEach(s => {
      const pro = s.professionals as any;
      const name = pro?.users ? `${pro.users.first_name} ${pro.users.last_name}` : 'Professional';
      activities.push({
        id: s.shift_id,
        type: 'shift',
        message: `Shift Accepted — ${name} accepted '${s.shift_title}' shift.`,
        timestamp: s.accepted_at,
      });
    });

    (users.data || []).forEach(u => {
      activities.push({
        id: u.user_id,
        type: 'registration',
        message: `New ${u.user_type === 'PROFESSIONAL' ? 'Professional' : 'User'} Registered — ${u.first_name} ${u.last_name} joined.`,
        timestamp: u.joined_date,
      });
    });

    return activities
      .filter(a => a.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }

  async getRecentShifts() {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .select(`
        shift_id, shift_title, shift_date, shift_start_time, shift_end_time, status,
        businesses(business_name, business_logo_url),
        professionals(users(first_name, last_name))
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
