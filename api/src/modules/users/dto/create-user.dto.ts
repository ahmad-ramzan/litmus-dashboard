import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsEnum(['PROFESSIONAL', 'BUSINESS', 'ADMIN'])
  user_type: string;

  @IsOptional()
  @IsString()
  role?: string;
}
