import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PoolClient, QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { OtpVerificationService } from './otp-verification.service';
import { SessionTokenService } from './session-token.service';

interface UserRow extends QueryResultRow { id: string; phoneE164: string; displayName: string | null }
interface RoleRow extends QueryResultRow { code: string }

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService, private readonly otp: OtpVerificationService, private readonly tokens: SessionTokenService) {}

  async requestOtp(phoneE164: string): Promise<{ message: string }> {
    await this.otp.send(phoneE164);
    return { message: 'If this number can receive verification, a code was sent.' };
  }

  async verifyOtp(phoneE164: string, code: string) {
    if (!(await this.otp.verify(phoneE164, code))) throw new UnauthorizedException({ code: 'OTP_INVALID', message: 'The verification code could not be confirmed.' });
    return this.database.transaction(async (client) => {
      const userResult = await client.query<UserRow>(
        `INSERT INTO users (phone_e164) VALUES ($1)
         ON CONFLICT (phone_e164) DO UPDATE SET updated_at = now()
         WHERE users.status = 'active' AND users.deleted_at IS NULL
         RETURNING id, phone_e164 AS "phoneE164", display_name AS "displayName"`, [phoneE164],
      );
      if (!userResult.rows[0]) return null;
      const user = userResult.rows[0];
      await client.query(`INSERT INTO user_roles (user_id, role_id)
        SELECT $1, id FROM roles WHERE code = 'customer' ON CONFLICT DO NOTHING`, [user.id]);
      const roles = await this.getRoles(client, user.id);
      const sessionId = this.tokens.newId();
      const issued = await this.tokens.create(user.id, sessionId);
      await client.query(`INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at)
        VALUES ($1, $2, $3, $4)`, [sessionId, user.id, this.hash(issued.refreshJti), issued.refreshExpiresAt]);
      return this.response(user, roles, issued);
    }).then((result) => {
      if (!result) throw new UnauthorizedException({ code: 'ACCOUNT_UNAVAILABLE', message: 'This account cannot sign in.' });
      return result;
    });
  }

  async refresh(refreshToken: string) {
    let claims;
    try { claims = await this.tokens.verify(refreshToken, 'refresh'); }
    catch { throw new UnauthorizedException({ code: 'SESSION_INVALID', message: 'Sign in again to continue.' }); }
    const issued = await this.tokens.create(claims.sub, claims.sid);
    const result = await this.database.transaction(async (client) => {
      const userResult = await client.query<UserRow>(`SELECT id, phone_e164 AS "phoneE164", display_name AS "displayName"
        FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL`, [claims.sub]);
      if (!userResult.rows[0]) return null;
      const rotated = await client.query(`UPDATE user_sessions SET refresh_token_hash = $3, expires_at = $4, last_used_at = now()
        WHERE id = $1 AND user_id = $2 AND refresh_token_hash = $5 AND revoked_at IS NULL AND expires_at > now()`,
      [claims.sid, claims.sub, this.hash(issued.refreshJti), issued.refreshExpiresAt, this.hash(claims.jti)]);
      if (rotated.rowCount !== 1) return null;
      const roles = await this.getRoles(client, claims.sub);
      return this.response(userResult.rows[0], roles, issued);
    });
    if (!result) throw new UnauthorizedException({ code: 'SESSION_INVALID', message: 'Sign in again to continue.' });
    return result;
  }

  async logout(sessionId: string, userId: string): Promise<{ ok: true }> {
    await this.database.query(`UPDATE user_sessions SET revoked_at = now()
      WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`, [sessionId, userId]);
    return { ok: true };
  }

  private async getRoles(client: PoolClient, userId: string): Promise<string[]> {
    const result = await client.query<RoleRow>(`SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1 ORDER BY r.code`, [userId]);
    return result.rows.map((row) => row.code);
  }

  private hash(jti: string): Buffer { return createHash('sha256').update(jti).digest(); }

  private response(user: UserRow, roles: string[], issued: Awaited<ReturnType<SessionTokenService['create']>>) {
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      accessExpiresIn: issued.accessExpiresIn,
      user: { id: user.id, phoneE164: user.phoneE164, displayName: user.displayName, roles },
    };
  }
}
