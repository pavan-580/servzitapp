import { Type } from 'class-transformer';
import { IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export const providerAccountTypes = ['individual', 'service_company', 'retail_shop', 'business_owner', 'property_owner', 'agent', 'builder'] as const;
export type ProviderAccountType = typeof providerAccountTypes[number];

export class CreateProviderProfileDto {
  @IsIn(providerAccountTypes)
  accountType!: ProviderAccountType;

  @IsString() @MaxLength(120)
  businessName!: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @IsString() @MaxLength(120)
  addressLine!: string;

  @Type(() => Number) @IsLatitude()
  lat!: number;

  @Type(() => Number) @IsLongitude()
  lng!: number;

  @Type(() => Number) @IsInt() @Min(500) @Max(100000)
  serviceRadiusMeters = 10000;

  @IsOptional() @IsUUID()
  localityId?: string;
}
