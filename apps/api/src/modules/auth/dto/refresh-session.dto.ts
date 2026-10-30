import { IsJWT } from 'class-validator';

export class RefreshSessionDto {
  @IsJWT()
  refreshToken!: string;
}
