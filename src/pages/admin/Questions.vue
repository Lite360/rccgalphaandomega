<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white font-display">Question Bank</h2>
        <p class="text-xs text-slate-400 mt-1">Add and manage Sunday school examination questions</p>
      </div>
      <button @click="showModal = true; resetForm()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 self-start">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span>Add Question</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center space-x-3">
      <select v-model="filterType" class="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs outline-none">
        <option value="">All Types</option>
        <option value="multiple_choice">Multiple Choice</option>
        <option value="true_false">True/False</option>
        <option value="short_written">Short Written</option>
        <option value="essay">Essay</option>
      </select>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 animate-pulse h-24"></div>
    </div>

    <div v-else-if="filteredQuestions.length === 0" class="bg-slate-800/40 border border-slate-800 rounded-2xl p-12 text-center">
      <p class="text-slate-400 text-sm">No questions yet. Add questions to the bank to use in examinations.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="q in filteredQuestions" :key="q.id" class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-300">{{ typeLabel(q.questionType) }}</span>
              <span v-if="q.topic" class="text-[10px] text-slate-500">{{ q.topic }}</span>
              <span class="text-[10px] text-emerald-400 font-semibold">{{ q.marks }} mark{{ q.marks !== 1 ? 's' : '' }}</span>
            </div>
            <p class="text-sm text-white leading-relaxed">{{ q.questionText }}</p>
            <div v-if="q.options && q.options.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span v-for="opt in q.options" :key="opt.id" :class="['text-[11px] px-2 py-0.5 rounded-lg border', opt.isCorrect ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300 font-bold' : 'bg-slate-700/60 border-slate-600/60 text-slate-400']">
                {{ opt.optionLetter || '' }}. {{ opt.optionText }}
              </span>
            </div>
          </div>
          <button @click="deleteQuestion(q.id)" class="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Question Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-white font-display">Add Question</h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form @submit.prevent="saveQuestion" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Question Type *</label>
              <select v-model="form.questionType" @change="onTypeChange" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_written">Short Written Answer</option>
                <option value="essay">Essay / Long Answer</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Question Text *</label>
              <textarea v-model="form.questionText" required rows="3" placeholder="Type the question here..." class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Marks</label>
                <input v-model.number="form.marks" type="number" min="1" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Topic (optional)</label>
                <input v-model="form.topic" type="text" placeholder="e.g. Acts" class="w-full px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <!-- Options for MCQ / True-False -->
            <div v-if="form.questionType === 'multiple_choice' || form.questionType === 'true_false'" class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300">Answer Options *</label>
                <button v-if="form.questionType === 'multiple_choice'" type="button" @click="addOption" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">+ Add Option</button>
              </div>
              <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center space-x-2">
                <input type="radio" :name="'correct-' + form.questionType" :checked="opt.isCorrect" @change="setCorrect(idx)" class="w-4 h-4 accent-emerald-500 flex-shrink-0" />
                <input v-model="opt.optionText" :disabled="form.questionType === 'true_false'" type="text" :placeholder="`Option ${String.fromCharCode(65 + idx)}`" class="flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-700/80 text-white placeholder:text-slate-500 text-sm outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60" />
                <button v-if="form.questionType === 'multiple_choice' && form.options.length > 2" type="button" @click="removeOption(idx)" class="text-slate-500 hover:text-red-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p class="text-[11px] text-slate-500">Select the radio button to mark the correct answer.</p>
            </div>

            <div class="flex space-x-3 pt-2">
              <button type="button" @click="showModal = false" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition-all">Cancel</button>
              <button type="submit" :disabled="isSaving" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save Question' }}
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
import type { Question } from '@/types';

const questions = ref<Question[]>([]);
const isLoading = ref(true);
const filterType = ref('');
const showModal = ref(false);
const isSaving = ref(false);

const form = ref({ questionText: '', questionType: 'multiple_choice' as any, marks: 1, topic: '', options: [] as any[] });

const filteredQuestions = computed(() => {
  if (!filterType.value) return questions.value;
  return questions.value.filter(q => q.questionType === filterType.value);
});

function typeLabel(t: string) {
  return { multiple_choice: 'MCQ', true_false: 'T/F', short_written: 'Short', essay: 'Essay' }[t] || t;
}

function resetForm() {
  form.value = { questionText: '', questionType: 'multiple_choice', marks: 1, topic: '', options: [{ optionText: '', isCorrect: true, optionLetter: 'A', position: 0 }, { optionText: '', isCorrect: false, optionLetter: 'B', position: 1 }, { optionText: '', isCorrect: false, optionLetter: 'C', position: 2 }, { optionText: '', isCorrect: false, optionLetter: 'D', position: 3 }] };
}

function onTypeChange() {
  if (form.value.questionType === 'true_false') {
    form.value.options = [{ optionText: 'True', isCorrect: true, optionLetter: 'A', position: 0 }, { optionText: 'False', isCorrect: false, optionLetter: 'B', position: 1 }];
  } else if (form.value.questionType === 'multiple_choice') {
    form.value.options = [{ optionText: '', isCorrect: true, optionLetter: 'A', position: 0 }, { optionText: '', isCorrect: false, optionLetter: 'B', position: 1 }, { optionText: '', isCorrect: false, optionLetter: 'C', position: 2 }, { optionText: '', isCorrect: false, optionLetter: 'D', position: 3 }];
  } else {
    form.value.options = [];
  }
}

function addOption() {
  const idx = form.value.options.length;
  form.value.options.push({ optionText: '', isCorrect: false, optionLetter: String.fromCharCode(65 + idx), position: idx });
}

function removeOption(idx: number) {
  form.value.options.splice(idx, 1);
}

function setCorrect(idx: number) {
  form.value.options.forEach((o, i) => o.isCorrect = i === idx);
}

onMounted(async () => {
  try {
    const res = await api.get<{ questions: Question[] }>('/api/admin/questions');
    if (res.success && res.data?.questions) questions.value = res.data.questions;
  } finally { isLoading.value = false; }
  resetForm();
});

async function saveQuestion() {
  isSaving.value = true;
  try {
    const res = await api.post('/api/admin/questions', form.value);
    if (res.success) {
      showModal.value = false;
      const r2 = await api.get<{ questions: Question[] }>('/api/admin/questions');
      if (r2.success && r2.data?.questions) questions.value = r2.data.questions;
    }
  } finally { isSaving.value = false; }
}

async function deleteQuestion(id: string) {
  if (!confirm('Delete this question?')) return;
  await api.delete(`/api/admin/questions/${id}`);
  questions.value = questions.value.filter(q => q.id !== id);
}
</script>
