import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsInt, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class WeeklyAvailabilitySlotDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(7)
  isoWeekday!: number;

  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  opensAt!: string;

  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closesAt!: string;

  @IsString() @MaxLength(64)
  timeZone = 'Asia/Kolkata';
}

export class UpdateAvailabilityDto {
  @IsArray() @ArrayMaxSize(21) @ArrayUnique((slot: WeeklyAvailabilitySlotDto) => `${slot.isoWeekday}:${slot.opensAt}:${slot.closesAt}`) @ValidateNested({ each: true }) @Type(() => WeeklyAvailabilitySlotDto)
  slots!: WeeklyAvailabilitySlotDto[];
}
