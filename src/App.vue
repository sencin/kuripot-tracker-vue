<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/authenticate.ts'

const authStore = useAuthStore()
import Toast from 'primevue/toast';
</script>

<template>
  <Toast position="bottom-right"/>
  <div v-if="authStore.loading === true"  class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="w-full text-white text-center">
        Fetching user data<span class="dot-typing"></span>
      </div>

    <div class="mt-2">
      <svg class="animate-spin h-6 w-6 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>
  </div>

  <div class="min-h-screen px-4 sm:px-6 lg:px-8 py-4 flex flex-col bg-gray-950">
  <RouterView />
  </div>
</template>

<style scoped>
.dot-typing::after {
  content: '.';
  animation: dots 1s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
}
</style>
