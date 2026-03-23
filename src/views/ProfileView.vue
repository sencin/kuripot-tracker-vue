<template>
  <div class="min-h-screen flex justify-center px-4 py-6">

    <div class="w-full max-w-md relative overflow-hidden">

      <!-- Main Menu (only show on root /profile) -->
      <div v-if="$route.path === '/profile'">
        <!-- Profile Header -->
        <div class="flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow-md mb-4">
          <div class="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-3xl text-white mb-3">
            <i class="pi pi-user"></i>
          </div>
          <p class="text-lg font-semibold text-white">John Doe</p>
          <p class="text-sm text-gray-400">john@example.com</p>
        </div>

        <!-- Menu -->
        <div class="bg-gray-800 rounded-xl shadow-md divide-y divide-gray-700">
          <RouterLink 
  to="/profile/account" 
  class="flex items-center p-4 text-sm text-gray-200 hover:bg-gray-700 transition cursor-pointer"
>
  <i class="pi pi-user text-blue-400"></i>
  <span class="ml-3">Account Info</span>
  <i class="pi pi-chevron-right ml-auto"></i>
</RouterLink>

<RouterLink 
  to="/profile/security" 
  class="flex items-center p-4 text-sm text-gray-200 hover:bg-gray-700 transition cursor-pointer"
>
  <i class="pi pi-lock text-yellow-400"></i>
  <span class="ml-3">Security Code</span>
  <i class="pi pi-chevron-right ml-auto"></i>
</RouterLink>

<RouterLink 
  to="/profile/privacy" 
  class="flex items-center p-4 text-sm text-gray-200 hover:bg-gray-700 transition cursor-pointer"
>
  <i class="pi pi-shield text-green-400"></i>
  <span class="ml-3">Privacy Policy</span>
  <i class="pi pi-chevron-right ml-auto"></i>
</RouterLink>

<RouterLink 
  to="/profile/settings" 
  class="flex items-center p-4 text-sm text-gray-200 hover:bg-gray-700 transition cursor-pointer"
>
  <i class="pi pi-cog text-gray-300"></i>
  <span class="ml-3">Settings</span>
  <i class="pi pi-chevron-right ml-auto"></i>
</RouterLink>

<div 
  class="flex items-center p-4 text-sm text-red-400 hover:bg-gray-700 transition cursor-pointer"
  @click="handleLogout"
>
  <i class="pi pi-sign-out text-red-400"></i>
  <span class="ml-3">Logout</span>
  <i class="pi pi-chevron-right ml-auto"></i>
</div>
        </div>
      </div>

      <!-- Sliding Pages -->
      <Transition name="slide" mode="out-in">
        <RouterView />
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authenticate.ts'
import type { User } from '@/stores/authenticate'

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push({ name: "login" }); 
  }
};

</script>