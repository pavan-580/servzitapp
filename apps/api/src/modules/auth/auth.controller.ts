import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedRequest, AccessTokenGuard } from './access-token.guard';
import { AuthService } from './auth.service';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('session')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the signed-in user and current roles' })
  session(@Req() request: AuthenticatedRequest) { return { user: request.user }; }

  @Post('otp/request')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @ApiOperation({ summary: 'Send a phone verification code through the configured provider' })
  requestOtp(@Body() dto: RequestOtpDto) { return this.auth.requestOtp(dto.phoneE164); }

  @Post('otp/verify')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Verify phone OTP and create a customer session' })
  verifyOtp(@Body() dto: VerifyOtpDto) { return this.auth.verifyOtp(dto.phoneE164, dto.code); }

  @Post('session/refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Rotate a refresh token and session credential' })
  refresh(@Body() dto: RefreshSessionDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('session/logout')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current session' })
  logout(@Req() request: AuthenticatedRequest) { return this.auth.logout(request.user.sessionId, request.user.id); }
}
