import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, profile_image_url, joined_date, last_active, status, user_type, role, verification_level, rating, review_count, ban_reason', { count: 'exact' })
      .order('joined_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.type) q = q.eq('user_type', query.type);
    if (query.status) q = q.eq('status', query.status);
    if (query.search) {
      q = q.or(`username.ilike.%${query.search}%,email.ilike.%${query.search}%,first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%`);
    }

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return {
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async findOne(id: string) {
    const { data: user, error } = await this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, profile_image_url, joined_date, last_active, status, user_type, role, verification_level, rating, review_count, ban_reason')
      .eq('user_id', id)
      .single();

    if (error || !user) throw new NotFoundException('User not found');

    let profile: any = null;
    if (user.user_type === 'PROFESSIONAL') {
      const { data } = await this.supabase.db
        .from('professionals')
        .select('*')
        .eq('professional_id', id)
        .single();
      profile = data;
    } else if (user.user_type === 'BUSINESS') {
      const { data } = await this.supabase.db
        .from('businesses')
        .select('*')
        .eq('admin_user_id', id)
        .single();
      profile = data;
    } else if (user.user_type === 'ADMIN') {
      const { data } = await this.supabase.db
        .from('admin_users')
        .select('*')
        .eq('admin_id', id)
        .single();
      profile = data;
    }

    return { ...user, profile };
  }

  async update(id: string, dto: UpdateUserDto) {
    const { data, error } = await this.supabase.db
      .from('users')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async ban(id: string, dto: BanUserDto) {
    const { data: user } = await this.supabase.db
      .from('users')
      .select('user_id')
      .eq('user_id', id)
      .single();
    if (!user) throw new NotFoundException('User not found');

    const { data, error } = await this.supabase.db
      .from('users')
      .update({ status: 'BANNED', ban_reason: dto.reason, updated_at: new Date().toISOString() })
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'User banned successfully', user: data };
  }

  async unban(id: string) {
    const { data, error } = await this.supabase.db
      .from('users')
      .update({ status: 'ACTIVE', ban_reason: null, updated_at: new Date().toISOString() })
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'User unbanned successfully', user: data };
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('users')
      .delete()
      .eq('user_id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'User permanently deleted' };
  }

  async export() {
    const { data, error } = await this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, joined_date, last_active, status, user_type, role, verification_level, rating, review_count')
      .order('joined_date', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    const headers = ['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Phone', 'Joined', 'Last Active', 'Status', 'Type', 'Role', 'Verification', 'Rating', 'Reviews'];
    const rows = data.map(u => [
      u.user_id, u.username, u.email, u.first_name, u.last_name,
      u.phone_number, u.joined_date, u.last_active, u.status,
      u.user_type, u.role, u.verification_level, u.rating, u.review_count,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
