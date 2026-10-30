import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateBookingDto {
  @IsOptional() @IsUUID()
  offeringId?: string;

  @IsOptional() @IsUUID()
  quotationId?: string;

  @IsUUID()
  addressId!: string;

  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  scheduledFor!: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(15) @Max(480)
  durationMinutes = 60;

  @IsOptional() @IsString() @MaxLength(1000)
  customerNote?: string;

  @IsOptional() @IsUUID()
  idempotencyKey?: string;
}
