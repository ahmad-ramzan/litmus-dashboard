import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  business_type?: string;

  @IsOptional()
  @IsString()
  business_logo_url?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  year_established?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED', 'PENDING'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  government_id_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  business_registration_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  business_license_verified?: boolean;

  @IsOptional()
  @IsString()
  website_url?: string;

  @IsOptional()
  @IsArray()
  business_specialties?: string[];

  @IsOptional()
  @IsArray()
  business_areas?: string[];

  @IsOptional()
  @IsString()
  about_business?: string;
}
