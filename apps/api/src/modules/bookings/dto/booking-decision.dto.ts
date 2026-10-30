import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class BookingDecisionDto {
  @IsIn(['accept', 'reject'])
  decision!: 'accept' | 'reject';

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}
