export interface Parish {
  id: string;
  name: string;
  slug: string;
  code?: string;
  zone?: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  fullName: string;
  parishId: string;
  parishName?: string;
  phoneE164: string;
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  status: 'active' | 'suspended';
  lastLoginAt?: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_written' | 'essay';

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionLetter?: string;
  isCorrect?: boolean; // Hidden from member responses!
  position: number;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  topic?: string;
  explanation?: string;
  status: 'active' | 'inactive';
  options?: QuestionOption[];
}

export type ExamStatus = 'draft' | 'scheduled' | 'published' | 'ongoing' | 'ended' | 'cancelled' | 'archived';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  status: ExamStatus;
  durationSeconds: number;
  passMark: number;
  totalMarks: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts: number;
  targetParishIds?: string[] | null;
  startsAt?: string;
  endsAt?: string;
  endedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  attemptNumber: number;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string;
  status: 'ongoing' | 'submitted' | 'ended_by_admin' | 'timed_out' | 'abandoned';
  focusLostCount: number;
  lastActivityAt: string;
}

export interface ExamAnswer {
  id?: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  writtenResponse?: string;
  isCorrect?: boolean;
  awardedMarks?: number;
  isManuallyGraded?: boolean;
  feedback?: string;
  savedAt?: string;
}

export interface ExamResult {
  id: string;
  attemptId: string;
  examId: string;
  examTitle?: string;
  userId: string;
  userName?: string;
  parishName?: string;
  totalScore: number;
  maximumScore: number;
  percentage: number;
  isPassed: boolean;
  gradeStatus: 'auto_graded' | 'pending_manual_grading' | 'fully_graded';
  releasedAt?: string;
  submittedAt?: string;
  createdAt: string;
}
