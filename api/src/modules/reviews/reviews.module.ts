import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SupabaseService } from '../../database/supabase.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, SupabaseService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
