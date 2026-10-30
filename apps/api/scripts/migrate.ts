import dotenv from 'dotenv';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL must be configured before running migrations.');

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000, application_name: 'servzit-migrations' });
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [74190261]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const folder = path.resolve(process.cwd(), '../../database/migrations');
    const files = (await readdir(folder)).filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
    const applied = await client.query<{ version: string }>('SELECT version FROM schema_migrations');
    const alreadyApplied = new Set(applied.rows.map((row) => row.version));

    for (const file of files) {
      if (alreadyApplied.has(file)) continue;
      const sql = await readFile(path.join(folder, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        process.stdout.write(`Applied ${file}\n`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try { await client.query('SELECT pg_advisory_unlock($1)', [74190261]); } catch { /* connection may already be broken */ }
    client.release();
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  process.stderr.write(`Migration failed: ${error instanceof Error ? error.message : 'unknown error'}\n`);
  process.exitCode = 1;
});
