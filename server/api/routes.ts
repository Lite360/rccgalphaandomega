import { handleAdminApiRoute } from './adminRoutes';
import { handleMemberApiRoute } from './memberRoutes';
import { db, schema } from '../../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  adminLoginSchema,
  createParishSchema,
} from '../validators';
import {
  createSession,
  validateSession,
  destroySession,
  generateNumericOtp,
  verifyPassword,
} from '../security/auth';
import { logAdminAction } from '../services/auditService';

export interface ServerRequest {
  method: string;
  url: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

export interface ServerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: any;
}

// Extract session token from Authorization Header or Cookie
export function getSessionToken(req: ServerRequest): string | null {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = req.headers['cookie'];
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/session_token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

export async function handleApiRoute(req: ServerRequest): Promise<ServerResponse> {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();

  try {
    // ========================================================================
    // 1. PUBLIC: GET /api/parishes
    // ========================================================================
    if (pathname === '/api/parishes' && method === 'GET') {
      const activeParishes = await db.query.parishes.findMany({
        where: eq(schema.parishes.status, 'active'),
        orderBy: [schema.parishes.name],
      });
      return {
        statusCode: 200,
        body: { success: true, parishes: activeParishes },
      };
    }

    // ========================================================================
    // 2. AUTH: POST /api/auth/register
    // ========================================================================
    if (pathname === '/api/auth/register' && method === 'POST') {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          body: { success: false, error: parsed.error.issues[0].message },
        };
      }

      const { fullName, parishId, phoneE164 } = parsed.data;

      // Check if user already exists
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.phoneE164, phoneE164),
      });

      if (existing) {
        return {
          statusCode: 400,
          body: { success: false, error: 'A member with this phone number already exists. Please Sign In.' },
        };
      }

      // Check if parish exists
      const parish = await db.query.parishes.findFirst({
        where: eq(schema.parishes.id, parishId),
      });
      if (!parish) {
        return {
          statusCode: 400,
          body: { success: false, error: 'Selected Parish does not exist.' },
        };
      }

      // Generate OTP Challenge
      const devBypass = process.env.DEV_OTP_BYPASS || '123456';
      const otpCode = process.env.NODE_ENV === 'development' ? devBypass : generateNumericOtp(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const [challenge] = await db.insert(schema.otpChallenges).values({
        phoneE164,
        otpCode,
        purpose: 'register',
        expiresAt,
      }).returning({ id: schema.otpChallenges.id });

      return {
        statusCode: 200,
        body: {
          success: true,
          message: 'Verification code generated.',
          challengeId: challenge.id,
          phoneE164,
          devOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
        },
      };
    }

    // ========================================================================
    // 3. AUTH: POST /api/auth/login
    // ========================================================================
    if (pathname === '/api/auth/login' && method === 'POST') {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          body: { success: false, error: parsed.error.issues[0].message },
        };
      }

      const { phoneE164 } = parsed.data;

      // Verify user exists
      const user = await db.query.users.findFirst({
        where: eq(schema.users.phoneE164, phoneE164),
      });

      if (!user) {
        return {
          statusCode: 404,
          body: { success: false, error: 'No account found with this phone number. Please register first.' },
        };
      }

      if (user.status === 'suspended') {
        return {
          statusCode: 403,
          body: { success: false, error: 'Your member account is currently suspended. Please contact the administrator.' },
        };
      }

      // Generate OTP Challenge
      const devBypass = process.env.DEV_OTP_BYPASS || '123456';
      const otpCode = process.env.NODE_ENV === 'development' ? devBypass : generateNumericOtp(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const [challenge] = await db.insert(schema.otpChallenges).values({
        phoneE164,
        otpCode,
        purpose: 'login',
        expiresAt,
      }).returning({ id: schema.otpChallenges.id });

      return {
        statusCode: 200,
        body: {
          success: true,
          message: 'Login verification code sent.',
          challengeId: challenge.id,
          phoneE164,
          devOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
        },
      };
    }

    // ========================================================================
    // 4. AUTH: POST /api/auth/verify-otp
    // ========================================================================
    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          body: { success: false, error: parsed.error.issues[0].message },
        };
      }

      const { phoneE164, otpCode, purpose } = parsed.data;

      // Development bypass or DB match
      const devBypass = process.env.DEV_OTP_BYPASS;
      let isValid = devBypass && otpCode === devBypass;

      if (!isValid) {
        const challenge = await db.query.otpChallenges.findFirst({
          where: and(
            eq(schema.otpChallenges.phoneE164, phoneE164),
            eq(schema.otpChallenges.otpCode, otpCode),
          ),
          orderBy: [desc(schema.otpChallenges.createdAt)],
        });

        if (challenge && challenge.expiresAt > new Date() && !challenge.verifiedAt) {
          isValid = true;
          // Mark challenge verified
          await db.update(schema.otpChallenges)
            .set({ verifiedAt: new Date() })
            .where(eq(schema.otpChallenges.id, challenge.id));
        }
      }

      if (!isValid) {
        return {
          statusCode: 400,
          body: { success: false, error: 'Invalid or expired OTP verification code.' },
        };
      }

      // If registration, create user record if not created yet
      let user = await db.query.users.findFirst({
        where: eq(schema.users.phoneE164, phoneE164),
        with: { parish: true },
      });

      if (!user && purpose === 'register') {
        // Find registration request details from body or create with pending data
        const reqBody = req.body;
        if (!reqBody.fullName || !reqBody.parishId) {
          return {
            statusCode: 400,
            body: { success: false, error: 'Registration incomplete. Missing name or parish details.' },
          };
        }

        const [createdUser] = await db.insert(schema.users).values({
          fullName: reqBody.fullName,
          parishId: reqBody.parishId,
          phoneE164,
          status: 'active',
          lastLoginAt: new Date(),
        }).returning();

        user = await db.query.users.findFirst({
          where: eq(schema.users.id, createdUser.id),
          with: { parish: true },
        });
      }

      if (!user) {
        return {
          statusCode: 404,
          body: { success: false, error: 'User record could not be found.' },
        };
      }

      // Update last login
      await db.update(schema.users)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.users.id, user.id));

      // Create Session
      const { sessionId } = await createSession({ userId: user.id, role: 'user' });

      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': `session_token=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
        body: {
          success: true,
          token: sessionId,
          role: 'user',
          user: {
            id: user.id,
            fullName: user.fullName,
            phoneE164: user.phoneE164,
            parishId: user.parishId,
            parishName: user.parish?.name,
            status: user.status,
          },
        },
      };
    }

    // ========================================================================
    // 5. AUTH: POST /api/auth/admin-login
    // ========================================================================
    if (pathname === '/api/auth/admin-login' && method === 'POST') {
      const parsed = adminLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          body: { success: false, error: parsed.error.issues[0].message },
        };
      }

      const { username, password } = parsed.data;

      const admin = await db.query.admins.findFirst({
        where: eq(schema.admins.username, username),
      });

      if (!admin || !verifyPassword(password, admin.passwordHash)) {
        return {
          statusCode: 401,
          body: { success: false, error: 'Invalid username or password.' },
        };
      }

      if (admin.status !== 'active') {
        return {
          statusCode: 403,
          body: { success: false, error: 'Admin account is suspended.' },
        };
      }

      // Update admin last login
      await db.update(schema.admins)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.admins.id, admin.id));

      // Create Session
      const { sessionId } = await createSession({ adminId: admin.id, role: 'admin' });

      await logAdminAction({
        adminId: admin.id,
        action: 'admin_login',
        entityType: 'admin',
        entityId: admin.id,
        ipAddress: typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : undefined,
      });

      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': `session_token=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
        body: {
          success: true,
          token: sessionId,
          role: 'admin',
          admin: {
            id: admin.id,
            username: admin.username,
            fullName: admin.fullName,
            email: admin.email,
            status: admin.status,
          },
        },
      };
    }

    // ========================================================================
    // 6. AUTH: GET /api/me
    // ========================================================================
    if (pathname === '/api/me' && method === 'GET') {
      const token = getSessionToken(req);
      if (!token) {
        return {
          statusCode: 200,
          body: { success: true, user: null, admin: null, role: null },
        };
      }

      const auth = await validateSession(token);
      if (!auth) {
        return {
          statusCode: 200,
          body: { success: true, user: null, admin: null, role: null },
        };
      }

      if (auth.role === 'admin') {
        return {
          statusCode: 200,
          body: {
            success: true,
            role: 'admin',
            admin: {
              id: auth.admin.id,
              username: auth.admin.username,
              fullName: auth.admin.fullName,
              email: auth.admin.email,
              status: auth.admin.status,
            },
          },
        };
      }

      if (auth.role === 'user') {
        return {
          statusCode: 200,
          body: {
            success: true,
            role: 'user',
            user: {
              id: auth.user.id,
              fullName: auth.user.fullName,
              phoneE164: auth.user.phoneE164,
              parishId: auth.user.parishId,
              parishName: (auth.user as any).parish?.name,
              status: auth.user.status,
            },
          },
        };
      }
    }

    // ========================================================================
    // 7. AUTH: POST /api/auth/logout
    // ========================================================================
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const token = getSessionToken(req);
      if (token) {
        await destroySession(token);
      }
      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': 'session_token=; Path=/; HttpOnly; Max-Age=0',
        },
        body: { success: true, message: 'Logged out successfully' },
      };
    }

    // Delegate to Admin API Routes
    if (pathname.startsWith('/api/admin')) {
      const adminResult = await handleAdminApiRoute(req, pathname, method);
      if (adminResult) return adminResult;
    }

    // Delegate to Member API Routes
    const memberResult = await handleMemberApiRoute(req, pathname, method);
    if (memberResult) return memberResult;

    // Fallthrough 404 for unhandled routes
    return {
      statusCode: 404,
      body: { success: false, error: `Route ${method} ${pathname} not found` },
    };
  } catch (error: any) {
    console.error(`API Error on ${method} ${pathname}:`, error);
    return {
      statusCode: 500,
      body: { success: false, error: error.message || 'Internal server error' },
    };
  }
}
