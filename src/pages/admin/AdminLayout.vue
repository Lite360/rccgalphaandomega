<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    <!-- Admin Navigation Bar -->
    <header class="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <router-link to="/access" class="flex items-center space-x-3 group">
            <img src="/logo.png" alt="RCCG Logo" class="w-10 h-10 object-contain group-hover:scale-105 transition-all drop-shadow-md" />
            <div>
              <div class="text-sm font-bold text-white font-display flex items-center space-x-2">
                <span>RCCG /access</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">ADMIN</span>
              </div>
              <p class="text-[11px] text-slate-400">Exam Command Center</p>
            </div>
          </router-link>

          <!-- Desktop Navigation Links -->
          <nav class="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="[
                $route.path === item.path
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white',
                'px-3 py-2 rounded-xl text-xs transition-all flex items-center space-x-2'
              ]"
            >
              <span>{{ item.label }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Right Side: Admin Profile & Logout -->
        <div class="flex items-center space-x-4">
          <div class="text-right hidden sm:block">
            <div class="text-xs font-semibold text-white">{{ authStore.admin?.fullName || 'Administrator' }}</div>
            <div class="text-[10px] text-emerald-400 font-mono">@{{ authStore.admin?.username }}</div>
          </div>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 transition-all flex items-center space-x-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Nav Bar -->
    <div class="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center space-x-1 overflow-x-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          $route.path === item.path
            ? 'bg-slate-800 text-emerald-400 font-semibold'
            : 'text-slate-400 hover:text-white',
          'px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all'
        ]"
      >
        {{ item.label }}
      </router-link>
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { label: 'Overview', path: '/access' },
  { label: 'Examinations', path: '/access/exams' },
  { label: 'Question Bank', path: '/access/questions' },
  { label: 'Members & Parishes', path: '/access/users' },
  { label: 'Grading & Results', path: '/access/grading' },
];

async function handleLogout() {
  await authStore.logout();
  router.push('/access/login');
}
</script>
