import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('revenue-chart')
  getRevenueChart() {
    return this.dashboardService.getRevenueChart();
  }

  @Get('activity')
  getActivity() {
    return this.dashboardService.getActivity();
  }

  @Get('recent-shifts')
  getRecentShifts() {
    return this.dashboardService.getRecentShifts();
  }
}
