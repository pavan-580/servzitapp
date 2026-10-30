import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConflictException } from '@nestjs/common';
import { DatabaseService } from '../src/database/database.service';
import { AdminService } from '../src/modules/admin/admin.service';

function serviceWithDocumentState(identityApproved: boolean, businessApproved: boolean) {
  const statements: string[] = [];
  const client = {
    query: async (sql: string) => {
      statements.push(sql);
      if (sql.startsWith('SELECT id, review_status')) return { rows: [{ id: 'provider-id', reviewStatus: 'pending' }], rowCount: 1 };
      if (sql.startsWith('SELECT EXISTS')) return { rows: [{ identityApproved, businessApproved }], rowCount: 1 };
      if (sql.startsWith('UPDATE businesses')) return { rows: [{ id: 'business-id' }], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    },
  };
  const database = { transaction: async (work: (tx: typeof client) => Promise<unknown>) => work(client) } as unknown as DatabaseService;
  return { admin: new AdminService(database), statements };
}

test('provider approval is blocked until identity and business document reviews are approved', async () => {
  const { admin, statements } = serviceWithDocumentState(true, false);
  await assert.rejects(
    admin.reviewProvider('admin-id', 'provider-id', { decision: 'approve' }),
    (error: unknown) => error instanceof ConflictException && error.getResponse() instanceof Object,
  );
  assert.equal(statements.some((sql) => sql.startsWith('UPDATE providers')), false);
  assert.equal(statements.some((sql) => sql.startsWith('INSERT INTO audit_logs')), false);
});

test('provider approval publishes and audits only after both required documents pass review', async () => {
  const { admin, statements } = serviceWithDocumentState(true, true);
  const result = await admin.reviewProvider('admin-id', 'provider-id', { decision: 'approve', note: 'Reviewed' });
  assert.deepEqual(result, { providerId: 'provider-id', reviewStatus: 'approved', isPublished: true });
  assert.equal(statements.some((sql) => sql.startsWith('UPDATE providers')), true);
  assert.equal(statements.some((sql) => sql.startsWith('UPDATE businesses')), true);
  assert.equal(statements.some((sql) => sql.startsWith('INSERT INTO audit_logs')), true);
});
