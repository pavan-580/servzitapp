import { IsIn } from 'class-validator';

export class QuotationResponseDto {
  @IsIn(['reject'])
  decision!: 'reject';
}
