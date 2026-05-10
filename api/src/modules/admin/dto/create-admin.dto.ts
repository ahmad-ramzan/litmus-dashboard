import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'SHIFT_COORDINATOR', 'CREDENTIALING_MANAGER', 'SUPPORT_AGENT', 'FINANCE_MANAGER'])
  admin_role: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  send_welcome_email?: boolean;
}
