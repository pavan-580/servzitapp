import dotenv from 'dotenv';
import path from 'node:path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
const databaseUrl = process.env.DATABASE_URL;
const ownerPhone = process.env.BOOTSTRAP_ADMIN_PHONE;
if (!databaseUrl || !ownerPhone || !/^\+[1-9]\d{7,14}$/.test(ownerPhone)) {
  throw new Error('Set DATABASE_URL and BOOTSTRAP_ADMIN_PHONE to an E.164 phone already verified through OTP.');
}
if (process.env.CONFIRM_FIRST_ADMIN !== 'I_UNDERSTAND') {
  throw new Error('Set CONFIRM_FIRST_ADMIN=I_UNDERSTAND to confirm this one-time first-admin grant.');
}

const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 5000, application_name: 'servzit-first-admin-bootstrap' });
async function bootstrap() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [74190262]);
    const existingAdmins = await client.query<{ count: string } & import('pg').QueryResultRow>(
      'SELECT count(*)::text AS count FROM admin_users',
    );
    if (existingAdmins.rows[0].count !== '0') throw new Error('An administrator already exists; first-admin bootstrap is disabled.');
    const owner = await client.query<{ id: string } & import('pg').QueryResultRow>(
      "SELECT id FROM users WHERE phone_e164 = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE", [ownerPhone],
    );
    if (!owner.rows[0]) throw new Error('Verify the owner phone through OTP and sign in once before bootstrapping.');
    await client.query("INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE code = 'admin' ON CONFLICT DO NOTHING", [owner.rows[0].id]);
    await client.query('INSERT INTO admin_users (user_id, granted_by_user_id) VALUES ($1, $1)', [owner.rows[0].id]);
    await client.query(`INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, after_state, note)
      VALUES ($1, 'bootstrap.first_admin', 'admin_user', $1, jsonb_build_object('role', 'admin'), 'Secure first-admin bootstrap')`, [owner.rows[0].id]);
    await client.query('COMMIT');
    process.stdout.write('First administrator granted to the verified owner account.\n');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

bootstrap().catch((error: unknown) => {
  process.stderr.write(`Admin bootstrap failed: ${error instanceof Error ? error.message : 'unknown error'}\n`);
  process.exitCode = 1;
});
