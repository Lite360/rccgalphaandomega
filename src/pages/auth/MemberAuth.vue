<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Subtle background glowing orbs -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
      <!-- Church & Portal Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          RCCG alpha & omega Sunday School
        </h1>
        <p class="mt-2 text-sm text-slate-300">
          Sunday School Portal
        </p>
      </div>

      <!-- Main Form Container -->
      <div class="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
        <!-- Step 1: Registration or Login Form -->
        <div v-if="step === 'form'">
          <!-- Mode Tabs -->
          <div class="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              @click="mode = 'login'; errorMessage = ''"
              :class="[
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium',
                'flex-1 py-2 text-sm rounded-lg transition-all text-center'
              ]"
            >
              Sign In
            </button>
            <button
              type="button"
              @click="mode = 'register'; errorMessage = ''"
              :class="[
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium',
                'flex-1 py-2 text-sm rounded-lg transition-all text-center'
              ]"
            >
              Register
            </button>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2 animate-fadeIn">
            <svg class="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Registration Form -->
          <form v-if="mode === 'register'" @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                v-model="regForm.fullName"
                type="text"
                required
                placeholder="e.g. Emmanuel Adeleke"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Your Parish
              </label>
              <select
                v-model="regForm.parishId"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 bg-slate-50/50"
              >
                <option value="" disabled>Choose Parish</option>
                <option v-for="parish in parishes" :key="parish.id" :value="parish.id">
                  {{ parish.name }} {{ parish.zone ? `(${parish.zone})` : '' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div class="relative">
                <input
                  v-model="regForm.phone"
                  type="tel"
                  required
                  placeholder="+2348012345678"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>
              <p class="text-[11px] text-slate-500 mt-1">Include country code (e.g. +234 for Nigeria)</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Processing...' : 'Register & Receive Code' }}</span>
            </button>
          </form>

          <!-- Login Form -->
          <form v-else @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Phone Number
              </label>
              <input
                v-model="loginPhone"
                type="tel"
                required
                placeholder="+2348012345678"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
              />
              <p class="text-[11px] text-slate-500 mt-1">Enter the phone number used during registration</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Sending Code...' : 'Send Verification Code' }}</span>
            </button>
          </form>
        </div>

        <!-- Step 2: OTP Verification -->
        <div v-else class="space-y-5 animate-fadeIn">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 font-display">
              Enter Verification Code
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              We sent a 6-digit code to <span class="font-semibold text-slate-700">{{ activePhone }}</span>
            </p>
          </div>

          <!-- Dev OTP Hint -->
          <div v-if="devOtpHint" class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
            Development Mode OTP: <strong class="font-mono text-sm tracking-widest">{{ devOtpHint }}</strong>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleVerifyOtp" class="space-y-4">
            <div>
              <input
                v-model="otpCode"
                type="text"
                maxlength="6"
                required
                autofocus
                placeholder="• • • • • •"
                class="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading || otpCode.length < 6"
              class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Verifying...' : 'Verify & Continue' }}</span>
            </button>

            <div class="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                @click="step = 'form'; otpCode = ''; errorMessage = ''"
                class="text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Change Number
              </button>

              <button
                type="button"
                @click="resendOtp"
                :disabled="resendCountdown > 0"
                class="text-emerald-600 hover:text-emerald-700 font-semibold disabled:text-slate-400"
              >
                {{ resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer / Admin access link -->
      <div class="mt-8 text-center">
        <router-link
          to="/access/login"
          class="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center space-x-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Administrator Access</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Parish } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<'login' | 'register'>('login');
const step = ref<'form' | 'otp'>('form');
const isLoading = ref(false);
const errorMessage = ref('');

const parishes = ref<Parish[]>([]);

const regForm = ref({
  fullName: '',
  parishId: '',
  phone: '',
});

const loginPhone = ref('');
const activePhone = ref('');
const otpCode = ref('');
const devOtpHint = ref('');
const resendCountdown = ref(0);
let countdownTimer: any = null;

onMounted(async () => {
  try {
    const res = await api.getParishes();
    if (res.success && res.data?.parishes) {
      parishes.value = res.data.parishes;
    }
  } catch (err) {
    console.error('Failed to load parishes:', err);
  }
});

function startCountdown() {
  resendCountdown.value = 60;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
}

async function handleRegister() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    const res = await api.register({
      fullName: regForm.value.fullName,
      parishId: regForm.value.parishId,
      phoneE164: regForm.value.phone,
    });

    if (res.success && res.data) {
      activePhone.value = regForm.value.phone;
      devOtpHint.value = res.data.devOtp || '';
      step.value = 'otp';
      startCountdown();
    } else {
      errorMessage.value = res.error || 'Failed to initiate registration';
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleLogin() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    const res = await api.login({
      phoneE164: loginPhone.value,
    });

    if (res.success && res.data) {
      activePhone.value = loginPhone.value;
      devOtpHint.value = res.data.devOtp || '';
      step.value = 'otp';
      startCountdown();
    } else {
      errorMessage.value = res.error || 'Failed to send login code';
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleVerifyOtp() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    const res = await api.verifyOtp({
      phoneE164: activePhone.value,
      otpCode: otpCode.value,
      purpose: mode.value === 'register' ? 'register' : 'login',
    });

    if (res.success && res.data) {
      authStore.setAuthData({
        user: res.data.user,
        token: res.data.token,
        role: 'user',
      });
      router.push('/dashboard');
    } else {
      errorMessage.value = res.error || 'Invalid or expired OTP code';
    }
  } finally {
    isLoading.value = false;
  }
}

async function resendOtp() {
  if (resendCountdown.value > 0) return;
  if (mode.value === 'register') {
    await handleRegister();
  } else {
    await handleLogin();
  }
}
</script>
