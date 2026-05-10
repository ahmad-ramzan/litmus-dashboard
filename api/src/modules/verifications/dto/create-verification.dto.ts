import { IsOptional, IsString } from 'class-validator';

export class CreateVerificationDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  business_id?: string;

  @IsString()
  verification_type: string;

  @IsOptional()
  @IsString()
  verification_level?: string;

  @IsOptional()
  @IsString()
  document_url?: string;
}
