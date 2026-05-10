import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { SupabaseService } from '../../database/supabase.service';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService, SupabaseService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
