import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRoleGuard } from '../src/modules/admin/admin-role.guard';

function contextFor(roles: string[]) {
  return { switchToHttp: () => ({ getRequest: () => ({ user: { id: 'user-id', roles } }) }) } as unknown as ExecutionContext;
}

test('admin review guard allows administrator role and rejects ordinary accounts', () => {
  const guard = new AdminRoleGuard();
  assert.equal(guard.canActivate(contextFor(['admin', 'customer'])), true);
  assert.throws(() => guard.canActivate(contextFor(['customer'])), ForbiddenException);
  assert.throws(() => guard.canActivate(contextFor([])), ForbiddenException);
});
