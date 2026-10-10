<template>
  <div class="min-h-screen bg-mesh-dark text-slate-100 flex flex-col relative overflow-hidden">
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>

    <header class="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/dashboard" class="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-xs font-semibold uppercase tracking-wider">Back to Dashboard</span>
        </router-link>
        <h1 class="text-base font-bold text-white font-display">My Results</h1>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-5 relative z-10">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28"></div>
      </div>

      <div v-else-if="results.length === 0" class="glass-card rounded-3xl p-12 border border-slate-800/80 text-center shadow-2xl">
        <div class="w-16 h-16 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500 mb-4 shadow-inner">
          <svg class="w-8 h-8 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-white font-display">No Released Results Yet</h3>
        <p class="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">Your results will appear here once the Administrator releases them after grading is complete.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="result in results" :key="result.id" class="glass-card rounded-3xl p-6 border border-white/10 shadow-xl hover:border-emerald-500/30 transition-all duration-300">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="text-base font-bold text-white font-display">{{ result.examTitle || 'Examination' }}</h3>
              </div>
              <p class="text-xs text-slate-400 font-mono">
                Released {{ result.releasedAt ? new Date(result.releasedAt).toLocaleDateString() : 'N/A' }}
              </p>
            </div>

            <div class="flex items-center space-x-6">
              <!-- Score -->
              <div class="text-center">
                <div class="text-2xl font-black font-mono" :class="result.isPassed ? 'text-emerald-400' : 'text-rose-400'">
                  {{ result.percentage }}%
                </div>
                <div class="text-[11px] text-slate-400 font-mono">{{ result.totalScore }}/{{ result.maximumScore }} Marks</div>
              </div>

              <!-- Pass/Fail Badge -->
              <span :class="[result.isPassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40', 'px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md tracking-wide']">
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
