import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateQuotationDto {
  @IsUUID()
  offeringId!: string;

  @IsUUID()
  addressId!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  customerNote?: string;

  @IsOptional() @IsUUID()
  idempotencyKey?: string;
}
