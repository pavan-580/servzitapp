import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchCategoriesQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
