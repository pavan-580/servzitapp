import { IsUUID } from 'class-validator';

export class LocalitiesQuery {
  @IsUUID()
  cityId!: string;
}
