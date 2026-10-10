import { db, schema } from '../../db';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { validateSession } from '../security/auth';
import { logAdminAction } from '../services/auditService';
import { createQuestionSchema, createExamSchema, createParishSchema } from '../validators';
import type { ServerRequest, ServerResponse } from './routes';
import { getSessionToken } from './routes';

// --------------------------------------------------------------------------
// Auth Guard – Call this at the top of every admin handler
// --------------------------------------------------------------------------
async function requireAdmin(req: ServerRequest) {
  const token = getSessionToken(req);
  if (!token) return null;
  const auth = await validateSession(token);
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

function getIp(req: ServerRequest): string | undefined {
  const h = req.headers['x-forwarded-for'];
  return typeof h === 'string' ? h.split(',')[0].trim() : undefined;
}

// --------------------------------------------------------------------------
// Admin API Route Handler
// --------------------------------------------------------------------------
export async function handleAdminApiRoute(req: ServerRequest, pathname: string, method: string): Promise<ServerResponse | null> {
  // All admin routes require authentication
  const auth = await requireAdmin(req);

  // ========================================================================
  // GET /api/admin/overview
  // ========================================================================
  if (pathname === '/api/admin/overview' && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const [usersCount, questionsCount, submissionsCount, pendingCount, activeExams] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.users),
      db.select({ count: sql<number>`count(*)` }).from(schema.questions),
      db.select({ count: sql<number>`count(*)` }).from(schema.examAttempts).where(eq(schema.examAttempts.status, 'submitted')),
      db.select({ count: sql<number>`count(*)` }).from(schema.examAnswers).where(and(eq(schema.examAnswers.isManuallyGraded, false), sql`${schema.examAnswers.writtenResponse} IS NOT NULL`)),
      db.query.exams.findMany({
        where: inArray(schema.exams.status, ['ongoing', 'published']),
        orderBy: [desc(schema.exams.createdAt)],
        limit: 5,
      }),
    ]);

    return {
      statusCode: 200,
      body: {
        success: true,
        stats: {
          totalUsers: Number(usersCount[0]?.count || 0),
          totalQuestions: Number(questionsCount[0]?.count || 0),
          totalSubmissions: Number(submissionsCount[0]?.count || 0),
          pendingGrading: Number(pendingCount[0]?.count || 0),
        },
        activeExams,
      },
    };
  }

  // ========================================================================
  // GET /api/admin/exams
  // ========================================================================
  if (pathname === '/api/admin/exams' && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const exams = await db.query.exams.findMany({
      orderBy: [desc(schema.exams.createdAt)],
    });

    // Attach question counts
    const examIds = exams.map((e: any) => e.id);
    let questionCounts: Record<string, number> = {};
    if (examIds.length > 0) {
      const counts = await db.select({ examId: schema.examQuestions.examId, count: sql<number>`count(*)` })
        .from(schema.examQuestions)
        .where(inArray(schema.examQuestions.examId, examIds))
        .groupBy(schema.examQuestions.examId);
      counts.forEach((c: any) => { questionCounts[c.examId] = Number(c.count); });
    }

    return {
      statusCode: 200,
      body: {
        success: true,
        exams: exams.map((e: any) => ({ ...e, questionCount: questionCounts[e.id] || 0 })),
      },
    };
  }

  // ========================================================================
  // POST /api/admin/exams
  // ========================================================================
  if (pathname === '/api/admin/exams' && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const parsed = createExamSchema.safeParse(req.body);
    if (!parsed.success) return { statusCode: 400, body: { success: false, error: parsed.error.issues[0].message } };

    const { questionIds, ...examData } = parsed.data;

    const [exam] = await db.insert(schema.exams).values({
      ...examData,
      createdBy: auth.admin.id,
      status: 'draft',
    }).returning();

    // Assign questions if provided
    if (questionIds && questionIds.length > 0) {
      const inserts = questionIds.map((qid, idx) => ({
        examId: exam.id,
        questionId: qid,
        position: idx,
      }));
      await db.insert(schema.examQuestions).values(inserts).onConflictDoNothing();
    }

    await logAdminAction({ adminId: auth.admin.id, action: 'create_exam', entityType: 'exam', entityId: exam.id, ipAddress: getIp(req) });

    return { statusCode: 201, body: { success: true, exam } };
  }

  // ========================================================================
  // GET /api/admin/exams/:id
  // ========================================================================
  const examIdMatch = pathname.match(/^\/api\/admin\/exams\/([^/]+)$/);
  if (examIdMatch && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const examId = examIdMatch[1];
    const exam = await db.query.exams.findFirst({ where: eq(schema.exams.id, examId) });
    if (!exam) return { statusCode: 404, body: { success: false, error: 'Exam not found' } };

    const questionCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.examQuestions).where(eq(schema.examQuestions.examId, examId));

    return { statusCode: 200, body: { success: true, exam: { ...exam, questionCount: Number(questionCount[0]?.count || 0) } } };
  }

  // ========================================================================
  // POST /api/admin/exams/:id/publish
  // ========================================================================
  const publishMatch = pathname.match(/^\/api\/admin\/exams\/([^/]+)\/publish$/);
  if (publishMatch && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const examId = publishMatch[1];
    await db.update(schema.exams).set({ status: 'ongoing', updatedAt: new Date() }).where(eq(schema.exams.id, examId));
    await logAdminAction({ adminId: auth.admin.id, action: 'publish_exam', entityType: 'exam', entityId: examId, ipAddress: getIp(req) });
    return { statusCode: 200, body: { success: true, message: 'Examination published and set to ongoing.' } };
  }

  // ========================================================================
  // POST /api/admin/exams/:id/end
  // ========================================================================
  const endExamMatch = pathname.match(/^\/api\/admin\/exams\/([^/]+)\/end$/);
  if (endExamMatch && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const examId = endExamMatch[1];
    const now = new Date();

    await db.transaction(async (tx: any) => {
      // End the exam
      await tx.update(schema.exams)
        .set({ status: 'ended', endedAt: now, updatedAt: now })
        .where(eq(schema.exams.id, examId));

      // Mark all ongoing attempts as ended_by_admin
      await tx.update(schema.examAttempts)
        .set({ status: 'ended_by_admin', submittedAt: now })
        .where(and(
          eq(schema.examAttempts.examId, examId),
          eq(schema.examAttempts.status, 'ongoing')
        ));
    });

    await logAdminAction({ adminId: auth.admin.id, action: 'end_exam', entityType: 'exam', entityId: examId, metadata: { endedAt: now.toISOString() }, ipAddress: getIp(req) });

    return { statusCode: 200, body: { success: true, message: 'Examination ended for all participants.' } };
  }

  // ========================================================================
  // GET /api/admin/exams/:id/attempts
  // ========================================================================
  const attemptsMatch = pathname.match(/^\/api\/admin\/exams\/([^/]+)\/attempts$/);
  if (attemptsMatch && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const examId = attemptsMatch[1];

    const attempts = await db.query.examAttempts.findMany({
      where: eq(schema.examAttempts.examId, examId),
      with: { user: { with: { parish: true } } },
      orderBy: [desc(schema.examAttempts.startedAt)],
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        attempts: attempts.map((a: any) => ({
          ...a,
          userName: a.user?.fullName || 'Unknown',
          parishName: (a.user as any)?.parish?.name || '—',
        })),
      },
    };
  }

  // ========================================================================
  // GET /api/admin/exams/:id/results
  // ========================================================================
  const resultsMatch = pathname.match(/^\/api\/admin\/exams\/([^/]+)\/results$/);
  if (resultsMatch && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const examId = resultsMatch[1];

    const results = await db.query.examResults.findMany({
      where: eq(schema.examResults.examId, examId),
      with: { user: { with: { parish: true } }, attempt: true },
      orderBy: [desc(schema.examResults.createdAt)],
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        results: results.map((r: any) => ({
          ...r,
          userName: r.user?.fullName || 'Unknown',
          parishName: (r.user as any)?.parish?.name || '—',
          submittedAt: r.attempt?.submittedAt,
          totalScore: Number(r.totalScore),
          maximumScore: Number(r.maximumScore),
          percentage: Number(r.percentage),
        })),
      },
    };
  }

  // ========================================================================
  // POST /api/admin/results/:id/release
  // ========================================================================
  const releaseMatch = pathname.match(/^\/api\/admin\/results\/([^/]+)\/release$/);
  if (releaseMatch && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const resultId = releaseMatch[1];
    await db.update(schema.examResults).set({ releasedAt: new Date(), releasedBy: auth.admin.id }).where(eq(schema.examResults.id, resultId));
    await logAdminAction({ adminId: auth.admin.id, action: 'release_result', entityType: 'exam_result', entityId: resultId, ipAddress: getIp(req) });
    return { statusCode: 200, body: { success: true, message: 'Result released to member.' } };
  }

  // ========================================================================
  // GET /api/admin/questions
  // ========================================================================
  if (pathname === '/api/admin/questions' && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const questions = await db.query.questions.findMany({
      where: eq(schema.questions.status, 'active'),
      with: { options: { orderBy: [schema.questionOptions.position] } },
      orderBy: [desc(schema.questions.createdAt)],
    });

    return { statusCode: 200, body: { success: true, questions } };
  }

  // ========================================================================
  // POST /api/admin/questions
  // ========================================================================
  if (pathname === '/api/admin/questions' && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) return { statusCode: 400, body: { success: false, error: parsed.error.issues[0].message } };

    const { options, ...questionData } = parsed.data;

    const [question] = await db.insert(schema.questions).values({
      ...questionData,
      status: 'active',
    }).returning();

    if (options && options.length > 0) {
      await db.insert(schema.questionOptions).values(
        options.map((opt, idx) => ({
          questionId: question.id,
          optionText: opt.optionText,
          optionLetter: opt.optionLetter || String.fromCharCode(65 + idx),
          isCorrect: opt.isCorrect ?? false,
          position: opt.position ?? idx,
        }))
      );
    }

    await logAdminAction({ adminId: auth.admin.id, action: 'create_question', entityType: 'question', entityId: question.id, ipAddress: getIp(req) });

    return { statusCode: 201, body: { success: true, question } };
  }

  // ========================================================================
  // DELETE /api/admin/questions/:id
  // ========================================================================
  const deleteQuestionMatch = pathname.match(/^\/api\/admin\/questions\/([^/]+)$/);
  if (deleteQuestionMatch && method === 'DELETE') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const questionId = deleteQuestionMatch[1];
    await db.update(schema.questions).set({ status: 'inactive' }).where(eq(schema.questions.id, questionId));
    return { statusCode: 200, body: { success: true, message: 'Question removed from bank.' } };
  }

  // ========================================================================
  // GET /api/admin/users
  // ========================================================================
  if (pathname === '/api/admin/users' && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const users = await db.query.users.findMany({
      with: { parish: true },
      orderBy: [desc(schema.users.createdAt)],
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        users: users.map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          phoneE164: u.phoneE164,
          parishId: u.parishId,
          parishName: (u as any).parish?.name || '—',
          status: u.status,
          createdAt: u.createdAt,
        })),
      },
    };
  }

  // ========================================================================
  // POST /api/admin/users/:id/status
  // ========================================================================
  const userStatusMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
  if (userStatusMatch && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const userId = userStatusMatch[1];
    const { status } = req.body || {};
    if (!['active', 'suspended'].includes(status)) return { statusCode: 400, body: { success: false, error: 'Invalid status.' } };
    await db.update(schema.users).set({ status, updatedAt: new Date() }).where(eq(schema.users.id, userId));
    await logAdminAction({ adminId: auth.admin.id, action: `user_${status}`, entityType: 'user', entityId: userId, ipAddress: getIp(req) });
    return { statusCode: 200, body: { success: true, message: `User status updated to ${status}.` } };
  }

  // ========================================================================
  // GET /api/admin/parishes
  // ========================================================================
  if (pathname === '/api/admin/parishes' && method === 'GET') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };
    const parishes = await db.query.parishes.findMany({ orderBy: [schema.parishes.name] });
    return { statusCode: 200, body: { success: true, parishes } };
  }

  // ========================================================================
  // POST /api/admin/parishes
  // ========================================================================
  if (pathname === '/api/admin/parishes' && method === 'POST') {
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Unauthorized' } };

    const parsed = createParishSchema.safeParse(req.body);
    if (!parsed.success) return { statusCode: 400, body: { success: false, error: parsed.error.issues[0].message } };

    const slug = parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [parish] = await db.insert(schema.parishes).values({
      name: parsed.data.name,
      slug,
      code: parsed.data.code,
      zone: parsed.data.zone,
      status: 'active',
    }).returning();

    await logAdminAction({ adminId: auth.admin.id, action: 'create_parish', entityType: 'parish', entityId: parish.id, ipAddress: getIp(req) });

    return { statusCode: 201, body: { success: true, parish } };
  }

  return null; // Route not handled here
}
