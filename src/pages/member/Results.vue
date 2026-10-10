<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/dashboard" class="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-sm font-medium">Back to Dashboard</span>
        </router-link>
        <h1 class="text-base font-bold text-slate-900">My Results</h1>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-5">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28"></div>
      </div>

      <div v-else-if="results.length === 0" class="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-800">No Released Results Yet</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Your results will appear here once the Administrator releases them after grading is complete.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="result in results" :key="result.id" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="text-base font-bold text-slate-900">{{ result.examTitle || 'Examination' }}</h3>
              </div>
              <p class="text-xs text-slate-500">
                Released {{ result.releasedAt ? new Date(result.releasedAt).toLocaleDateString() : 'N/A' }}
              </p>
            </div>

            <div class="flex items-center space-x-6">
              <!-- Score -->
              <div class="text-center">
                <div class="text-2xl font-bold" :class="result.isPassed ? 'text-emerald-700' : 'text-red-600'">
                  {{ result.percentage }}%
                </div>
                <div class="text-xs text-slate-500">{{ result.totalScore }}/{{ result.maximumScore }}</div>
              </div>

              <!-- Pass/Fail Badge -->
              <span :class="[result.isPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200', 'px-3 py-1 rounded-full text-xs font-bold border']">
                {{ result.isPassed ? '✓ PASSED' : '✗ FAILED' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { ExamResult } from '@/types';

const results = ref<ExamResult[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get<{ results: ExamResult[] }>('/api/results');
    if (res.success && res.data?.results) {
      results.value = res.data.results;
    }
  } catch (err) {
    console.error('Failed to load results:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>
