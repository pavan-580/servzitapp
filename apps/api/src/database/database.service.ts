import { HttpException, Injectable, OnApplicationShutdown, ServiceUnavailableException } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly pool: Pool | undefined;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      this.pool = new Pool({
        connectionString,
        max: Number(process.env.DATABASE_POOL_MAX ?? 10),
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 30000,
        statement_timeout: 5000,
        application_name: 'servzit-api',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
      });
    }
  }

  async query<T extends QueryResultRow>(sql: string, parameters: readonly unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new ServiceUnavailableException({ code: 'DATABASE_UNAVAILABLE', message: 'Marketplace data is temporarily unavailable.' });
    try {
      return await this.pool.query<T>(sql, [...parameters]);
    } catch (error) {
      // Keep database details in server logs, never in public API responses.
      console.error('Database query failed', error instanceof Error ? error.message : 'unknown database error');
      throw new ServiceUnavailableException({ code: 'DATABASE_UNAVAILABLE', message: 'Marketplace data is temporarily unavailable.' });
    }
  }

  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) throw new ServiceUnavailableException({ code: 'DATABASE_UNAVAILABLE', message: 'Marketplace data is temporarily unavailable.' });
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');
      const value = await work(client);
      await client.query('COMMIT');
      return value;
    } catch (error) {
      await client?.query('ROLLBACK').catch(() => undefined);
      if (error instanceof HttpException) throw error;
      console.error('Database transaction failed', error instanceof Error ? error.message : 'unknown database error');
      throw new ServiceUnavailableException({ code: 'DATABASE_UNAVAILABLE', message: 'Marketplace data is temporarily unavailable.' });
    } finally {
      client?.release();
    }
  }

  async checkConnection(): Promise<void> {
    if (!this.pool) throw new Error('DATABASE_URL is not configured');
    await this.pool.query('SELECT 1');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool?.end();
  }
}
