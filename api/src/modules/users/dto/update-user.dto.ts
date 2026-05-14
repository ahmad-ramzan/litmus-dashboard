import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED', 'PENDING'])
  status?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  profile?: Record<string, any>;
}
