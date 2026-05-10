import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  reviewer_id: string;

  @IsOptional()
  @IsString()
  professional_id?: string;

  @IsOptional()
  @IsString()
  business_id?: string;

  @IsEnum(['PROFESSIONAL', 'BUSINESS'])
  entity_type: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
