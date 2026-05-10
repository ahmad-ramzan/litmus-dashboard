import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ApproveVerificationDto, RejectVerificationDto, RequestMoreDocsDto } from './dto/review-verification.dto';

@Injectable()
export class VerificationsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: { status?: string; type?: string; level?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = this.supabase.db
      .from('verifications')
      .select(`
        verification_id, verification_type, verification_level, document_url,
        document_status, submitted_at, verified_at, rejection_reason, notes, created_at,
        users(user_id, first_name, last_name, email, profile_image_url, last_active),
        businesses(business_id, business_name, email)
      `, { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('document_status', query.status);
    if (query.type) q = q.eq('verification_type', query.type);
    if (query.level) q = q.eq('verification_level', query.level);

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('verifications')
      .select(`
        *,
        users(user_id, first_name, last_name, email, profile_image_url),
        businesses(business_id, business_name, email)
      `)
      .eq('verification_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Verification not found');
    return data;
  }

  async create(dto: CreateVerificationDto) {
    const { data, error } = await this.supabase.db
      .from('verifications')
      .insert({ ...dto, document_status: 'PENDING' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async approve(id: string, adminId: string, dto: ApproveVerificationDto) {
    const { data: verification } = await this.supabase.db
      .from('verifications')
      .select('user_id, business_id')
      .eq('verification_id', id)
      .single();

    if (!verification) throw new NotFoundException('Verification not found');

    const { data, error } = await this.supabase.db
      .from('verifications')
      .update({
        document_status: 'APPROVED',
        verified_at: new Date().toISOString(),
        verified_by_admin_id: adminId,
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('verification_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    if (verification.user_id) {
      await this.supabase.db
        .from('users')
        .update({ verification_level: 'LEVEL_2', updated_at: new Date().toISOString() })
        .eq('user_id', verification.user_id);
    }
    if (verification.business_id) {
      await this.supabase.db
        .from('businesses')
        .update({ verification_level: 'LEVEL_2', updated_at: new Date().toISOString() })
        .eq('business_id', verification.business_id);
    }

    return { message: 'Verification approved', verification: data };
  }

  async reject(id: string, adminId: string, dto: RejectVerificationDto) {
    const { data, error } = await this.supabase.db
      .from('verifications')
      .update({
        document_status: 'REJECTED',
        rejection_reason: dto.reason,
        verified_by_admin_id: adminId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('verification_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Verification rejected', verification: data };
  }

  async requestMore(id: string, dto: RequestMoreDocsDto) {
    const { data, error } = await this.supabase.db
      .from('verifications')
      .update({
        document_status: 'REQUEST_MORE_DOCS',
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('verification_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'More documents requested', verification: data };
  }
}
