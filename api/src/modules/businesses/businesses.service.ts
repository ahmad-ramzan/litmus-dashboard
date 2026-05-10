import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = this.supabase.db
      .from('businesses')
      .select('*', { count: 'exact' })
      .order('joined_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('status', query.status);
    if (query.search) {
      q = q.or(`business_name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
    }

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('businesses')
      .select('*')
      .eq('business_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Business not found');
    return data;
  }

  async create(dto: CreateBusinessDto) {
    const { data, error } = await this.supabase.db
      .from('businesses')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const { data, error } = await this.supabase.db
      .from('businesses')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('business_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('businesses')
      .delete()
      .eq('business_id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Business deleted' };
  }

  async verify(id: string) {
    const { data, error } = await this.supabase.db
      .from('businesses')
      .update({
        government_id_verified: true,
        business_registration_verified: true,
        business_license_verified: true,
        verification_level: 'LEVEL_2',
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Business verified successfully', business: data };
  }
}
