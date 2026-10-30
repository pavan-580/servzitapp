import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class SendQuotationDto {
  @IsString() @Matches(/^\d{1,12}$/)
  amountMinor!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  note?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(24) @Max(720)
  expiresInHours = 168;
}
