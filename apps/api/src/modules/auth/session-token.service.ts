import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';

export interface SessionClaims { sub: string; sid: string; jti: string; tokenUse: 'access' | 'refresh' }

@Injectable()
export class SessionTokenService {
  private key(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): Uint8Array {
    const secret = process.env[name];
    if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
      throw new ServiceUnavailableException({ code: 'AUTH_NOT_CONFIGURED', message: 'Authentication is temporarily unavailable.' });
    }
    const otherName = name === 'JWT_ACCESS_SECRET' ? 'JWT_REFRESH_SECRET' : 'JWT_ACCESS_SECRET';
    if (process.env[otherName] && process.env[otherName] === secret) {
      throw new ServiceUnavailableException({ code: 'AUTH_NOT_CONFIGURED', message: 'Authentication is temporarily unavailable.' });
    }
    return new TextEncoder().encode(secret);
  }

  newId(): string { return randomUUID(); }

  async create(userId: string, sessionId: string, refreshJti = this.newId()): Promise<{
    accessToken: string; refreshToken: string; refreshJti: string; accessExpiresIn: number; refreshExpiresAt: Date;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const refreshExpiresAt = new Date((now + 30 * 24 * 60 * 60) * 1000);
    const accessToken = await new SignJWT({ tokenUse: 'access', sid: sessionId })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer('servzit-api').setAudience('servzit-client')
      .setIssuedAt(now).setExpirationTime(now + 15 * 60).setJti(this.newId()).setSubject(userId)
      .sign(this.key('JWT_ACCESS_SECRET'));
    const refreshToken = await new SignJWT({ tokenUse: 'refresh', sid: sessionId })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer('servzit-api').setAudience('servzit-client')
      .setIssuedAt(now).setExpirationTime(Math.floor(refreshExpiresAt.getTime() / 1000)).setJti(refreshJti)
      .setSubject(userId).sign(this.key('JWT_REFRESH_SECRET'));
    return { accessToken, refreshToken, refreshJti, accessExpiresIn: 900, refreshExpiresAt };
  }

  async verify(token: string, use: SessionClaims['tokenUse']): Promise<SessionClaims> {
    const { payload } = await jwtVerify(token, this.key(use === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET'), {
      algorithms: ['HS256'], issuer: 'servzit-api', audience: 'servzit-client',
    });
    if (payload.tokenUse !== use || typeof payload.sub !== 'string' || typeof payload.sid !== 'string' || typeof payload.jti !== 'string') {
      throw new Error('Invalid session token claims');
    }
    return { sub: payload.sub, sid: payload.sid, jti: payload.jti, tokenUse: use };
  }
}
