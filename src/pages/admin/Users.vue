<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-white font-display">Members & Parishes</h2>
      <p class="text-xs text-slate-400 mt-1">View registered members, manage parishes, suspend or reactivate accounts</p>
    </div>

    <!-- Tabs -->
    <div class="flex items-center space-x-1 bg-slate-800/50 rounded-xl p-1 w-fit">
      <button v-for="tab in ['Members', 'Parishes']" :key="tab" @click="activeTab = tab"
        :class="['px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white']">
        {{ tab }}
      </button>
    </div>

    <!-- Members Tab -->
    <div v-if="activeTab === 'Members'" class="space-y-4">
      <!-- Search -->
      <div class="relative max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" type="search" placeholder="Search members..." class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div v-if="isLoading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 animate-pulse h-16"></div>
      </div>

      <div v-else class="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-700">
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Member</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Parish</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Phone</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/60">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="px-5 py-8 text-center text-slate-400 text-xs">No members found.</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-700/30 transition-colors">
              <td class="px-5 py-3">
                <div class="font-semibold text-white text-sm">{{ user.fullName }}</div>
              </td>
              <td class="px-5 py-3 hidden sm:table-cell">
                <span class="text-slate-300 text-xs">{{ user.parishName || '—' }}</span>
              </td>
              <td class="px-5 py-3 hidden md:table-cell">
                <span class="text-slate-400 text-xs font-mono">{{ user.phoneE164 }}</span>
              </td>
              <td class="px-5 py-3">
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', user.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400']">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <button @click="toggleSuspend(user)" class="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors">
                  {{ user.status === 'active' ? 'Suspend' : 'Reactivate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Parishes Tab -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400">{{ parishes.length }} parishes registered</span>
        <button @click="showParishModal = true" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          <span>Add Parish</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="parish in parishes" :key="parish.id" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white">{{ parish.name }}</h4>
            <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', parish.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400']">{{ parish.status }}</span>
          </div>
          <div class="text-xs text-slate-400 space-y-0.5">
            <div v-if="parish.code">Code: <span class="text-slate-300 font-mono">{{ parish.code }}</span></div>
            <div v-if="parish.zone">Zone: <span class="text-slate-300">{{ parish.zone }}</span></div>
          </div>
        </div>
      </div>

      <!-- Add Parish Modal -->
      <Teleport to="body">
        <div v-if="showParishModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5">
            <h3 class="text-lg font-bold text-white font-display">Add Parish</h3>
            <form @submit.prevent="createParish" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Parish Name *</label>
                <input v-model="newParish.name" required type="text" placeholder="RCCG Example Parish" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Code</label>
                <input v-model="newParish.code" type="text" placeholder="EXP-01" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Zone</label>
                <input v-model="newParish.zone" type="text" placeholder="Zone 1" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div class="flex space-x-3">
                <button type="button" @click="showParishModal = false" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all">Cancel</button>
                <button type="submit" :disabled="isSavingParish" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                  {{ isSavingParish ? 'Saving...' : 'Add Parish' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/services/api';
import type { User, Parish } from '@/types';

const activeTab = ref('Members');
const isLoading = ref(true);
const search = ref('');
const users = ref<User[]>([]);
const parishes = ref<Parish[]>([]);
const showParishModal = ref(false);
const isSavingParish = ref(false);
const newParish = ref({ name: '', code: '', zone: '' });

const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  const q = search.value.toLowerCase();
  return users.value.filter(u => u.fullName.toLowerCase().includes(q) || u.phoneE164.includes(q));
});

onMounted(async () => {
  try {
    const [ur, pr] = await Promise.all([
      api.get<{ users: User[] }>('/api/admin/users'),
      api.get<{ parishes: Parish[] }>('/api/admin/parishes'),
    ]);
    if (ur.success && ur.data?.users) users.value = ur.data.users;
    if (pr.success && pr.data?.parishes) parishes.value = pr.data.parishes;
  } finally { isLoading.value = false; }
});

async function toggleSuspend(user: User) {
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  const res = await api.post(`/api/admin/users/${user.id}/status`, { status: newStatus });
  if (res.success) user.status = newStatus as any;
}

async function createParish() {
  isSavingParish.value = true;
  try {
    const res = await api.post('/api/admin/parishes', newParish.value);
    if (res.success && res.data?.parish) {
      parishes.value.push(res.data.parish);
      showParishModal.value = false;
      newParish.value = { name: '', code: '', zone: '' };
    }
  } finally { isSavingParish.value = false; }
}
</script>
