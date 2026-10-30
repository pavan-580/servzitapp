import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { SessionTokenService } from './session-token.service';

export interface AuthenticatedUser { id: string; sessionId: string; phoneE164: string; roles: string[] }
export type AuthenticatedRequest = { headers: { authorization?: string }; user: AuthenticatedUser };
interface SessionUserRow extends QueryResultRow { id: string; phoneE164: string; roles: string[] }

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokens: SessionTokenService, private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException();
    let claims;
    try { claims = await this.tokens.verify(authorization.slice(7), 'access'); }
    catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new UnauthorizedException({ code: 'ACCESS_TOKEN_INVALID', message: 'Sign in to continue.' });
    }
    const result = await this.database.query<SessionUserRow>(
      `SELECT u.id, u.phone_e164 AS "phoneE164", COALESCE(array_agg(r.code ORDER BY r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
       FROM user_sessions s JOIN users u ON u.id = s.user_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
       WHERE s.id = $1 AND s.user_id = $2 AND s.revoked_at IS NULL AND s.expires_at > now()
         AND u.status = 'active' AND u.deleted_at IS NULL
       GROUP BY u.id`, [claims.sid, claims.sub],
    );
    if (!result.rows[0]) throw new UnauthorizedException({ code: 'SESSION_INVALID', message: 'Sign in again to continue.' });
    request.user = { id: result.rows[0].id, sessionId: claims.sid, phoneE164: result.rows[0].phoneE164, roles: result.rows[0].roles };
    return true;
  }
}
