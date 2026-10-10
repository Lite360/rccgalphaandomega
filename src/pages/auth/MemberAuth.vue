<template>
  <div class="min-h-screen bg-mesh-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
    <!-- Glowing background decorative dynamic elements -->
    <div class="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
      <!-- Church & Portal Header -->
      <div class="text-center mb-8">
        <div class="relative inline-block">
          <img src="/logo.png" alt="RCCG Logo" class="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-[0_10px_25px_rgba(16,185,129,0.3)] animate-float" />
          <span class="absolute -top-1 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">OFFICIAL</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
          RCCG Alpha & Omega
        </h1>
        <p class="mt-1.5 text-xs sm:text-sm font-medium text-emerald-400/90 tracking-wide uppercase font-mono">
          Sunday School Examination Portal
        </p>
      </div>

      <!-- Main Form Container -->
      <div class="glass-card py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/10 glow-emerald">
        <!-- Step 1: Registration or Login Form -->
        <div v-if="step === 'form'">
          <!-- Mode Tabs -->
          <div class="flex rounded-2xl bg-slate-900/80 p-1 mb-6 border border-slate-800/80">
            <button
              type="button"
              @click="mode = 'login'; errorMessage = ''"
              :class="[
                mode === 'login'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg font-semibold'
                  : 'text-slate-400 hover:text-white font-medium',
                'flex-1 py-2.5 text-xs rounded-xl transition-all duration-300 text-center flex items-center justify-center space-x-1.5'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </button>
            <button
              type="button"
              @click="mode = 'register'; errorMessage = ''"
              :class="[
                mode === 'register'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg font-semibold'
                  : 'text-slate-400 hover:text-white font-medium',
                'flex-1 py-2.5 text-xs rounded-xl transition-all duration-300 text-center flex items-center justify-center space-x-1.5'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Register</span>
            </button>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start space-x-2 backdrop-blur-sm animate-fadeIn">
            <svg class="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Registration Form -->
          <form v-if="mode === 'register'" @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                v-model="regForm.fullName"
                type="text"
                required
                placeholder="e.g. Emmanuel Adeleke"
                class="w-full px-4 py-3 rounded-xl border border-slate-700/80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder:text-slate-500 bg-slate-900/60 text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Your Parish
              </label>
              <select
                v-model="regForm.parishId"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-700/80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white bg-slate-900/90 text-sm"
              >
                <option value="" disabled class="bg-slate-900 text-slate-400">Choose Parish</option>
                <option v-for="parish in parishes" :key="parish.id" :value="parish.id" class="bg-slate-900 text-white">
                  {{ parish.name }} {{ parish.zone ? `(${parish.zone})` : '' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                v-model="regForm.phone"
                type="tel"
                required
                placeholder="+2348012345678"
                class="w-full px-4 py-3 rounded-xl border border-slate-700/80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder:text-slate-500 bg-slate-900/60 text-sm"
              />
              <p class="text-[11px] text-slate-400 mt-1">Include country code (e.g. +234 for Nigeria)</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Registered Phone Number
              </label>
              <input
                v-model="loginPhone"
                type="tel"
                required
                placeholder="+2348012345678"
                class="w-full px-4 py-3 rounded-xl border border-slate-700/80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder:text-slate-500 bg-slate-900/60 text-sm"
              />
              <p class="text-[11px] text-slate-400 mt-1">Enter the phone number used during registration</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3 shadow-inner">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white font-display">
              Enter Verification Code
            </h3>
            <p class="text-xs text-slate-300 mt-1">
              We sent a 6-digit code to <span class="font-semibold text-emerald-300 font-mono">{{ activePhone }}</span>
            </p>
          </div>

          <!-- Dev OTP Hint -->
          <div v-if="devOtpHint" class="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs text-center backdrop-blur-md">
            Development Mode OTP Code: <strong class="font-mono text-sm tracking-widest text-amber-300">{{ devOtpHint }}</strong>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
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
                class="w-full text-center text-2xl font-mono tracking-[0.4em] py-3.5 px-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-950/80 text-emerald-400 font-bold"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading || otpCode.length < 6"
              class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
                class="text-slate-400 hover:text-slate-200 font-medium transition-colors"
              >
                ← Change Number
              </button>

              <button
                type="button"
                @click="resendOtp"
                :disabled="resendCountdown > 0"
                class="text-emerald-400 hover:text-emerald-300 font-semibold disabled:text-slate-600 transition-colors"
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
          class="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800"
        >
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
