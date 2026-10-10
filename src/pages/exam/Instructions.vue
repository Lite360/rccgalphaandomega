<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/dashboard" class="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-sm font-medium">Back to Dashboard</span>
        </router-link>
        <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-2xl p-12 border border-slate-200 text-center animate-pulse">
        <div class="h-8 bg-slate-100 rounded w-2/3 mx-auto mb-4"></div>
        <div class="h-4 bg-slate-100 rounded w-full mb-2"></div>
        <div class="h-4 bg-slate-100 rounded w-4/5"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <router-link to="/dashboard" class="mt-4 inline-block text-sm font-semibold text-emerald-700">← Go Back</router-link>
      </div>

      <!-- Exam Instructions -->
      <template v-else-if="exam">
        <!-- Exam Header Card -->
        <div class="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20 mb-3">
            {{ exam.status.toUpperCase() }}
          </span>
          <h1 class="text-2xl font-bold font-display">{{ exam.title }}</h1>
          <p v-if="exam.description" class="text-emerald-100/80 text-sm mt-1">{{ exam.description }}</p>
        </div>

        <!-- Quick Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
            <div class="text-2xl font-bold text-slate-900">{{ Math.round(exam.durationSeconds / 60) }}</div>
            <div class="text-xs text-slate-500 mt-0.5">Minutes</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
            <div class="text-2xl font-bold text-slate-900">{{ exam.questionCount || '?' }}</div>
            <div class="text-xs text-slate-500 mt-0.5">Questions</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
            <div class="text-2xl font-bold text-emerald-700">{{ exam.passMark }}%</div>
            <div class="text-xs text-slate-500 mt-0.5">Pass Mark</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
            <div class="text-2xl font-bold text-slate-900">{{ exam.totalMarks }}</div>
            <div class="text-xs text-slate-500 mt-0.5">Total Marks</div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-slate-900">Examination Instructions</h2>
          <div v-if="exam.instructions" class="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap text-sm">
            {{ exam.instructions }}
          </div>
          <ul v-else class="space-y-2.5 text-sm text-slate-700">
            <li class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              </svg>
              <span>You have <strong>{{ Math.round(exam.durationSeconds / 60) }} minutes</strong> to complete this examination.</span>
            </li>
            <li class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              </svg>
              <span>Your answers are saved automatically. You can navigate between questions freely.</span>
            </li>
            <li class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              </svg>
              <span>The exam will close automatically when time runs out. Ensure you submit before the timer ends.</span>
            </li>
            <li class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Copying, screenshot attempts, and leaving the exam window may be recorded.</span>
            </li>
            <li class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              </svg>
              <span>Results will be released by the Administrator after grading is complete.</span>
            </li>
          </ul>
        </div>

        <!-- Start Button -->
        <button
          @click="startExam"
          :disabled="isStarting"
          class="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <svg v-if="isStarting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>{{ isStarting ? 'Starting Examination...' : 'Start Examination Now' }}</span>
        </button>

        <p class="text-xs text-slate-500 text-center">
          By clicking Start, you confirm you have read and understood the instructions.
        </p>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/services/api';
import type { Exam } from '@/types';

const router = useRouter();
const route = useRoute();

const exam = ref<Exam | null>(null);
const isLoading = ref(true);
const isStarting = ref(false);
const error = ref('');

const examId = route.params.id as string;

onMounted(async () => {
  try {
    const res = await api.get<{ exam: Exam }>(`/api/exams/${examId}`);
    if (res.success && res.data?.exam) {
      exam.value = res.data.exam;
    } else {
      error.value = res.error || 'Examination not found.';
    }
  } catch {
    error.value = 'Failed to load examination details.';
  } finally {
    isLoading.value = false;
  }
});

async function startExam() {
  isStarting.value = true;
  try {
    const res = await api.post<{ attempt: { id: string } }>(`/api/exams/${examId}/start`);
    if (res.success && res.data?.attempt?.id) {
      router.push(`/exam/${examId}/take`);
    } else {
      error.value = res.error || 'Unable to start exam. Please try again.';
    }
  } catch {
    error.value = 'Failed to start examination.';
  } finally {
    isStarting.value = false;
  }
}
</script>
