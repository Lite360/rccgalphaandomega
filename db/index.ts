import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from './schema/index';
import * as dotenv from 'dotenv';

dotenv.config();

let dbInstance: any;

export function getDb() {
  const connStr = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rccg_exam';
  const isNeon = connStr.includes('neon.tech') || connStr.includes('sslmode=require');

  if (isNeon) {
    const pool = new NeonPool({ connectionString: connStr });
    return drizzleNeon(pool, { schema });
  } else {
    if (dbInstance) return dbInstance;
    const pool = new pg.Pool({ connectionString: connStr });
    dbInstance = drizzlePg(pool, { schema });
    return dbInstance;
  }
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb();
    return instance[prop];
  }
});

export { schema };
