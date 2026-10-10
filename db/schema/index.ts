import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --------------------------------------------------------------------------
// 1. PARISHES
// --------------------------------------------------------------------------
export const parishes = pgTable('parishes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  code: varchar('code', { length: 50 }),
  zone: varchar('zone', { length: 100 }),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'inactive'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const parishesRelations = relations(parishes, ({ many }) => ({
  users: many(users),
}));

// --------------------------------------------------------------------------
// 2. USERS (Church Members)
// --------------------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  parishId: uuid('parish_id').references(() => parishes.id, { onDelete: 'restrict' }).notNull(),
  phoneE164: varchar('phone_e164', { length: 30 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'suspended'
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_phone_idx').on(table.phoneE164),
  index('users_parish_idx').on(table.parishId),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  parish: one(parishes, {
    fields: [users.parishId],
    references: [parishes.id],
  }),
  attempts: many(examAttempts),
  results: many(examResults),
}));

// --------------------------------------------------------------------------
// 3. ADMINS
// --------------------------------------------------------------------------
export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'suspended'
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const adminsRelations = relations(admins, ({ many }) => ({
  createdExams: many(exams),
  auditLogs: many(auditLogs),
}));

// --------------------------------------------------------------------------
// 4. EXAMS
// --------------------------------------------------------------------------
export const exams = pgTable('exams', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  status: varchar('status', { length: 30 }).default('draft').notNull(), // 'draft', 'scheduled', 'published', 'ongoing', 'ended', 'cancelled', 'archived'
  durationSeconds: integer('duration_seconds').notNull().default(1800), // 30 mins default
  passMark: integer('pass_mark').notNull().default(50),
  totalMarks: integer('total_marks').notNull().default(100),
  randomizeQuestions: boolean('randomize_questions').default(false).notNull(),
  randomizeOptions: boolean('randomize_options').default(false).notNull(),
  allowMultipleAttempts: boolean('allow_multiple_attempts').default(false).notNull(),
  maxAttempts: integer('max_attempts').default(1).notNull(),
  targetParishIds: jsonb('target_parish_ids').$type<string[] | null>().default(null), // null = all parishes
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => admins.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('exams_status_idx').on(table.status),
  index('exams_dates_idx').on(table.startsAt, table.endsAt),
]);

export const examsRelations = relations(exams, ({ one, many }) => ({
  creator: one(admins, {
    fields: [exams.createdBy],
    references: [admins.id],
  }),
  examQuestions: many(examQuestions),
  attempts: many(examAttempts),
  results: many(examResults),
}));

// --------------------------------------------------------------------------
// 5. QUESTIONS
// --------------------------------------------------------------------------
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 30 }).notNull(), // 'multiple_choice', 'true_false', 'short_written', 'essay'
  marks: integer('marks').notNull().default(1),
  topic: varchar('topic', { length: 100 }),
  explanation: text('explanation'),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'inactive'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const questionsRelations = relations(questions, ({ many }) => ({
  options: many(questionOptions),
  examQuestions: many(examQuestions),
  answers: many(examAnswers),
}));

// --------------------------------------------------------------------------
// 6. QUESTION OPTIONS (For MCQ & True/False)
// --------------------------------------------------------------------------
export const questionOptions = pgTable('question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  optionText: text('option_text').notNull(),
  optionLetter: varchar('option_letter', { length: 5 }), // 'A', 'B', 'C', 'D'
  isCorrect: boolean('is_correct').default(false).notNull(),
  position: integer('position').default(0).notNull(),
}, (table) => [
  index('question_options_qid_idx').on(table.questionId),
]);

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

// --------------------------------------------------------------------------
// 7. EXAM QUESTIONS (Junction / Mapping)
// --------------------------------------------------------------------------
export const examQuestions = pgTable('exam_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  examId: uuid('exam_id').references(() => exams.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  position: integer('position').default(0).notNull(),
  marksOverride: integer('marks_override'),
}, (table) => [
  uniqueIndex('exam_question_idx').on(table.examId, table.questionId),
  index('exam_questions_exam_idx').on(table.examId),
]);

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
  question: one(questions, {
    fields: [examQuestions.questionId],
    references: [questions.id],
  }),
}));

// --------------------------------------------------------------------------
// 8. EXAM ATTEMPTS
// --------------------------------------------------------------------------
export const examAttempts = pgTable('exam_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  examId: uuid('exam_id').references(() => exams.id, { onDelete: 'restrict' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  status: varchar('status', { length: 30 }).default('ongoing').notNull(), // 'ongoing', 'submitted', 'ended_by_admin', 'timed_out', 'abandoned'
  focusLostCount: integer('focus_lost_count').default(0).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('attempts_user_exam_idx').on(table.userId, table.examId),
  index('attempts_status_idx').on(table.status),
]);

