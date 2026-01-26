import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/DashboardView.vue';
import Income from '@/views/IncomeView.vue';
import Expenses from '@/views/ExpenseView.vue';
import OverView from '@/views/OverView.vue';
import Login from '@/views/LoginView.vue';
import Register from '@/views/RegisterView.vue';
import AboutView from '@/views/AboutView.vue';
import { useAuthStore } from '@/stores/authenticate';
import DashboardLayout from '@/components/DashboardLayout.vue';
import ProfileView from '@/views/ProfileView.vue';
import AddTransactionView from '@/views/AddTransactionView.vue';
import TransactionsView from '@/views/TransactionsView.vue';
import VerifyOtp from '@/views/VerifyOtp.vue';
import AccessCode from '@/views/AccessCode.vue';
import ExpenseChatBased from '@/views/ExpenseChatBased.vue';

const routes: Array<RouteRecordRaw & { meta?: { auth?: boolean; guest?: boolean } }> = [
  {
    path: '/',
    component: DashboardLayout,
    meta: { auth: true },
    children: [
      {
        path: '',
        redirect: 'home', 
      },
      {
        path: 'home',
        name: 'Home',
        component: Dashboard,
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: TransactionsView,
      },
      {
        path: 'add-transaction',
        name: 'AddTransaction',
        component: AddTransactionView,
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: OverView,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
      },
    ],
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
    path: '/verify-otp',
    component: VerifyOtp,
    name: 'verifyotp',
    meta: { guest: true },
  },
  {
    path: '/about',
    component: AboutView,
    name: 'about',
    meta: { guest: true },
  },
    {
    path: '/chat-based-expense',
    component: ExpenseChatBased,
    name: 'chat-based-expense',
    meta: { auth: true },
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isVerified) {
    await authStore.getUser();
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    console.log("Guest route accessed by logged-in user. Redirecting to dashboard.");
    return { name: "dashboard" };
  }

  if (to.meta.auth && !authStore.isAuthenticated) {
    console.log("Auth required and user is not authenticated. Redirecting to login.");
    return { name: "login" };
  }

  // delete this when development of website is good enoguht . this is just to avoid unwanted registration
// if (to.meta.requiresAccess) {
//   const hasAccess = sessionStorage.getItem('devAccess') === 'true'
//   if (!hasAccess) {
//     return { name: 'access-code' }
//   }
// }

});

export default router;
