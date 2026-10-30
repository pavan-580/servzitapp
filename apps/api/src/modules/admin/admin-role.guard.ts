import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/access-token.guard';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user?.roles.includes('admin')) throw new ForbiddenException({ code: 'ADMIN_REQUIRED', message: 'Administrator access is required.' });
    return true;
  }
}
