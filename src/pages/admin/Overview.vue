<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white font-display">System Overview</h2>
        <p class="text-xs text-slate-400 mt-1">Real-time status of examinations, participation, and grading</p>
      </div>

      <div class="flex items-center space-x-3">
        <router-link
          to="/access/exams"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Examination</span>
        </router-link>
        <router-link
          to="/access/questions"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Question</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-5 relative overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ stat.title }}</span>
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.iconBg, stat.iconColor]">
            <component :is="stat.icon" class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <span class="text-3xl font-bold text-white font-display">{{ stat.value }}</span>
          <span class="text-xs text-slate-400">{{ stat.subtitle }}</span>
        </div>
      </div>
    </div>

    <!-- Ongoing & Published Examinations Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Active Exams (2 Cols) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white font-display flex items-center space-x-2">
            <span>Ongoing & Live Examinations</span>
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h3>
          <router-link to="/access/exams" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
            View All Exams →
          </router-link>
        </div>

        <div v-if="activeExams.length === 0" class="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center">
          <p class="text-xs text-slate-400">No examinations currently ongoing.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="exam in activeExams"
            :key="exam.id"
            class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-all"
          >
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                  {{ exam.status }}
                </span>
                <span class="text-xs text-slate-400">{{ Math.round(exam.durationSeconds / 60) }} Mins</span>
              </div>
              <h4 class="text-base font-bold text-white">{{ exam.title }}</h4>
              <p class="text-xs text-slate-400 mt-0.5">Pass Mark: {{ exam.passMark }}% · Questions: {{ exam.questionCount || 0 }}</p>
            </div>

            <div class="flex items-center space-x-2">
              <router-link
                :to="`/access/monitor/${exam.id}`"
                class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center space-x-1"
              >
                <span>Live Monitor</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick System Audit & Activity -->
      <div class="space-y-4">
        <h3 class="text-base font-bold text-white font-display">Recent Audit Events</h3>
        <div class="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div v-for="(event, idx) in auditEvents" :key="idx" class="flex items-start space-x-3 text-xs">
            <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <div class="text-slate-200 font-medium">{{ event.action }}</div>
              <div class="text-slate-500 text-[11px]">{{ event.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { api } from '@/services/api';
import type { Exam } from '@/types';

// Simple SVG icon render helpers
const UsersIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-4 h-4' }, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }),
]);
const BookIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-4 h-4' }, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }),
]);
const CheckIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-4 h-4' }, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }),
]);
const ClockIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-4 h-4' }, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }),
]);

const stats = ref([
  { title: 'Total Members', value: '1', subtitle: 'Registered users', icon: UsersIcon, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { title: 'Question Bank', value: '4', subtitle: 'Curated items', icon: BookIcon, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { title: 'Submissions', value: '0', subtitle: 'Exam attempts', icon: CheckIcon, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  { title: 'Pending Grading', value: '0', subtitle: 'Written answers', icon: ClockIcon, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
]);

const activeExams = ref<Exam[]>([]);
const auditEvents = ref([
  { action: 'Admin session initialized', time: 'Just now' },
  { action: 'Database seed loaded successfully', time: '5m ago' },
]);

onMounted(async () => {
  try {
    const res = await api.get<{ stats: any; activeExams: Exam[] }>('/api/admin/overview');
    if (res.success && res.data) {
      if (res.data.stats) {
        stats.value[0].value = String(res.data.stats.totalUsers || 0);
        stats.value[1].value = String(res.data.stats.totalQuestions || 0);
        stats.value[2].value = String(res.data.stats.totalSubmissions || 0);
        stats.value[3].value = String(res.data.stats.pendingGrading || 0);
      }
      if (res.data.activeExams) {
        activeExams.value = res.data.activeExams;
      }
    }
  } catch (err) {
    console.error('Failed to load overview data:', err);
  }
});
</script>
