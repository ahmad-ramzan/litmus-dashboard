import { IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateAdminDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @ValidateIf(dto => !dto.user_id)
  @IsString()
  username?: string;

  @ValidateIf(dto => !dto.user_id)
  @IsString()
  first_name?: string;

  @ValidateIf(dto => !dto.user_id)
  @IsString()
  last_name?: string;

  @ValidateIf(dto => !dto.user_id)
  @IsEmail()
  email?: string;

  @ValidateIf(dto => !dto.user_id)
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'SHIFT_COORDINATOR', 'CREDENTIALING_MANAGER', 'SUPPORT_AGENT', 'FINANCE_MANAGER'])
  admin_role?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  send_welcome_email?: boolean;
}
