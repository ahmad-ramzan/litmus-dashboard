import { IsOptional, IsString } from 'class-validator';

export class ApproveVerificationDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectVerificationDto {
  @IsString()
  reason: string;
}

export class RequestMoreDocsDto {
  @IsString()
  notes: string;
}
