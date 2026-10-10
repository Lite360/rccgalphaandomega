import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import type { User, Admin } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const admin = ref<Admin | null>(null);
  const role = ref<'user' | 'admin' | null>(null);
  const isLoading = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);

  const isAuthenticated = computed(() => !!user.value || !!admin.value);
  const isAdmin = computed(() => role.value === 'admin');
  const isMember = computed(() => role.value === 'user');

  async function checkAuth() {
    isLoading.value = true;
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        user.value = res.data.user || null;
        admin.value = res.data.admin || null;
        role.value = res.data.role || null;
      } else {
        user.value = null;
        admin.value = null;
        role.value = null;
        localStorage.removeItem('session_token');
      }
    } catch {
      user.value = null;
      admin.value = null;
      role.value = null;
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  }

  function setAuthData(data: { user?: User; admin?: Admin; token: string; role: 'user' | 'admin' }) {
    if (data.user) user.value = data.user;
    if (data.admin) admin.value = data.admin;
    role.value = data.role;
    if (data.token) {
      localStorage.setItem('session_token', data.token);
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await api.logout();
    } finally {
      user.value = null;
      admin.value = null;
      role.value = null;
      localStorage.removeItem('session_token');
      isLoading.value = false;
    }
  }

  return {
    user,
    admin,
    role,
    isLoading,
    isInitialized,
    isAuthenticated,
    isAdmin,
    isMember,
    checkAuth,
    setAuthData,
    logout,
  };
});
