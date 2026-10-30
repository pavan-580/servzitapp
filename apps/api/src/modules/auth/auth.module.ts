import { Global, Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpVerificationService } from './otp-verification.service';
import { SessionTokenService } from './session-token.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpVerificationService, SessionTokenService, AccessTokenGuard],
  exports: [AccessTokenGuard, SessionTokenService],
})
export class AuthModule {}
