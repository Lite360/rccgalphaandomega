import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  // Public & Member Auth Routes
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/auth/MemberAuth.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'MemberDashboard',
    component: () => import('@/pages/member/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'user' },
  },
  {
    path: '/exam/:id/instructions',
    name: 'ExamInstructions',
    component: () => import('@/pages/exam/Instructions.vue'),
    meta: { requiresAuth: true, role: 'user' },
  },
  {
    path: '/exam/:id/take',
    name: 'ExamTake',
    component: () => import('@/pages/exam/ExamScreen.vue'),
    meta: { requiresAuth: true, role: 'user' },
  },
  {
    path: '/results',
    name: 'MemberResults',
    component: () => import('@/pages/member/Results.vue'),
    meta: { requiresAuth: true, role: 'user' },
  },

  // Admin Routes (Protected /access prefix)
  {
    path: '/access/login',
    name: 'AdminLogin',
    component: () => import('@/pages/admin/AdminLogin.vue'),
    meta: { requiresAdminGuest: true },
  },
  {
    path: '/access',
    name: 'AdminLayout',
    component: () => import('@/pages/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminOverview',
        component: () => import('@/pages/admin/Overview.vue'),
      },
      {
        path: 'exams',
        name: 'AdminExams',
        component: () => import('@/pages/admin/Exams.vue'),
      },
      {
        path: 'questions',
        name: 'AdminQuestions',
        component: () => import('@/pages/admin/Questions.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/pages/admin/Users.vue'),
      },
      {
        path: 'grading',
        name: 'AdminGrading',
        component: () => import('@/pages/admin/Grading.vue'),
      },
      {
        path: 'monitor/:id',
        name: 'AdminMonitor',
        component: () => import('@/pages/admin/LiveMonitor.vue'),
      },
    ],
  },

  // Fallback 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.checkAuth();
  }

  // Admin guest check
  if (to.meta.requiresAdminGuest && authStore.isAdmin) {
    return next('/access');
  }

  // Member guest check
  if (to.meta.requiresGuest && authStore.isMember) {
    return next('/dashboard');
  }

  // Requires Auth check
  if (to.meta.requiresAuth) {
    const requiredRole = to.meta.role as 'user' | 'admin' | undefined;

    if (!authStore.isAuthenticated) {
      if (to.path.startsWith('/access')) {
        return next('/access/login');
      }
      return next('/');
    }

    if (requiredRole && authStore.role !== requiredRole) {
      if (authStore.isAdmin) {
        return next('/access');
      } else {
        return next('/dashboard');
      }
    }
  }

  next();
});

export default router;
