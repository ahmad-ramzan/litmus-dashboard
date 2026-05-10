import { IsString, MinLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @MinLength(5)
  reason: string;
}
