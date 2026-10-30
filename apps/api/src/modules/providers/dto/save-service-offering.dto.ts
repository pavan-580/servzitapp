import { IsIn, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class SaveServiceOfferingDto {
  @IsUUID()
  serviceId!: string;

  @IsIn(['fixed', 'inspection', 'quote'])
  pricingModel!: 'fixed' | 'inspection' | 'quote';

  @IsOptional() @IsString() @Matches(/^\d{1,12}$/)
  priceMinor?: string;

  @IsOptional() @IsString() @Matches(/^[A-Z]{3}$/)
  currency = 'INR';
}
