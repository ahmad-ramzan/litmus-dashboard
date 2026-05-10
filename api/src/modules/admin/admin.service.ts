import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../database/supabase.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase.db
      .from('admin_users')
      .select(`
        admin_id, admin_role, permissions, assigned_at,
        users!inner(user_id, username, email, first_name, last_name, profile_image_url, status, joined_date, last_active)
      `, { count: 'exact' })
      .order('assigned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('admin_users')
      .select(`
        *,
        users!inner(user_id, username, email, first_name, last_name, profile_image_url, status, joined_date, last_active)
      `)
      .eq('admin_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Admin user not found');
    return data;
  }

  async create(dto: CreateAdminDto) {
    const { send_welcome_email, password, admin_role, permissions, ...userFields } = dto;

    const password_hash = await bcrypt.hash(password, 10);

    const { data: existingUser } = await this.supabase.db
      .from('users')
      .select('user_id')
      .eq('email', dto.email)
      .single();

    if (existingUser) throw new BadRequestException('Email already in use');

    const { data: user, error: userError } = await this.supabase.db
      .from('users')
      .insert({
        ...userFields,
        password_hash,
        user_type: 'ADMIN',
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (userError) throw new BadRequestException(userError.message);

    const { data: adminUser, error: adminError } = await this.supabase.db
      .from('admin_users')
      .insert({
        admin_id: user.user_id,
        admin_role,
        permissions: permissions || [],
      })
      .select()
      .single();

    if (adminError) throw new BadRequestException(adminError.message);

    if (send_welcome_email) {
      console.log(`[EMAIL] Welcome email would be sent to ${dto.email} with role ${admin_role}`);
    }

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, adminUser };
  }

  async update(id: string, body: { admin_role?: string; permissions?: string[] }) {
    const { data, error } = await this.supabase.db
      .from('admin_users')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('admin_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('users')
      .delete()
      .eq('user_id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Admin user deleted' };
  }
}
