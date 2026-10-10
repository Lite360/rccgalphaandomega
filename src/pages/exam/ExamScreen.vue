<template>
  <!-- Examination Screen: Secure Mode -->
  <div class="exam-secure-mode min-h-screen bg-slate-900 text-white flex flex-col">
    <!-- Exam Top Bar -->
    <header class="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 flex-shrink-0">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white line-clamp-1">{{ attempt?.exam?.title || 'Examination' }}</div>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Save Status -->
          <div class="hidden sm:flex items-center space-x-1.5 text-xs">
            <div :class="['w-2 h-2 rounded-full', saveStatus === 'saved' ? 'bg-emerald-400' : saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600']"></div>
            <span class="text-slate-300">{{ saveStatusText }}</span>
          </div>

          <!-- Timer -->
          <div :class="['px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-all', timerDanger ? 'bg-red-900/60 border-red-700/60 text-red-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-white']">
            {{ formattedTime }}
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-3">
        <svg class="animate-spin h-8 w-8 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-slate-400 text-sm">Loading your examination...</p>
      </div>
    </div>

    <!-- Exam Ended Banner -->
    <div v-else-if="examEnded" class="flex-1 flex items-center justify-center p-8">
      <div class="bg-slate-800 border border-slate-700 rounded-3xl p-10 max-w-md w-full text-center space-y-5">
        <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold font-display">{{ submittedMessage }}</h2>
        <p class="text-slate-400 text-sm">Your saved answers have been recorded. Results will be released by the Administrator after grading.</p>
        <router-link to="/dashboard" class="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all text-sm">
          Return to Dashboard
        </router-link>
      </div>
    </div>

    <!-- Main Exam Body -->
    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Question Sidebar (Desktop) -->
      <aside class="hidden lg:flex flex-col w-56 bg-slate-950/70 border-r border-slate-800 p-4 space-y-3 overflow-y-auto flex-shrink-0">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1">Questions</p>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            @click="goToQuestion(i)"
            :class="[
              'w-full aspect-square rounded-lg text-xs font-bold transition-all',
              currentIndex === i ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' :
              answers[q.id] ? 'bg-slate-700 text-emerald-400 border border-emerald-800/50' :
              'bg-slate-800 text-slate-400 hover:bg-slate-700'
            ]"
          >
            {{ i + 1 }}
          </button>
        </div>

        <div class="pt-2 space-y-1.5 text-[11px] text-slate-400">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded bg-emerald-600"></div>
            <span>Current</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded bg-slate-700 border border-emerald-800/50"></div>
            <span>Answered ({{ answeredCount }}/{{ questions.length }})</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded bg-slate-800"></div>
            <span>Unanswered</span>
          </div>
        </div>
      </aside>

      <!-- Question Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <!-- Question Card -->
          <div v-if="currentQuestion" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
            <!-- Question Header -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Question {{ currentIndex + 1 }} of {{ questions.length }}
              </span>
              <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-700/40 px-2.5 py-0.5 rounded-full">
                {{ currentQuestion.marks }} {{ currentQuestion.marks === 1 ? 'mark' : 'marks' }}
              </span>
            </div>

            <!-- Question Text -->
            <p class="text-base sm:text-lg font-medium text-white leading-relaxed">
              {{ currentQuestion.questionText }}
            </p>

            <!-- MCQ / True-False Options -->
            <div v-if="currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false'" class="space-y-3">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                @click="selectOption(option.id)"
                :class="[
                  'w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center space-x-3 active:scale-[0.99]',
                  answers[currentQuestion.id] === option.id
                    ? 'bg-emerald-600/20 border-emerald-500/70 text-emerald-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-600/60 text-slate-200 hover:border-slate-500 hover:bg-slate-700/50'
                ]"
              >
                <span :class="['w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all', answers[currentQuestion.id] === option.id ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-600 text-slate-400']">
                  {{ option.optionLetter || String.fromCharCode(65 + (currentQuestion.options?.indexOf(option) || 0)) }}
                </span>
                <span>{{ option.optionText }}</span>
              </button>
            </div>

            <!-- Written Answer -->
            <div v-else class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Answer</label>
              <textarea
                v-model="writtenAnswers[currentQuestion.id]"
                @input="onWrittenInput"
                :placeholder="currentQuestion.questionType === 'short_written' ? 'Type your short answer here...' : 'Type your essay answer here...'"
                :rows="currentQuestion.questionType === 'essay' ? 8 : 4"
                class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                style="-webkit-user-select: text !important; user-select: text !important;"
              ></textarea>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="flex items-center justify-between">
            <button
              @click="previousQuestion"
              :disabled="currentIndex === 0"
              class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all disabled:opacity-40 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <div class="text-xs text-slate-400 hidden sm:block">
              {{ answeredCount }}/{{ questions.length }} answered
            </div>

            <div class="flex items-center space-x-3">
              <button
                v-if="currentIndex < questions.length - 1"
                @click="nextQuestion"
                class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl border border-slate-600 transition-all flex items-center space-x-2"
              >
                <span>Next</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-else
                @click="confirmSubmit = true"
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2"
              >
                <span>Submit Exam</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Submit Button (always visible at bottom on mobile) -->
          <button
            v-if="currentIndex !== questions.length - 1"
            @click="confirmSubmit = true"
            class="sm:hidden w-full py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl border border-slate-600 transition-all"
          >
            Submit Examination
          </button>
        </div>
      </main>
    </div>

    <!-- Submit Confirmation Modal -->
    <Teleport to="body">
      <div v-if="confirmSubmit" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5 animate-fadeIn">
          <div class="text-center">
            <div class="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white font-display">Submit Examination?</h3>
            <p class="text-sm text-slate-400 mt-2">
              You have answered <strong class="text-white">{{ answeredCount }} of {{ questions.length }}</strong> questions.
              <span v-if="answeredCount < questions.length" class="text-amber-300"> {{ questions.length - answeredCount }} unanswered.</span>
              This action cannot be undone.
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="confirmSubmit = false"
              class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all"
            >
              Continue Exam
            </button>
            <button
              @click="submitExam"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {{ isSubmitting ? 'Submitting...' : 'Confirm Submit' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/api';
import type { Question, ExamAttempt } from '@/types';

const route = useRoute();
const router = useRouter();
const examId = route.params.id as string;

// State
const isLoading = ref(true);
const attempt = ref<any>(null);
const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const answers = ref<Record<string, string>>({}); // questionId -> optionId
const writtenAnswers = ref<Record<string, string>>({}); // questionId -> text
const saveStatus = ref<'saved' | 'saving' | 'idle'>('saved');
const confirmSubmit = ref(false);
const isSubmitting = ref(false);
const examEnded = ref(false);
const submittedMessage = ref('Examination Submitted');

// Timer
const secondsRemaining = ref(0);
let timerInterval: any = null;
let statusPollInterval: any = null;
let saveDebounce: any = null;

const formattedTime = computed(() => {
  const m = Math.floor(secondsRemaining.value / 60);
  const s = secondsRemaining.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const timerDanger = computed(() => secondsRemaining.value <= 120);

const currentQuestion = computed(() => questions.value[currentIndex.value] || null);

const answeredCount = computed(() =>
  questions.value.filter(q => answers.value[q.id] || writtenAnswers.value[q.id]).length
);

const saveStatusText = computed(() => {
  if (saveStatus.value === 'saving') return 'Saving...';
  if (saveStatus.value === 'saved') return 'All answers saved';
  return 'Not saved';
});

onMounted(async () => {
  await loadAttempt();
  setupCopyRestrictions();
});

onBeforeUnmount(() => {
  clearInterval(timerInterval);
  clearInterval(statusPollInterval);
  clearTimeout(saveDebounce);
  removeCopyRestrictions();
});

async function loadAttempt() {
  try {
    const res = await api.get<{ attempt: any; questions: Question[] }>(`/api/attempts/current/${examId}`);
    if (res.success && res.data) {
      attempt.value = res.data.attempt;
      questions.value = res.data.questions || [];

      // Pre-populate saved answers
      if (res.data.attempt?.savedAnswers) {
        for (const ans of res.data.attempt.savedAnswers) {
          if (ans.selectedOptionId) answers.value[ans.questionId] = ans.selectedOptionId;
          if (ans.writtenResponse) writtenAnswers.value[ans.questionId] = ans.writtenResponse;
        }
      }

      // Calculate remaining time from server deadline
      const deadline = new Date(res.data.attempt.deadlineAt).getTime();
      const now = Date.now();
      secondsRemaining.value = Math.max(0, Math.floor((deadline - now) / 1000));

      startTimer();
      startStatusPolling();
    }
  } catch (err) {
    console.error('Failed to load attempt:', err);
  } finally {
    isLoading.value = false;
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (secondsRemaining.value <= 0) {
      clearInterval(timerInterval);
      autoSubmit();
    } else {
      secondsRemaining.value--;
    }
  }, 1000);
}

function startStatusPolling() {
  clearInterval(statusPollInterval);
  statusPollInterval = setInterval(async () => {
    try {
      const res = await api.get<{ status: string; ended: boolean }>(`/api/exams/${examId}/status`);
      if (res.success && res.data?.ended) {
        clearInterval(statusPollInterval);
        clearInterval(timerInterval);
        submittedMessage.value = 'Examination Ended by Administrator';
        examEnded.value = true;
      }
    } catch {}
  }, 10000); // Poll every 10 seconds
}

function goToQuestion(index: number) {
  currentIndex.value = index;
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++;
}

function previousQuestion() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function selectOption(optionId: string) {
  if (!currentQuestion.value) return;
  answers.value[currentQuestion.value.id] = optionId;
  scheduleSave(currentQuestion.value.id, { selectedOptionId: optionId });
}

function onWrittenInput() {
  if (!currentQuestion.value) return;
  const text = writtenAnswers.value[currentQuestion.value.id];
  scheduleSave(currentQuestion.value.id, { writtenResponse: text });
}

function scheduleSave(questionId: string, payload: any) {
  if (!attempt.value?.id) return;
  clearTimeout(saveDebounce);
  saveStatus.value = 'saving';
  saveDebounce = setTimeout(async () => {
    try {
      await api.put(`/api/attempts/${attempt.value.id}/answers/${questionId}`, payload);
      saveStatus.value = 'saved';
    } catch {
      saveStatus.value = 'idle';
    }
  }, 700);
}

async function autoSubmit() {
  if (examEnded.value) return;
  submittedMessage.value = 'Time Expired – Examination Submitted';
  await doSubmit();
}

async function submitExam() {
  isSubmitting.value = true;
  await doSubmit();
  isSubmitting.value = false;
}

async function doSubmit() {
  if (!attempt.value?.id) return;
  try {
    await api.post(`/api/attempts/${attempt.value.id}/submit`);
  } catch {}
  clearInterval(timerInterval);
  clearInterval(statusPollInterval);
  confirmSubmit.value = false;
  examEnded.value = true;
}

// ============================================================
// Copy/Cheat Deterrents (Exam Integrity)
// ============================================================
function blockEvent(e: Event) { e.preventDefault(); }
function onVisibilityChange() {
  if (document.hidden && attempt.value?.id) {
    api.post(`/api/attempts/${attempt.value.id}/focus-lost`).catch(() => {});
  }
}

function setupCopyRestrictions() {
  document.addEventListener('copy', blockEvent);
  document.addEventListener('cut', blockEvent);
  document.addEventListener('contextmenu', blockEvent);
  document.addEventListener('visibilitychange', onVisibilityChange);
}
function removeCopyRestrictions() {
  document.removeEventListener('copy', blockEvent);
  document.removeEventListener('cut', blockEvent);
  document.removeEventListener('contextmenu', blockEvent);
  document.removeEventListener('visibilitychange', onVisibilityChange);
}
</script>
