import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SearchServicesQuery {
  @IsOptional() @IsUUID()
  categoryId?: string;

  @IsOptional() @IsString() @MaxLength(100)
  q?: string;
}
