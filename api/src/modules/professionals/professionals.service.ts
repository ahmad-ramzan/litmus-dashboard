import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = this.supabase.db
      .from('professionals')
      .select(`
        professional_id, title, primary_role, specialty, year_of_experience,
        certifications, about_me, license_verified, government_id_verified,
        created_at,
        users!inner(user_id, username, email, first_name, last_name, status, verification_level, rating, review_count, profile_image_url, joined_date, last_active)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (query.search) {
      q = q.or(`primary_role.ilike.%${query.search}%,specialty.ilike.%${query.search}%`, { referencedTable: 'users' });
    }

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('professionals')
      .select(`
        *,
        users!inner(user_id, username, email, first_name, last_name, phone_number, profile_image_url, status, verification_level, rating, review_count, joined_date, last_active, ban_reason)
      `)
      .eq('professional_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Professional not found');
    return data;
  }

  async update(id: string, dto: UpdateProfessionalDto) {
    const { data, error } = await this.supabase.db
      .from('professionals')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('professional_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async verify(id: string) {
    const { data: professional } = await this.supabase.db
      .from('professionals')
      .select('professional_id')
      .eq('professional_id', id)
      .single();
    if (!professional) throw new NotFoundException('Professional not found');

    await this.supabase.db
      .from('professionals')
      .update({ license_verified: true, government_id_verified: true, updated_at: new Date().toISOString() })
      .eq('professional_id', id);

    await this.supabase.db
      .from('users')
      .update({ verification_level: 'LEVEL_2', updated_at: new Date().toISOString() })
      .eq('user_id', id);

    return { message: 'Professional verified successfully' };
  }
}
