<template>
  <div class="min-h-screen bg-mesh-dark text-slate-100 flex flex-col relative overflow-hidden">
    <!-- Glowing background decorative dynamic elements -->
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>

    <!-- Member Header -->
    <header class="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="RCCG Logo" class="w-10 h-10 object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)] animate-float" />
          <div>
            <h1 class="text-base font-bold text-white font-display leading-tight flex items-center space-x-2">
              <span>RCCG Sunday School</span>
            </h1>
            <p class="text-xs text-emerald-400 font-mono">Examination Portal</p>
          </div>
        </div>

        <!-- User profile & Logout -->
        <div class="flex items-center space-x-4">
          <div class="text-right hidden sm:block">
            <div class="text-xs font-bold text-white">{{ authStore.user?.fullName }}</div>
            <div class="text-[11px] text-emerald-400 font-medium">{{ authStore.user?.parishName || 'Member' }}</div>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-all border border-transparent hover:border-red-900/50"
            title="Sign Out"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      <!-- Member Welcome Banner -->
      <div class="bg-gradient-to-r from-emerald-950 via-teal-900/80 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden glow-emerald">
        <div class="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3 backdrop-blur-md">
            📍 {{ authStore.user?.parishName || 'RCCG Member' }}
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
            Welcome, {{ authStore.user?.fullName }}
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Check below for active Sunday School examinations. Make sure you have a stable network before beginning.
          </p>
        </div>
      </div>

      <!-- Examinations Section -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-white font-display flex items-center space-x-2">
              <span>Available Examinations</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h3>
            <p class="text-xs text-slate-400">Active and upcoming Sunday School assessments</p>
          </div>
          <router-link
            to="/results"
            class="text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 px-4 py-2.5 rounded-xl transition-all duration-300 inline-flex items-center space-x-1.5 shadow-lg"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View Released Results</span>
          </router-link>
        </div>

        <!-- Exam List -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="i in 2" :key="i" class="glass-card rounded-3xl p-6 border border-slate-800 animate-pulse space-y-4">
            <div class="h-5 bg-slate-800 rounded-xl w-2/3"></div>
            <div class="h-4 bg-slate-800/60 rounded-xl w-full"></div>
            <div class="h-10 bg-slate-800/80 rounded-xl mt-4"></div>
          </div>
        </div>

        <div v-else-if="exams.length === 0" class="glass-card rounded-3xl p-12 text-center border border-slate-800/80 shadow-2xl">
          <div class="w-16 h-16 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4 shadow-inner">
            <svg class="w-8 h-8 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 class="text-base font-bold text-white font-display">No Active Examinations</h4>
          <p class="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            There are currently no active exams scheduled for your parish. Please check back at the scheduled examination time.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="exam in exams"
            :key="exam.id"
            class="glass-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span
                  :class="[
                    exam.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md'
                  ]"
                >
                  ● {{ exam.status }}
                </span>
                <span class="text-xs text-slate-400 font-mono flex items-center space-x-1">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ Math.round(exam.durationSeconds / 60) }} Mins</span>
                </span>
              </div>
              <h4 class="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug font-display">{{ exam.title }}</h4>
              <p class="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">{{ exam.description || 'Sunday school assessment' }}</p>
            </div>

            <div class="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <div class="text-xs text-slate-400">
                Pass Mark: <span class="font-bold text-emerald-400 font-mono">{{ exam.passMark }}%</span>
              </div>
              <router-link
                :to="`/exam/${exam.id}/instructions`"
                class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <span>Take Exam</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';
import type { Exam } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const exams = ref<Exam[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get<{ exams: Exam[] }>('/api/exams');
    if (res.success && res.data?.exams) {
      exams.value = res.data.exams;
    }
  } catch (err) {
    console.error('Failed to load exams:', err);
  } finally {
    isLoading.value = false;
  }
});

async function handleLogout() {
  await authStore.logout();
  router.push('/');
}
</script>
