import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SessionTokenService } from '../src/modules/auth/session-token.service';

const accessSecret = 'test-access-secret-not-for-any-deployment-32';
const refreshSecret = 'test-refresh-secret-not-for-any-deployment-32';

test('session tokens are signed for their intended use and share the session identity', async () => {
  const priorAccess = process.env.JWT_ACCESS_SECRET;
  const priorRefresh = process.env.JWT_REFRESH_SECRET;
  process.env.JWT_ACCESS_SECRET = accessSecret;
  process.env.JWT_REFRESH_SECRET = refreshSecret;
  try {
    const service = new SessionTokenService();
    const issued = await service.create('user-123', 'session-456');
    const access = await service.verify(issued.accessToken, 'access');
    const refresh = await service.verify(issued.refreshToken, 'refresh');
    assert.equal(access.sub, 'user-123');
    assert.equal(access.sid, 'session-456');
    assert.equal(access.tokenUse, 'access');
    assert.equal(refresh.sub, 'user-123');
    assert.equal(refresh.sid, 'session-456');
    assert.equal(refresh.jti, issued.refreshJti);
    await assert.rejects(service.verify(issued.accessToken, 'refresh'));
  } finally {
    if (priorAccess === undefined) delete process.env.JWT_ACCESS_SECRET; else process.env.JWT_ACCESS_SECRET = priorAccess;
    if (priorRefresh === undefined) delete process.env.JWT_REFRESH_SECRET; else process.env.JWT_REFRESH_SECRET = priorRefresh;
  }
});

test('session signing refuses placeholder secrets', async () => {
  const priorAccess = process.env.JWT_ACCESS_SECRET;
  const priorRefresh = process.env.JWT_REFRESH_SECRET;
  process.env.JWT_ACCESS_SECRET = 'replace-with-a-local-random-secret-of-at-least-32-characters';
  process.env.JWT_REFRESH_SECRET = refreshSecret;
  try {
    await assert.rejects(new SessionTokenService().create('user-123', 'session-456'), { status: 503 });
  } finally {
    if (priorAccess === undefined) delete process.env.JWT_ACCESS_SECRET; else process.env.JWT_ACCESS_SECRET = priorAccess;
    if (priorRefresh === undefined) delete process.env.JWT_REFRESH_SECRET; else process.env.JWT_REFRESH_SECRET = priorRefresh;
  }
});
