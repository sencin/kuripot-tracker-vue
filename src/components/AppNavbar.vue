<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authenticate.ts';

const visible = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() =>
  authStore.isAuthenticated ? authStore.user : null
)

const props = defineProps<{ title?: string }>();

const fullName = computed(() => {
  if (!authStore.user) return "User";
  return `${authStore.user.first_name} ${authStore.user.last_name}`;
});

const menuItems = [
  { label: 'Home', icon: 'home', to: '/home' },
  { label: 'Overview', icon: 'chart', to: '/analytics' },
  { label: 'Income', icon: 'arrow-down', to: '/record/income' },
  { label: 'Expenses', icon: 'arrow-up', to: '/record/expenses' },
];

const guestMenu = [
  { label: 'Login', icon: 'login', to: '/login' },
  { label: 'Register', icon: 'register', to: '/register' },
];

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push('/login');
    visible.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Hamburger Button -->
      <nav class="flex items-center justify-between bg-gray-900 text-white px-4 py-2 shadow-md rounded-xl">
    <!-- Left: Hamburger -->
    <button @click="visible = true" class="p-2 rounded-md hover:bg-gray-800 focus:outline-none">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
           viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Center: Dynamic title -->
    <div class="flex-1 text-center text-lg font-semibold truncate">
      {{ props.title }}
    </div>

    <!-- Right: Notification Icon -->
    <button class="p-2 rounded-md hover:bg-gray-800 relative">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
           viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 1 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6z"/>
      </svg>
      <!-- Notification badge -->
      <span class="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
  </nav>

    <!-- Drawer -->
    <transition name="slide">
      <div v-if="visible" class="fixed inset-0 z-9999 flex">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="visible = false"></div>

        <!-- Drawer panel -->
        <div class="relative flex flex-col w-72 bg-gray-900 text-white h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-700">
             <div v-if="user" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-xl font-bold">
                  <img 
                    :src="user.avatar ? user.avatar : 'https://www.smogon.com/forums/data/avatars/o/472/472281.jpg?1546953868'"
                    alt="User Avatar" 
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex flex-col">
                  <p class="font-semibold">{{ fullName }}</p>
                  <p class="text-xs text-gray-400">{{ user.last_name || '' }}</p>
                </div>
              </div>
            <button @click="visible = false" class="p-2 rounded-md hover:bg-gray-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                   viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Menu -->
          <div class="flex-1 overflow-y-auto py-2">
            <RouterLink
              v-for="item in user ? menuItems : guestMenu"
              :key="item.to"
              :to="item.to"
              @click="visible = false"
              class="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition"
            >
              <span class="w-6 h-6 flex items-center justify-center">
                <template v-if="item.icon === 'home'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <path d="M9 22V12h6v10"/>
                  </svg>
                </template>
                <template v-else-if="item.icon === 'chart'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="M9 17v-6"/>
                    <path d="M13 17v-10"/>
                    <path d="M17 17v-4"/>
                  </svg>
                </template>
                <template v-else-if="item.icon === 'arrow-down'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14m7-7l-7 7-7-7"/>
                  </svg>
                </template>
                <template v-else-if="item.icon === 'arrow-up'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19V5m7 7l-7-7-7 7"/>
                  </svg>
                </template>
                <template v-else-if="item.icon === 'login'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <path d="M10 17l5-5-5-5"/>
                    <path d="M10 12h10"/>
                  </svg>
                </template>
                <template v-else-if="item.icon === 'register'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                       viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M5.5 21a7 7 0 0 1 13 0"/>
                  </svg>
                </template>
              </span>
              <span class="text-sm">{{ item.label }}</span>
            </RouterLink>
          </div>

          <!-- Bottom actions -->
          <div v-if="user" class="p-4 border-t border-gray-700 space-y-2">
            <RouterLink to="/profile" @click="visible = false"
                        class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800">
              <span class="w-6 h-6 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                     viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M5.5 21a7 7 0 0 1 13 0"/>
                </svg>
              </span>
              <span class="text-sm">Profile</span>
            </RouterLink>

            <div @click="handleLogout"
                 class="flex items-center gap-3 px-3 py-2 rounded hover:bg-red-500/20 cursor-pointer">
              <span class="w-6 h-6 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                     viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 16l4-4-4-4"/>
                  <path d="M7 12h14"/>
                  <path d="M7 16v1a2 2 0 0 0 2 2h4"/>
                  <path d="M7 8V7a2 2 0 0 1 2-2h4"/>
                </svg>
              </span>
              <span class="text-sm text-red-400">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Slide animation */
.slide-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-enter-to   { transform: translateX(0); opacity: 1; }
.slide-leave-from { transform: translateX(0); opacity: 1; }
.slide-leave-to   { transform: translateX(-100%); opacity: 0; }
.slide-enter-active,
.slide-leave-active { transition: all 0.25s ease; }
</style>