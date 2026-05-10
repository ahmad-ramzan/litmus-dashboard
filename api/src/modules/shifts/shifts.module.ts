import { Module } from '@nestjs/common';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { SupabaseService } from '../../database/supabase.service';

@Module({
  controllers: [ShiftsController],
  providers: [ShiftsService, SupabaseService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
