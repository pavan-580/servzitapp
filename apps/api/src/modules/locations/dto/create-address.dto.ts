import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsOptional() @IsString() @MaxLength(40)
  label = 'Home';

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5)
  @IsString({ each: true }) @MaxLength(120, { each: true })
  addressLines!: string[];

  @Type(() => Number) @IsLatitude()
  lat!: number;

  @Type(() => Number) @IsLongitude()
  lng!: number;

  @IsOptional() @IsUUID()
  localityId?: string;

  @IsOptional() @IsUUID()
  postalCodeId?: string;

  @IsOptional() @IsBoolean()
  isDefault = false;
}
