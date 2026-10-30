import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewProviderDto {
  @IsIn(['approve', 'reject', 'in_review'])
  decision!: 'approve' | 'reject' | 'in_review';

  @IsOptional() @IsString() @MaxLength(1000)
  note?: string;
}
