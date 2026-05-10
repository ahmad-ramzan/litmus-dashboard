import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  shift_title: string;

  @IsString()
  business_id: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  shift_date?: string;

  @IsOptional()
  @IsString()
  shift_start_time?: string;

  @IsOptional()
  @IsString()
  shift_end_time?: string;

  @IsOptional()
  @IsEnum(['INSTANT_ACCEPT', 'ACCEPT_PENDING_REVIEW'])
  shift_type?: string;

  @IsOptional()
  @IsArray()
  job_types?: string[];

  @IsOptional()
  @IsNumber()
  verification_level_required?: number;

  @IsOptional()
  @IsArray()
  qualifications_required?: string[];

  @IsOptional()
  @IsArray()
  required_skills?: string[];

  @IsOptional()
  @IsString()
  contact_person_name?: string;

  @IsOptional()
  @IsString()
  contact_person_email?: string;

  @IsOptional()
  @IsString()
  additional_info?: string;

  @IsOptional()
  @IsNumber()
  pay_rate?: number;

  @IsOptional()
  @IsEnum(['PER_HOUR', 'PER_SESSION'])
  pay_type?: string;

  @IsOptional()
  @IsArray()
  payment_methods?: string[];

  @IsOptional()
  @IsString()
  payment_timeline?: string;

  @IsOptional()
  @IsBoolean()
  request_document_uploads?: boolean;

  @IsOptional()
  @IsBoolean()
  flexible_rate_allowed?: boolean;
}
