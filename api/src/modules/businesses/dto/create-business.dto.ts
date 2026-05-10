import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  business_name: string;

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
  country?: string;

  @IsOptional()
  @IsString()
  year_established?: string;

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

  @IsOptional()
  @IsString()
  admin_user_id?: string;
}
