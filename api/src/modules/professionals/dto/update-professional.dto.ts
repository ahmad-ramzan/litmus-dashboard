import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateProfessionalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  primary_role?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  year_of_experience?: string;

  @IsOptional()
  @IsArray()
  certifications?: string[];

  @IsOptional()
  @IsString()
  about_me?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsDateString()
  license_expiry?: string;

  @IsOptional()
  @IsBoolean()
  license_verified?: boolean;

  @IsOptional()
  @IsString()
  license_document_url?: string;

  @IsOptional()
  @IsBoolean()
  government_id_verified?: boolean;

  @IsOptional()
  @IsString()
  government_id_number?: string;

  @IsOptional()
  @IsString()
  government_id_document_url?: string;
}
