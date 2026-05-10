import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(query: { entityType?: string; entityId?: string; status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = this.supabase.db
      .from('reviews')
      .select(`
        review_id, entity_type, rating, comment, helpful_count, review_date, status, created_at,
        users!reviewer_id(user_id, first_name, last_name, profile_image_url),
        professionals(professional_id, primary_role, users!professional_id(first_name, last_name)),
        businesses(business_id, business_name)
      `, { count: 'exact' })
      .order('review_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.entityType) q = q.eq('entity_type', query.entityType);
    if (query.entityId) {
      if (query.entityType === 'PROFESSIONAL') {
        q = q.eq('professional_id', query.entityId);
      } else {
        q = q.eq('business_id', query.entityId);
      }
    }
    if (query.status) q = q.eq('status', query.status);

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('reviews')
      .select('*, users!reviewer_id(*)')
      .eq('review_id', id)
      .single();

    if (error || !data) throw new NotFoundException('Review not found');
    return data;
  }

  async create(dto: CreateReviewDto) {
    const { data, error } = await this.supabase.db
      .from('reviews')
      .insert({ ...dto, status: 'PENDING' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async approve(id: string) {
    const { data: review } = await this.supabase.db
      .from('reviews')
      .select('entity_type, professional_id, business_id, rating')
      .eq('review_id', id)
      .single();

    if (!review) throw new NotFoundException('Review not found');

    const { data, error } = await this.supabase.db
      .from('reviews')
      .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
      .eq('review_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    await this.recalculateRating(review.entity_type, review.professional_id, review.business_id);

    return { message: 'Review approved', review: data };
  }

  async reject(id: string) {
    const { data, error } = await this.supabase.db
      .from('reviews')
      .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
      .eq('review_id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { message: 'Review rejected', review: data };
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('reviews')
      .delete()
      .eq('review_id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Review deleted' };
  }

  private async recalculateRating(entityType: string, professionalId: string, businessId: string) {
    const table = entityType === 'PROFESSIONAL' ? 'reviews' : 'reviews';
    const filterKey = entityType === 'PROFESSIONAL' ? 'professional_id' : 'business_id';
    const filterId = entityType === 'PROFESSIONAL' ? professionalId : businessId;

    const { data } = await this.supabase.db
      .from('reviews')
      .select('rating')
      .eq(filterKey, filterId)
      .eq('status', 'APPROVED');

    if (!data || data.length === 0) return;

    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    const count = data.length;

    if (entityType === 'PROFESSIONAL') {
      await this.supabase.db
        .from('users')
        .update({ rating: Math.round(avg * 100) / 100, review_count: count })
        .eq('user_id', professionalId);
    } else {
      await this.supabase.db
        .from('businesses')
        .update({ rating: Math.round(avg * 100) / 100, review_count: count })
        .eq('business_id', businessId);
    }
  }
}
