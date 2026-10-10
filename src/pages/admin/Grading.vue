<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-white font-display">Grading & Results</h2>
      <p class="text-xs text-slate-400 mt-1">Grade written answers and release examination results to members</p>
    </div>

    <!-- Exam Selector -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 mb-1.5">Select Examination</label>
      <select v-model="selectedExamId" @change="loadSubmissions" class="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500">
        <option value="">-- Choose an exam --</option>
        <option v-for="exam in exams" :key="exam.id" :value="exam.id">{{ exam.title }} ({{ exam.status }})</option>
      </select>
    </div>

    <!-- Submissions Table -->
    <div v-if="selectedExamId">
      <div v-if="isLoading" class="space-y-2">
        <div v-for="i in 4" :key="i" class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 animate-pulse h-16"></div>
      </div>

      <div v-else-if="submissions.length === 0" class="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center">
        <p class="text-slate-400 text-sm">No submissions yet for this examination.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="sub in submissions" :key="sub.id" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-sm font-bold text-white">{{ sub.userName }}</div>
              <div class="text-xs text-slate-400">{{ sub.parishName }} · Submitted {{ sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A' }}</div>
            </div>
            <div class="flex items-center space-x-3">
              <span :class="['px-2.5 py-1 rounded-full text-[11px] font-bold', sub.gradeStatus === 'fully_graded' ? 'bg-emerald-900/50 text-emerald-300' : sub.gradeStatus === 'auto_graded' ? 'bg-blue-900/50 text-blue-300' : 'bg-amber-900/50 text-amber-300']">
                {{ sub.gradeStatus === 'fully_graded' ? 'Fully Graded' : sub.gradeStatus === 'auto_graded' ? 'Auto Graded' : 'Pending Grading' }}
              </span>
              <div class="text-lg font-bold text-white">{{ sub.totalScore }}/{{ sub.maximumScore }}</div>
              <button
                v-if="!sub.releasedAt"
                @click="releaseResult(sub.id)"
                :disabled="sub.gradeStatus === 'pending_manual_grading'"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-40"
              >
                Release Result
              </button>
              <span v-else class="text-xs text-emerald-400 font-semibold">✓ Released</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { Exam, ExamResult } from '@/types';

const exams = ref<Exam[]>([]);
const selectedExamId = ref('');
const submissions = ref<ExamResult[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  const res = await api.get<{ exams: Exam[] }>('/api/admin/exams');
  if (res.success && res.data?.exams) exams.value = res.data.exams.filter(e => e.status === 'ended' || e.status === 'ongoing');
});

async function loadSubmissions() {
  if (!selectedExamId.value) return;
  isLoading.value = true;
  try {
    const res = await api.get<{ results: ExamResult[] }>(`/api/admin/exams/${selectedExamId.value}/results`);
    if (res.success && res.data?.results) submissions.value = res.data.results;
    else submissions.value = [];
  } finally { isLoading.value = false; }
}

async function releaseResult(resultId: string) {
  const res = await api.post(`/api/admin/results/${resultId}/release`);
  if (res.success) {
    const sub = submissions.value.find(s => s.id === resultId);
    if (sub) sub.releasedAt = new Date().toISOString();
  }
}
</script>
