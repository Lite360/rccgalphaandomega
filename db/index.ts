import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from './schema/index';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rccg_exam';

// Helper to determine if we are connecting to Neon or standard local PostgreSQL
const isNeon = connectionString.includes('neon.tech') || connectionString.includes('sslmode=require');

let dbInstance: any;

export function getDb() {
  if (dbInstance) return dbInstance;

  if (isNeon) {
    const pool = new NeonPool({ connectionString });
    dbInstance = drizzleNeon(pool, { schema });
  } else {
    const pool = new pg.Pool({ connectionString });
    dbInstance = drizzlePg(pool, { schema });
  }

  return dbInstance;
}

export const db = getDb();
export { schema };
