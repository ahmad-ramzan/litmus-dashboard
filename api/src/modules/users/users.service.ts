import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../database/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: {
    type?: string;
    status?: string;
    search?: string;
    role?: string;
    businessType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    let filteredUserIds: string[] | undefined;

    if (query.type === 'PROFESSIONAL' && query.role) {
      const { data: professionals, error } = await this.supabase.db
        .from('professionals')
        .select('professional_id')
        .or(`primary_role.ilike.%${query.role}%,specialty.ilike.%${query.role}%`);

      if (error) throw new BadRequestException(error.message);

      filteredUserIds = (professionals || []).map(professional => professional.professional_id);
      if (!filteredUserIds.length) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    } else if (query.type === 'BUSINESS' && query.businessType) {
      const { data: businesses, error } = await this.supabase.db
        .from('businesses')
        .select('admin_user_id')
        .ilike('business_type', `%${query.businessType}%`);

      if (error) throw new BadRequestException(error.message);

      filteredUserIds = (businesses || [])
        .map(business => business.admin_user_id)
        .filter((userId): userId is string => Boolean(userId));
      if (!filteredUserIds.length) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    let q = this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, profile_image_url, joined_date, last_active, status, user_type, role, verification_level, rating, review_count, ban_reason', { count: 'exact' })
      .order('joined_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.type) q = q.eq('user_type', query.type);
    if (query.status) q = q.eq('status', query.status);
    if (filteredUserIds) q = q.in('user_id', filteredUserIds);
    if (query.search) {
      q = q.or(`username.ilike.%${query.search}%,email.ilike.%${query.search}%,first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%`);
    }

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    const users = data || [];
    const userIds = users.map(user => user.user_id);
    let profileByUserId = new Map<string, any>();

    if (userIds.length && query.type === 'PROFESSIONAL') {
      const { data: profiles, error: profileError } = await this.supabase.db
        .from('professionals')
        .select('*')
        .in('professional_id', userIds);

      if (profileError) throw new BadRequestException(profileError.message);
      profileByUserId = new Map((profiles || []).map(profile => [profile.professional_id, profile]));
    } else if (userIds.length && query.type === 'BUSINESS') {
      const { data: profiles, error: profileError } = await this.supabase.db
        .from('businesses')
        .select('*')
        .in('admin_user_id', userIds);

      if (profileError) throw new BadRequestException(profileError.message);
      profileByUserId = new Map((profiles || []).map(profile => [profile.admin_user_id, profile]));
    }

    return {
      data: users.map(user => ({ ...user, profile: profileByUserId.get(user.user_id) || null })),
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async create(dto: CreateUserDto) {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const { data: user, error: userError } = await this.supabase.db
      .from('users')
      .insert({
        username: dto.username,
        email: dto.email,
        password_hash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        phone_number: dto.phone_number || null,
        user_type: dto.user_type,
        role: dto.role || dto.primary_role || dto.business_type || null,
        status: 'ACTIVE',
      })
      .select('user_id, username, email, first_name, last_name, phone_number, profile_image_url, joined_date, last_active, status, user_type, role, verification_level, rating, review_count, ban_reason')
      .single();

    if (userError) throw new BadRequestException(userError.message);

    try {
      if (dto.user_type === 'PROFESSIONAL') {
        const { error } = await this.supabase.db
          .from('professionals')
          .insert({
            professional_id: user.user_id,
            primary_role: dto.primary_role || null,
            specialty: dto.specialty || null,
          });

        if (error) throw error;
      } else if (dto.user_type === 'BUSINESS') {
        const { error } = await this.supabase.db
          .from('businesses')
          .insert({
            business_name: dto.business_name || `${dto.first_name} ${dto.last_name}`,
            email: dto.email,
            phone_number: dto.phone_number || null,
            business_type: dto.business_type || null,
            country: dto.country || null,
            website_url: dto.website_url || null,
            admin_user_id: user.user_id,
            status: 'ACTIVE',
          });

        if (error) throw error;
      } else if (dto.user_type === 'ADMIN') {
        const { error } = await this.supabase.db
          .from('admin_users')
          .insert({
            admin_id: user.user_id,
            role: dto.role || 'Admin',
          });

        if (error) throw error;
      }
    } catch (error: any) {
      await this.supabase.db.from('users').delete().eq('user_id', user.user_id);
      throw new BadRequestException(error.message || 'Failed to create user profile');
    }

    return this.findOne(user.user_id);
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
    const { data: existingUser, error: existingError } = await this.supabase.db
      .from('users')
      .select('user_id, user_type')
      .eq('user_id', id)
      .single();

    if (existingError || !existingUser) throw new NotFoundException('User not found');

    const { profile, ...userDto } = dto as UpdateUserDto & { profile?: Record<string, any> };
    const allowedUserFields = [
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'profile_image_url',
      'status',
      'role',
    ];
    const userUpdate = Object.fromEntries(
      Object.entries(userDto).filter(([key, value]) => allowedUserFields.includes(key) && value !== undefined),
    );

    if (Object.keys(userUpdate).length) {
      const { error } = await this.supabase.db
        .from('users')
        .update({ ...userUpdate, updated_at: new Date().toISOString() })
        .eq('user_id', id);

      if (error) throw new BadRequestException(error.message);
    }

    if (profile && existingUser.user_type === 'PROFESSIONAL') {
      const professionalUpdate = {
        primary_role: profile.primary_role,
        specialty: profile.specialty,
        year_of_experience: profile.year_of_experience ? String(profile.year_of_experience) : undefined,
        license_number: profile.license_number,
        certifications: profile.certifications,
        about_me: profile.about_me || profile.about,
      };
      const cleanUpdate = Object.fromEntries(
        Object.entries(professionalUpdate).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(cleanUpdate).length) {
        const { error } = await this.supabase.db
          .from('professionals')
          .update({ ...cleanUpdate, updated_at: new Date().toISOString() })
          .eq('professional_id', id);

        if (error) throw new BadRequestException(error.message);
      }
    } else if (profile && existingUser.user_type === 'BUSINESS') {
      const businessUpdate = {
        business_name: profile.business_name,
        email: profile.email,
        phone_number: profile.phone_number,
        business_type: profile.business_type,
        country: profile.country,
        year_established: profile.year_established || profile.year_of_business,
        website_url: profile.website_url,
        business_specialties: profile.business_specialties || profile.certifications,
        business_areas: profile.business_areas || profile.service_areas,
        about_business: profile.about_business || profile.about,
      };
      const cleanUpdate = Object.fromEntries(
        Object.entries(businessUpdate).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(cleanUpdate).length) {
        const { error } = await this.supabase.db
          .from('businesses')
          .update({ ...cleanUpdate, updated_at: new Date().toISOString() })
          .eq('admin_user_id', id);

        if (error) throw new BadRequestException(error.message);
      }
    }

    return this.findOne(id);
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

  async export(query: {
    type?: string;
    status?: string;
    search?: string;
    role?: string;
    businessType?: string;
  } = {}) {
    let filteredUserIds: string[] | undefined;

    if (query.type === 'PROFESSIONAL' && query.role) {
      const { data: professionals, error } = await this.supabase.db
        .from('professionals')
        .select('professional_id')
        .or(`primary_role.ilike.%${query.role}%,specialty.ilike.%${query.role}%`);

      if (error) throw new BadRequestException(error.message);

      filteredUserIds = (professionals || []).map(professional => professional.professional_id);
      if (!filteredUserIds.length) return 'ID,Username,Email,First Name,Last Name,Phone,Joined,Last Active,Status,Type,Role,Verification,Rating,Reviews';
    } else if (query.type === 'BUSINESS' && query.businessType) {
      const { data: businesses, error } = await this.supabase.db
        .from('businesses')
        .select('admin_user_id')
        .ilike('business_type', `%${query.businessType}%`);

      if (error) throw new BadRequestException(error.message);

      filteredUserIds = (businesses || [])
        .map(business => business.admin_user_id)
        .filter((userId): userId is string => Boolean(userId));
      if (!filteredUserIds.length) return 'ID,Username,Email,First Name,Last Name,Phone,Joined,Last Active,Status,Type,Role,Verification,Rating,Reviews';
    }

    let q = this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, joined_date, last_active, status, user_type, role, verification_level, rating, review_count')
      .order('joined_date', { ascending: false });

    if (query.type) q = q.eq('user_type', query.type);
    if (query.status) q = q.eq('status', query.status);
    if (filteredUserIds) q = q.in('user_id', filteredUserIds);
    if (query.search) {
      q = q.or(`username.ilike.%${query.search}%,email.ilike.%${query.search}%,first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%`);
    }

    const { data, error } = await q;

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
