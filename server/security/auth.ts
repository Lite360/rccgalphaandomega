import crypto from 'crypto';
import { db, schema } from '../../db';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function generateId(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateNumericOtp(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === key;
  } catch {
    return false;
  }
}

export async function createSession(params: { userId?: string; adminId?: string; role: 'user' | 'admin' }) {
  const sessionId = generateId(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(schema.userSessions).values({
    id: sessionId,
    userId: params.userId || null,
    adminId: params.adminId || null,
    role: params.role,
    expiresAt,
  });

  return { sessionId, expiresAt };
}

export async function validateSession(sessionId: string) {
  if (!sessionId) return null;

  const session = await db.query.userSessions.findFirst({
    where: and(
      eq(schema.userSessions.id, sessionId),
      gt(schema.userSessions.expiresAt, new Date())
    ),
  });

  if (!session) return null;

  if (session.role === 'admin' && session.adminId) {
    const admin = await db.query.admins.findFirst({
      where: eq(schema.admins.id, session.adminId),
    });
    if (!admin || admin.status !== 'active') return null;
    return { session, admin, role: 'admin' as const };
  }

  if (session.role === 'user' && session.userId) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.userId),
      with: { parish: true },
    });
    if (!user || user.status !== 'active') return null;
    return { session, user, role: 'user' as const };
  }

  return null;
}

export async function destroySession(sessionId: string) {
  if (!sessionId) return;
  await db.delete(schema.userSessions).where(eq(schema.userSessions.id, sessionId));
}
