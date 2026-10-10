import { z } from 'zod';

// ============================================================================
// 1. AUTHENTICATION VALIDATORS
// ============================================================================

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  parishId: z.string().uuid('Valid Parish must be selected'),
  phoneE164: z.string().trim()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number with country code (e.g. +2348012345678)'),
});

export const loginSchema = z.object({
  phoneE164: z.string().trim()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number with country code'),
});

export const verifyOtpSchema = z.object({
  phoneE164: z.string().trim(),
  otpCode: z.string().trim().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['login', 'register', 'verify']).default('login'),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3, 'Username required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ============================================================================
// 2. PARISH VALIDATORS
// ============================================================================

export const createParishSchema = z.object({
  name: z.string().trim().min(3, 'Parish name must be at least 3 characters'),
  slug: z.string().trim().min(3).optional(),
  code: z.string().trim().max(50).optional(),
  zone: z.string().trim().max(100).optional(),
});

// ============================================================================
// 3. QUESTION VALIDATORS
// ============================================================================

export const questionOptionSchema = z.object({
  id: z.string().uuid().optional(),
  optionText: z.string().trim().min(1, 'Option text is required'),
  optionLetter: z.string().trim().max(5).optional(),
  isCorrect: z.boolean().default(false),
  position: z.number().int().default(0),
});

export const createQuestionSchema = z.object({
  questionText: z.string().trim().min(3, 'Question text is required'),
  questionType: z.enum(['multiple_choice', 'true_false', 'short_written', 'essay']),
  marks: z.number().int().min(1).default(1),
  topic: z.string().trim().max(100).optional(),
  explanation: z.string().trim().optional(),
  options: z.array(questionOptionSchema).optional(),
}).refine((data) => {
  if (data.questionType === 'multiple_choice') {
    if (!data.options || data.options.length < 2) return false;
    // Must have at least one correct option
    return data.options.some((opt) => opt.isCorrect);
  }
  if (data.questionType === 'true_false') {
    if (!data.options || data.options.length !== 2) return false;
    return data.options.some((opt) => opt.isCorrect);
  }
  return true;
}, {
  message: 'Multiple-choice and True/False questions must have valid options and one correct answer marked',
});

// ============================================================================
// 4. EXAMINATION VALIDATORS
// ============================================================================

export const createExamSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(255),
  description: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  durationSeconds: z.number().int().min(60, 'Duration must be at least 1 minute').default(1800),
  passMark: z.number().int().min(1).max(100).default(50),
  totalMarks: z.number().int().min(1).default(100),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  allowMultipleAttempts: z.boolean().default(false),
  maxAttempts: z.number().int().min(1).default(1),
  targetParishIds: z.array(z.string().uuid()).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  questionIds: z.array(z.string().uuid()).optional(),
});

export const updateExamStatusSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published', 'ongoing', 'ended', 'cancelled', 'archived']),
});

// ============================================================================
// 5. ATTEMPT & ANSWER VALIDATORS
// ============================================================================

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid().nullable().optional(),
  writtenResponse: z.string().nullable().optional(),
  answerPayload: z.any().optional(),
});

export const manualGradeSchema = z.object({
  answerId: z.string().uuid(),
  awardedMarks: z.number().min(0),
  feedback: z.string().trim().optional(),
});
