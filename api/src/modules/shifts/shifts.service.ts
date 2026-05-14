import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const ascending = query.sortOrder === 'asc';

    let q = this.supabase.db
      .from('shifts')
      .select(`
        shift_id, shift_title, location, shift_date, shift_start_time, shift_end_time,
        status, shift_type, pay_rate, pay_type, applicant_count, is_boosted, created_at,
        businesses!inner(business_id, business_name, business_logo_url),
        professionals(professional_id, users(first_name, last_name, profile_image_url))
      `, { count: 'exact' })
      .order(sortBy, { ascending })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('status', query.status);
    if (query.search) {
      q = q.ilike('shift_title', `%${query.search}%`);
    }

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .select(`
        *,
        businesses(business_id, business_name, business_logo_url, email, phone_number),
        professionals(professional_id, title, primary_role, users(first_name, last_name, email, profile_image_url))
      `)
      .eq('shift_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Shift not found');
    return data;
  }

  async create(dto: CreateShiftDto) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .insert({ ...dto, status: 'OPEN' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateShiftDto) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('shift_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('shifts')
      .delete()
      .eq('shift_id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Shift deleted' };
  }

  async accept(id: string, body: { professionalId: string }) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .update({
        status: 'ACCEPTED',
        professional_id: body.professionalId,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('shift_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Shift accepted', shift: data };
  }

  async complete(id: string) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
      .eq('shift_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Shift marked as completed', shift: data };
  }

  async cancel(id: string) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('shift_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Shift cancelled', shift: data };
  }

  async boost(id: string) {
    const { data, error } = await this.supabase.db
      .from('shifts')
      .update({ is_boosted: true, updated_at: new Date().toISOString() })
      .eq('shift_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Shift boosted', shift: data };
  }

  async export(query: { status?: string; search?: string } = {}) {
    let q = this.supabase.db
      .from('shifts')
      .select('shift_id, shift_title, location, shift_date, shift_start_time, shift_end_time, status, pay_rate, pay_type, applicant_count, created_at')
      .order('created_at', { ascending: false });

    if (query.status) q = q.eq('status', query.status);
    if (query.search) q = q.ilike('shift_title', `%${query.search}%`);

    const { data, error } = await q;

    if (error) throw new BadRequestException(error.message);

    const headers = ['ID', 'Title', 'Location', 'Date', 'Start', 'End', 'Status', 'Pay Rate', 'Pay Type', 'Applicants', 'Created'];
    const rows = data.map(s => [
      s.shift_id, s.shift_title, s.location, s.shift_date,
      s.shift_start_time, s.shift_end_time, s.status,
      s.pay_rate, s.pay_type, s.applicant_count, s.created_at,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
