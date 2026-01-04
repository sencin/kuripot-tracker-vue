import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/DashboardView.vue';
import Income from '@/views/IncomeView.vue';
import Expenses from '@/views/ExpenseView.vue';
import OverView from '@/views/OverView.vue';
import Login from '@/views/LoginView.vue';
import Register from '@/views/RegisterView.vue';
import AboutView from '@/views/AboutView.vue';
import { useAuthStore } from '@/stores/authenticate';

const routes: Array<RouteRecordRaw & { meta?: { auth?: boolean; guest?: boolean } }> = [
  {
    path: '/',
    component: Dashboard,
    name: 'dashboard',
    meta: { auth: true },
  },
  {
    path: '/record/income',
    component: Income,
    name: 'income',
    meta: { auth: true },
  },
  {
    path: '/record/expenses',
    component: Expenses,
    name: 'expenses',
    meta: { auth: true },
  },
  {
    path: '/overview',
    component: OverView,
    name: 'overview',
    meta: { auth: true },
  },
  // Guest routes
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: { guest: true },
  },
  {
    path: '/register',
    component: Register,
    name: 'register',
    meta: { guest: true },
  },
  {
    path: '/about',
    component: AboutView,
    name: 'about',
    meta: { guest: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (to.meta.guest && token) {
    console.log("Guest route accessed by logged-in user. Redirecting to dashboard.");
    return { name: "dashboard" };
  }

  if (to.meta.auth && !token) {
    console.log("Auth required and no token found. Redirecting to login.");
    return { name: "login" };
  }
});

export default router;
