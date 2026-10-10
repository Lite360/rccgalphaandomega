import { db, schema } from '../../db';
import { eq, desc, and, gt, sql } from 'drizzle-orm';
import { validateSession } from '../security/auth';
import type { ServerRequest, ServerResponse } from './routes';
import { getSessionToken } from './routes';

async function requireUser(req: ServerRequest) {
  const token = getSessionToken(req);
  if (!token) return null;
  const auth = await validateSession(token);
  if (!auth || auth.role !== 'user') return null;
  return auth;
}

export async function handleMemberApiRoute(req: ServerRequest, pathname: string, method: string): Promise<ServerResponse | null> {
  // ========================================================================
  // GET /api/exams  — List exams available to member
  // ========================================================================
  if (pathname === '/api/exams' && method === 'GET') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const exams = await db.query.exams.findMany({
      where: eq(schema.exams.status, 'ongoing'),
      orderBy: [desc(schema.exams.createdAt)],
    });

    return { statusCode: 200, body: { success: true, exams } };
  }

  // ========================================================================
  // GET /api/exams/:id  — Get single exam
  // ========================================================================
  const examDetailMatch = pathname.match(/^\/api\/exams\/([^/]+)$/);
  if (examDetailMatch && method === 'GET') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const examId = examDetailMatch[1];
    const exam = await db.query.exams.findFirst({ where: eq(schema.exams.id, examId) });
    if (!exam) return { statusCode: 404, body: { success: false, error: 'Examination not found.' } };

    const [questionCountRes] = await db.select({ count: sql<number>`count(*)` }).from(schema.examQuestions).where(eq(schema.examQuestions.examId, examId));

    return { statusCode: 200, body: { success: true, exam: { ...exam, questionCount: Number(questionCountRes?.count || 0) } } };
  }

  // ========================================================================
  // GET /api/exams/:id/status  — Check if exam has been ended (polling)
  // ========================================================================
  const examStatusMatch = pathname.match(/^\/api\/exams\/([^/]+)\/status$/);
  if (examStatusMatch && method === 'GET') {
    const examId = examStatusMatch[1];
    const exam = await db.query.exams.findFirst({
      where: eq(schema.exams.id, examId),
    });
    return {
      statusCode: 200,
      body: {
        success: true,
        status: exam?.status,
        ended: exam?.status === 'ended' || exam?.status === 'cancelled',
      },
    };
  }

  // ========================================================================
  // POST /api/exams/:id/start  — Start or resume an attempt
  // ========================================================================
  const startMatch = pathname.match(/^\/api\/exams\/([^/]+)\/start$/);
  if (startMatch && method === 'POST') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const examId = startMatch[1];
    const user = auth.user;

    const exam = await db.query.exams.findFirst({ where: eq(schema.exams.id, examId) });
    if (!exam) return { statusCode: 404, body: { success: false, error: 'Exam not found.' } };
    if (exam.status !== 'ongoing') return { statusCode: 400, body: { success: false, error: 'This examination is not currently active.' } };

    // Check for existing ongoing attempt
    const existingAttempt = await db.query.examAttempts.findFirst({
      where: and(
        eq(schema.examAttempts.examId, examId),
        eq(schema.examAttempts.userId, user.id),
        eq(schema.examAttempts.status, 'ongoing')
      ),
    });

    if (existingAttempt) {
      return { statusCode: 200, body: { success: true, attempt: existingAttempt, resumed: true } };
    }

    // Calculate deadline from now + exam duration
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + exam.durationSeconds * 1000);

    const [attempt] = await db.insert(schema.examAttempts).values({
      examId,
      userId: user.id,
      startedAt: now,
      deadlineAt,
      status: 'ongoing',
      lastActivityAt: now,
    }).returning();

    return { statusCode: 201, body: { success: true, attempt } };
  }

  // ========================================================================
  // GET /api/attempts/current/:examId  — Load attempt with questions & answers
  // ========================================================================
  const currentAttemptMatch = pathname.match(/^\/api\/attempts\/current\/([^/]+)$/);
  if (currentAttemptMatch && method === 'GET') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const examId = currentAttemptMatch[1];

    const attempt = await db.query.examAttempts.findFirst({
      where: and(
        eq(schema.examAttempts.examId, examId),
        eq(schema.examAttempts.userId, auth.user.id)
      ),
      orderBy: [desc(schema.examAttempts.startedAt)],
    });

    if (!attempt) return { statusCode: 404, body: { success: false, error: 'No active attempt found.' } };

    // Load exam questions with question details (NO is_correct field)
    const examQuestions = await db.query.examQuestions.findMany({
      where: eq(schema.examQuestions.examId, examId),
      with: {
        question: {
          with: {
            options: {
              orderBy: [schema.questionOptions.position],
              columns: { id: true, questionId: true, optionText: true, optionLetter: true, position: true, isCorrect: false },
            },
          },
        },
      },
      orderBy: [schema.examQuestions.position],
    });

    const questions = examQuestions.map((item: any) => item.question);

    // Load saved answers (only the user's saved data, no scores revealed)
    const savedAnswers = await db.query.examAnswers.findMany({
      where: eq(schema.examAnswers.attemptId, attempt.id),
    });

    // Get exam info
    const exam = await db.query.exams.findFirst({ where: eq(schema.exams.id, examId) });

    return {
      statusCode: 200,
      body: {
        success: true,
        attempt: {
          ...attempt,
          exam: { title: exam?.title },
          savedAnswers: savedAnswers.map((a: any) => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            writtenResponse: a.writtenResponse,
          })),
        },
        questions,
      },
    };
  }

  // ========================================================================
  // PUT /api/attempts/:id/answers/:questionId  — Save one answer
  // ========================================================================
  const saveAnswerMatch = pathname.match(/^\/api\/attempts\/([^/]+)\/answers\/([^/]+)$/);
  if (saveAnswerMatch && method === 'PUT') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const [, attemptId, questionId] = saveAnswerMatch;

    // Verify attempt belongs to user and exam is still active
    const attempt = await db.query.examAttempts.findFirst({
      where: and(
        eq(schema.examAttempts.id, attemptId),
        eq(schema.examAttempts.userId, auth.user.id)
      ),
    });

    if (!attempt) return { statusCode: 404, body: { success: false, error: 'Attempt not found.' } };

    // Verify exam is still active
    const exam = await db.query.exams.findFirst({ where: eq(schema.exams.id, attempt.examId) });
    const now = new Date();

    if (attempt.status !== 'ongoing') {
      return { statusCode: 400, body: { success: false, error: 'This attempt is no longer active.' } };
    }

    if (exam?.status !== 'ongoing') {
      return { statusCode: 400, body: { success: false, error: 'The examination has ended.' } };
    }

    if (attempt.deadlineAt < now) {
      return { statusCode: 400, body: { success: false, error: 'Examination time has expired.' } };
    }

    const { selectedOptionId, writtenResponse } = req.body || {};

    // Upsert answer
    await db.insert(schema.examAnswers).values({
      attemptId,
      questionId,
      selectedOptionId: selectedOptionId || null,
      writtenResponse: writtenResponse || null,
      savedAt: now,
    }).onConflictDoUpdate({
      target: [schema.examAnswers.attemptId, schema.examAnswers.questionId],
      set: {
        selectedOptionId: selectedOptionId || null,
        writtenResponse: writtenResponse || null,
        savedAt: now,
      },
    });

    // Update last activity
    await db.update(schema.examAttempts)
      .set({ lastActivityAt: now })
      .where(eq(schema.examAttempts.id, attemptId));

    return { statusCode: 200, body: { success: true, savedAt: now.toISOString() } };
  }

  // ========================================================================
  // POST /api/attempts/:id/submit  — Final submission
  // ========================================================================
  const submitMatch = pathname.match(/^\/api\/attempts\/([^/]+)\/submit$/);
  if (submitMatch && method === 'POST') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const attemptId = submitMatch[1];

    const attempt = await db.query.examAttempts.findFirst({
      where: and(
        eq(schema.examAttempts.id, attemptId),
        eq(schema.examAttempts.userId, auth.user.id)
      ),
    });

    if (!attempt || attempt.status !== 'ongoing') {
      return { statusCode: 400, body: { success: false, error: 'Attempt is not active or already submitted.' } };
    }

    const now = new Date();

    await db.transaction(async (tx: any) => {
      // Submit attempt
      await tx.update(schema.examAttempts)
        .set({ status: 'submitted', submittedAt: now })
        .where(eq(schema.examAttempts.id, attemptId));

      // Auto-grade objective questions
      const answers = await tx.query.examAnswers.findMany({
        where: eq(schema.examAnswers.attemptId, attemptId),
        with: { selectedOption: true, question: { with: { options: true } } },
      });

      let totalScore = 0;
      let maximumScore = 0;
      let pendingManual = false;

      for (const answer of answers) {
        const q = answer.question;
        if (!q) continue;
        const qMarks = q.marks;
        maximumScore += qMarks;

        if (q.questionType === 'multiple_choice' || q.questionType === 'true_false') {
          const isCorrect = answer.selectedOption?.isCorrect === true;
          const awarded = isCorrect ? qMarks : 0;
          totalScore += awarded;

          await tx.update(schema.examAnswers)
            .set({ isCorrect, awardedMarks: String(awarded) })
            .where(eq(schema.examAnswers.id, answer.id));
        } else {
          pendingManual = true;
        }
      }

      const percentage = maximumScore > 0 ? Math.round((totalScore / maximumScore) * 100) : 0;

      // Get exam pass mark
      const exam = await tx.query.exams.findFirst({ where: eq(schema.exams.id, attempt.examId) });
      const isPassed = percentage >= (exam?.passMark || 50);

      // Insert or update result
      await tx.insert(schema.examResults).values({
        attemptId,
        examId: attempt.examId,
        userId: auth.user.id,
        totalScore: String(totalScore),
        maximumScore: String(maximumScore),
        percentage: String(percentage),
        isPassed,
        gradeStatus: pendingManual ? 'pending_manual_grading' : 'auto_graded',
      }).onConflictDoUpdate({
        target: [schema.examResults.attemptId],
        set: {
          totalScore: String(totalScore),
          maximumScore: String(maximumScore),
          percentage: String(percentage),
          isPassed,
          gradeStatus: pendingManual ? 'pending_manual_grading' : 'auto_graded',
        },
      });
    });

    return { statusCode: 200, body: { success: true, message: 'Examination submitted successfully.' } };
  }

  // ========================================================================
  // POST /api/attempts/:id/focus-lost  — Record focus loss event
  // ========================================================================
  const focusLostMatch = pathname.match(/^\/api\/attempts\/([^/]+)\/focus-lost$/);
  if (focusLostMatch && method === 'POST') {
    const attemptId = focusLostMatch[1];
    await db.update(schema.examAttempts)
      .set({ focusLostCount: sql`${schema.examAttempts.focusLostCount} + 1` })
      .where(eq(schema.examAttempts.id, attemptId));
    return { statusCode: 200, body: { success: true } };
  }

  // ========================================================================
  // GET /api/results  — Member's released results
  // ========================================================================
  if (pathname === '/api/results' && method === 'GET') {
    const auth = await requireUser(req);
    if (!auth) return { statusCode: 401, body: { success: false, error: 'Authentication required.' } };

    const results = await db.query.examResults.findMany({
      where: and(
        eq(schema.examResults.userId, auth.user.id),
        gt(schema.examResults.releasedAt, new Date(0))
      ),
      with: { exam: true },
      orderBy: [desc(schema.examResults.createdAt)],
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        results: results.map((r: any) => ({
          ...r,
          examTitle: r.exam?.title,
          totalScore: Number(r.totalScore),
          maximumScore: Number(r.maximumScore),
          percentage: Number(r.percentage),
        })),
      },
    };
  }

  return null; // Not handled
}
