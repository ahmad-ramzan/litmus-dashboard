import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  shift_title?: string;

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
  @IsEnum(['OPEN', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'FLAGGED'])
  status?: string;

  @IsOptional()
  @IsEnum(['INSTANT_ACCEPT', 'ACCEPT_PENDING_REVIEW'])
  shift_type?: string;

  @IsOptional()
  @IsArray()
  required_skills?: string[];

  @IsOptional()
  @IsNumber()
  pay_rate?: number;

  @IsOptional()
  @IsString()
  additional_info?: string;
}
