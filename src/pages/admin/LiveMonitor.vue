<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <router-link to="/access/exams" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </router-link>
      <div>
        <h2 class="text-2xl font-bold text-white font-display">Live Monitor</h2>
        <p class="text-xs text-slate-400 mt-1">Real-time participation for: <span class="text-emerald-400">{{ exam?.title || 'Loading...' }}</span></p>
      </div>
    </div>

    <!-- Exam Status Bar -->
    <div v-if="exam" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center space-x-4">
        <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase', exam.status === 'ongoing' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-700 text-slate-300']">
          {{ exam.status }}
        </span>
        <div class="text-sm text-slate-300">
          <span class="font-semibold text-white">{{ activeCount }}</span> active · 
          <span class="font-semibold text-white">{{ submittedCount }}</span> submitted · 
          <span class="font-semibold text-white">{{ totalAttempts }}</span> total
        </div>
      </div>

      <button
        v-if="exam.status === 'ongoing'"
        @click="showEndModal = true"
        class="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        <span>End Exam for All</span>
      </button>
    </div>

    <!-- Attempts Table -->
    <div class="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
      <div class="border-b border-slate-700 px-5 py-3 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Participants</span>
        <button @click="refreshData" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1">
          <svg :class="['w-3.5 h-3.5', isRefreshing ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div v-if="isLoading" class="p-8 text-center">
        <svg class="animate-spin h-6 w-6 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div v-else>
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-900/30">
              <th class="text-left text-xs font-semibold text-slate-400 px-5 py-3">Member</th>
              <th class="text-left text-xs font-semibold text-slate-400 px-5 py-3 hidden sm:table-cell">Parish</th>
              <th class="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
              <th class="text-left text-xs font-semibold text-slate-400 px-5 py-3 hidden md:table-cell">Last Activity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-if="attempts.length === 0">
              <td colspan="4" class="px-5 py-8 text-center text-slate-400 text-xs">No participants yet.</td>
            </tr>
            <tr v-for="attempt in attempts" :key="attempt.id" class="hover:bg-slate-700/20 transition-colors">
              <td class="px-5 py-3 font-semibold text-white">{{ attempt.userName }}</td>
              <td class="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">{{ attempt.parishName }}</td>
              <td class="px-5 py-3">
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', attempt.status === 'ongoing' ? 'bg-emerald-900/50 text-emerald-300 animate-pulse' : attempt.status === 'submitted' ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-700 text-slate-400']">
                  {{ attempt.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-5 py-3 text-slate-500 text-xs hidden md:table-cell">
                {{ attempt.lastActivityAt ? new Date(attempt.lastActivityAt).toLocaleTimeString() : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- End Exam Confirmation -->
    <Teleport to="body">
      <div v-if="showEndModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
          <div class="text-center">
            <div class="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white font-display">End Exam for All Participants?</h3>
            <p class="text-sm text-slate-400 mt-2">All <strong class="text-white">{{ activeCount }}</strong> active participants will be immediately ended. Saved answers are preserved. This action is logged and audited.</p>
          </div>
          <div class="flex space-x-3">
            <button @click="showEndModal = false" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all">Cancel</button>
            <button @click="endExam" :disabled="isEndingExam" class="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
              {{ isEndingExam ? 'Ending...' : 'Confirm End' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/services/api';
import type { Exam } from '@/types';

const route = useRoute();
const examId = route.params.id as string;

const exam = ref<Exam | null>(null);
const attempts = ref<any[]>([]);
const isLoading = ref(true);
const isRefreshing = ref(false);
const showEndModal = ref(false);
const isEndingExam = ref(false);

let pollInterval: any = null;

const activeCount = computed(() => attempts.value.filter(a => a.status === 'ongoing').length);
const submittedCount = computed(() => attempts.value.filter(a => a.status === 'submitted').length);
const totalAttempts = computed(() => attempts.value.length);

onMounted(async () => {
  await loadData();
  pollInterval = setInterval(refreshData, 15000);
});

onBeforeUnmount(() => clearInterval(pollInterval));

async function loadData() {
  isLoading.value = true;
  try {
    const [er, ar] = await Promise.all([
      api.get<{ exam: Exam }>(`/api/admin/exams/${examId}`),
      api.get<{ attempts: any[] }>(`/api/admin/exams/${examId}/attempts`),
    ]);
    if (er.success && er.data?.exam) exam.value = er.data.exam;
    if (ar.success && ar.data?.attempts) attempts.value = ar.data.attempts;
  } finally { isLoading.value = false; }
}

async function refreshData() {
  isRefreshing.value = true;
  try {
    const res = await api.get<{ attempts: any[] }>(`/api/admin/exams/${examId}/attempts`);
    if (res.success && res.data?.attempts) attempts.value = res.data.attempts;
  } finally { isRefreshing.value = false; }
}

async function endExam() {
  isEndingExam.value = true;
  try {
    const res = await api.post(`/api/admin/exams/${examId}/end`);
    if (res.success) {
      showEndModal.value = false;
      await loadData();
    }
  } finally { isEndingExam.value = false; }
}
</script>
