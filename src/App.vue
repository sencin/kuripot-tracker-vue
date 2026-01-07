<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'

</script>

<template>
  <div class="min-h-screen px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
  <header>
      <nav>
        <AppNavbar />
      </nav>
  </header>
  <RouterView />
  </div>
</template>
