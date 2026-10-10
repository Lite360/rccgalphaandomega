<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Member Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="RCCG Logo" class="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <h1 class="text-base font-bold text-slate-900 leading-tight">RCCG Sunday School</h1>
            <p class="text-xs text-slate-500">Examination Portal</p>
          </div>
        </div>

        <!-- User profile & Logout -->
        <div class="flex items-center space-x-4">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-semibold text-slate-900">{{ authStore.user?.fullName }}</div>
            <div class="text-xs text-emerald-600 font-medium">{{ authStore.user?.parishName || 'Member' }}</div>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Member Welcome Banner -->
      <div class="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-3">
            {{ authStore.user?.parishName || 'RCCG Member' }}
          </span>
          <h2 class="text-2xl sm:text-3xl font-bold font-display">
            Welcome, {{ authStore.user?.fullName }}
          </h2>
          <p class="text-emerald-100/80 text-sm mt-1 max-w-xl">
            Check below for available, upcoming, or completed Sunday school examinations. Please ensure you have a stable connection before starting.
          </p>
        </div>
      </div>

      <!-- Examinations Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 font-display">Available Examinations</h3>
            <p class="text-xs text-slate-500">Active and upcoming tests assigned to your parish</p>
          </div>
          <router-link
            to="/results"
            class="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-1"
          >
            <span>View Released Results</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <!-- Exam List -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 2" :key="i" class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
            <div class="h-5 bg-slate-200 rounded w-2/3"></div>
            <div class="h-4 bg-slate-100 rounded w-full"></div>
            <div class="h-10 bg-slate-100 rounded mt-4"></div>
          </div>
        </div>

        <div v-else-if="exams.length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 class="text-base font-semibold text-slate-800">No Active Examinations</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are currently no active exams scheduled for your parish. Please check back at the scheduled examination time.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="exam in exams"
            :key="exam.id"
            class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span
                  :class="[
                    exam.status === 'ongoing' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider'
                  ]"
                >
                  {{ exam.status }}
                </span>
                <span class="text-xs text-slate-500 font-medium">
                  {{ Math.round(exam.durationSeconds / 60) }} Mins
                </span>
              </div>
              <h4 class="text-lg font-bold text-slate-900 leading-snug">{{ exam.title }}</h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ exam.description || 'Sunday school assessment' }}</p>
            </div>

            <div class="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div class="text-xs text-slate-500">
                Pass Mark: <span class="font-semibold text-slate-700">{{ exam.passMark }}%</span>
              </div>
              <router-link
                :to="`/exam/${exam.id}/instructions`"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-1"
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
