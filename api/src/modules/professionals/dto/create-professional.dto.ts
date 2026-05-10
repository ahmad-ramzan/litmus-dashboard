import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  user_id: string;

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
  @IsString()
  license_document_url?: string;

  @IsOptional()
  @IsString()
  government_id_number?: string;

  @IsOptional()
  @IsString()
  government_id_document_url?: string;
}
