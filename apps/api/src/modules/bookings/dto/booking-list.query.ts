import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class BookingListQuery {
  @Type(() => Number) @IsOptional() @IsInt() @Min(1) @Max(100000)
  page = 1;

  @Type(() => Number) @IsOptional() @IsInt() @Min(1) @Max(50)
  limit = 20;
}
