import { Module } from '@nestjs/common';
import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';
import { SupabaseService } from '../../database/supabase.service';

@Module({
  controllers: [VerificationsController],
  providers: [VerificationsService, SupabaseService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
