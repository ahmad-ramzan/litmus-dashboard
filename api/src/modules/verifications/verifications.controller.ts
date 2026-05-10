import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ApproveVerificationDto, RejectVerificationDto, RequestMoreDocsDto } from './dto/review-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('verifications')
@UseGuards(JwtAuthGuard)
export class VerificationsController {
  constructor(private verificationsService: VerificationsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.verificationsService.findAll({ status, type, level, page: +page || 1, limit: +limit || 20 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verificationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVerificationDto) {
    return this.verificationsService.create(dto);
  }

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser('user_id') adminId: string,
    @Body() dto: ApproveVerificationDto,
  ) {
    return this.verificationsService.approve(id, adminId, dto);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser('user_id') adminId: string,
    @Body() dto: RejectVerificationDto,
  ) {
    return this.verificationsService.reject(id, adminId, dto);
  }

  @Patch(':id/request-more')
  requestMore(@Param('id') id: string, @Body() dto: RequestMoreDocsDto) {
    return this.verificationsService.requestMore(id, dto);
  }
}
