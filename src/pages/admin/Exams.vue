<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white font-display">Examinations</h2>
        <p class="text-xs text-slate-400 mt-1">Create, schedule, and manage Sunday school examinations</p>
      </div>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 self-start">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>New Examination</span>
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center space-x-1 bg-slate-800/50 rounded-xl p-1 w-fit">
      <button v-for="tab in statusTabs" :key="tab.value"
        @click="activeTab = tab.value"
        :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', activeTab === tab.value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white']">
        {{ tab.label }}
      </button>
    </div>

    <!-- Exam List -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 animate-pulse h-24"></div>
    </div>

    <div v-else-if="filteredExams.length === 0" class="bg-slate-800/40 border border-slate-800 rounded-2xl p-12 text-center">
      <p class="text-slate-400 text-sm">No examinations found. Create one to get started.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="exam in filteredExams" :key="exam.id" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-1">
              <span :class="['px-2 py-0.5 rounded text-[10px] font-bold uppercase', statusColor(exam.status)]">{{ exam.status }}</span>
              <span class="text-xs text-slate-400">{{ Math.round(exam.durationSeconds / 60) }} mins · {{ exam.questionCount || 0 }} questions</span>
            </div>
            <h4 class="text-base font-bold text-white">{{ exam.title }}</h4>
            <p class="text-xs text-slate-400 mt-0.5">Pass Mark: {{ exam.passMark }}% · Total: {{ exam.totalMarks }} marks</p>
          </div>

          <div class="flex items-center space-x-2 flex-wrap gap-2">
            <router-link :to="`/access/monitor/${exam.id}`" v-if="exam.status === 'ongoing'" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all">
              Live Monitor
            </router-link>
            <button @click="publishExam(exam)" v-if="exam.status === 'draft'" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
              Publish
            </button>
            <button @click="selectedExam = exam; showEndModal = true" v-if="exam.status === 'ongoing'" class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all">
              End Exam
            </button>
            <button @click="editExam(exam)" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-all">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- End Exam Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showEndModal && selectedExam" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
          <div class="text-center">
            <div class="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white font-display">End Examination for All?</h3>
            <p class="text-sm text-slate-400 mt-2">
              This will immediately close <strong class="text-white">{{ selectedExam.title }}</strong> for all participants. Saved answers will be preserved. This action cannot be undone without audited Admin review.
            </p>
          </div>
          <div class="flex space-x-3">
            <button @click="showEndModal = false; selectedExam = null" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all">Cancel</button>
            <button @click="endExam" :disabled="isEndingExam" class="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
              {{ isEndingExam ? 'Ending...' : 'Confirm End' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Exam Modal (Simplified) -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white font-display">New Examination</h3>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createExam" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Examination Title *</label>
              <input v-model="newExam.title" required type="text" placeholder="e.g. Q4 2026 Sunday School Test" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Instructions</label>
              <textarea v-model="newExam.instructions" rows="3" placeholder="Examination instructions..." class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Duration (minutes)</label>
                <input v-model.number="newExamDurationMins" type="number" min="5" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Pass Mark (%)</label>
                <input v-model.number="newExam.passMark" type="number" min="1" max="100" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div class="flex items-center space-x-4 text-sm">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input v-model="newExam.randomizeQuestions" type="checkbox" class="w-4 h-4 accent-emerald-500" />
                <span class="text-slate-300">Randomize question order</span>
              </label>
            </div>
            <div class="flex space-x-3 pt-2">
              <button type="button" @click="showCreateModal = false" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all">Cancel</button>
              <button type="submit" :disabled="isCreating" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                {{ isCreating ? 'Creating...' : 'Create Exam' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/services/api';
import type { Exam } from '@/types';

const exams = ref<Exam[]>([]);
const isLoading = ref(true);
const activeTab = ref('all');
const showCreateModal = ref(false);
const showEndModal = ref(false);
const selectedExam = ref<Exam | null>(null);
const isEndingExam = ref(false);
const isCreating = ref(false);
const newExamDurationMins = ref(30);
const newExam = ref({ title: '', instructions: '', passMark: 50, totalMarks: 100, randomizeQuestions: false, durationSeconds: 1800 });

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Ended', value: 'ended' },
];

const filteredExams = computed(() => {
  if (activeTab.value === 'all') return exams.value;
  return exams.value.filter(e => e.status === activeTab.value);
});

function statusColor(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-700 text-slate-300',
    scheduled: 'bg-blue-900/60 text-blue-300',
    published: 'bg-purple-900/60 text-purple-300',
    ongoing: 'bg-emerald-900/60 text-emerald-300',
    ended: 'bg-slate-700 text-slate-400',
    cancelled: 'bg-red-900/60 text-red-400',
  };
  return map[status] || 'bg-slate-700 text-slate-400';
}

onMounted(async () => {
  await loadExams();
});

async function loadExams() {
  isLoading.value = true;
  try {
    const res = await api.get<{ exams: Exam[] }>('/api/admin/exams');
    if (res.success && res.data?.exams) exams.value = res.data.exams;
  } finally {
    isLoading.value = false;
  }
}

async function publishExam(exam: Exam) {
  await api.post(`/api/admin/exams/${exam.id}/publish`);
  await loadExams();
}

async function endExam() {
  if (!selectedExam.value) return;
  isEndingExam.value = true;
  try {
    await api.post(`/api/admin/exams/${selectedExam.value.id}/end`);
    showEndModal.value = false;
    selectedExam.value = null;
    await loadExams();
  } finally {
    isEndingExam.value = false;
  }
}

function editExam(exam: Exam) {
  // Populate modal for edit - simplified: repopulate form & reload
  newExam.value = { title: exam.title, instructions: exam.instructions || '', passMark: exam.passMark, totalMarks: exam.totalMarks, randomizeQuestions: exam.randomizeQuestions, durationSeconds: exam.durationSeconds };
  newExamDurationMins.value = Math.round(exam.durationSeconds / 60);
  showCreateModal.value = true;
}

async function createExam() {
  isCreating.value = true;
  try {
    newExam.value.durationSeconds = newExamDurationMins.value * 60;
    const res = await api.post('/api/admin/exams', newExam.value);
    if (res.success) {
      showCreateModal.value = false;
      newExam.value = { title: '', instructions: '', passMark: 50, totalMarks: 100, randomizeQuestions: false, durationSeconds: 1800 };
      await loadExams();
    }
  } finally {
    isCreating.value = false;
  }
}
</script>
