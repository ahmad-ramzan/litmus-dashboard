import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { VerificationsModule } from './modules/verifications/verifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProfessionalsModule,
    BusinessesModule,
    ShiftsModule,
    VerificationsModule,
    ReviewsModule,
    AdminModule,
    DashboardModule,
  ],
})
export class AppModule {}