export const examAttemptsRelations = relations(examAttempts, ({ one, many }) => ({
  exam: one(exams, {
    fields: [examAttempts.examId],
    references: [exams.id],
  }),
  user: one(users, {
    fields: [examAttempts.userId],
    references: [users.id],
  }),
  answers: many(examAnswers),
  result: one(examResults, {
    fields: [examAttempts.id],
    references: [examResults.attemptId],
  }),
}));

// --------------------------------------------------------------------------
// 9. EXAM ANSWERS (Incremental / Saved per question)
// --------------------------------------------------------------------------
export const examAnswers = pgTable('exam_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id').references(() => examAttempts.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'restrict' }).notNull(),
  selectedOptionId: uuid('selected_option_id').references(() => questionOptions.id, { onDelete: 'set null' }),
  writtenResponse: text('written_response'),
  answerPayload: jsonb('answer_payload'),
  isCorrect: boolean('is_correct'),
  awardedMarks: numeric('awarded_marks', { precision: 6, scale: 2 }),
  isManuallyGraded: boolean('is_manually_graded').default(false).notNull(),
  gradedBy: uuid('graded_by').references(() => admins.id, { onDelete: 'set null' }),
  feedback: text('feedback'),
  savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('attempt_question_idx').on(table.attemptId, table.questionId),
  index('exam_answers_attempt_idx').on(table.attemptId),
]);

export const examAnswersRelations = relations(examAnswers, ({ one }) => ({
  attempt: one(examAttempts, {
    fields: [examAnswers.attemptId],
    references: [examAttempts.id],
  }),
  question: one(questions, {
    fields: [examAnswers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(questionOptions, {
    fields: [examAnswers.selectedOptionId],
    references: [questionOptions.id],
  }),
  grader: one(admins, {
    fields: [examAnswers.gradedBy],
    references: [admins.id],
  }),
}));

// --------------------------------------------------------------------------
// 10. EXAM RESULTS
// --------------------------------------------------------------------------
export const examResults = pgTable('exam_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id').references(() => examAttempts.id, { onDelete: 'cascade' }).notNull().unique(),
  examId: uuid('exam_id').references(() => exams.id, { onDelete: 'restrict' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  totalScore: numeric('total_score', { precision: 6, scale: 2 }).default('0').notNull(),
  maximumScore: numeric('maximum_score', { precision: 6, scale: 2 }).default('100').notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).default('0').notNull(),
  isPassed: boolean('is_passed').default(false).notNull(),
  gradeStatus: varchar('grade_status', { length: 30 }).default('pending_manual_grading').notNull(), // 'auto_graded', 'pending_manual_grading', 'fully_graded'
  releasedAt: timestamp('released_at', { withTimezone: true }),
  releasedBy: uuid('released_by').references(() => admins.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('results_exam_idx').on(table.examId),
  index('results_user_idx').on(table.userId),
  index('results_release_idx').on(table.releasedAt),
]);

export const examResultsRelations = relations(examResults, ({ one }) => ({
  attempt: one(examAttempts, {
    fields: [examResults.attemptId],
    references: [examAttempts.id],
  }),
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
  user: one(users, {
    fields: [examResults.userId],
    references: [users.id],
  }),
  releaser: one(admins, {
    fields: [examResults.releasedBy],
    references: [admins.id],
  }),
}));

// --------------------------------------------------------------------------
// 11. OTP CHALLENGES
// --------------------------------------------------------------------------
export const otpChallenges = pgTable('otp_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  phoneE164: varchar('phone_e164', { length: 30 }).notNull(),
  otpCode: varchar('otp_code', { length: 10 }).notNull(),
  purpose: varchar('purpose', { length: 30 }).default('login').notNull(), // 'login', 'register', 'verify'
  attempts: integer('attempts').default(0).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('otp_phone_idx').on(table.phoneE164),
]);

// --------------------------------------------------------------------------
// 12. USER SESSIONS
// --------------------------------------------------------------------------
export const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  adminId: uuid('admin_id').references(() => admins.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user', 'admin'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sessions_user_idx').on(table.userId),
  index('sessions_admin_idx').on(table.adminId),
  index('sessions_expires_idx').on(table.expiresAt),
]);

// --------------------------------------------------------------------------
// 13. AUDIT LOGS
// --------------------------------------------------------------------------
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => admins.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_admin_idx').on(table.adminId),
  index('audit_created_idx').on(table.createdAt),
]);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [auditLogs.adminId],
    references: [admins.id],
  }),
}));
