<template>
    <header class="sm:px-6 lg:px-8 p-4">
      <nav>
        <AppNavbar />
      </nav>
  </header>
  <div class="dashboard-layout min-h-screen text-white pb-20 ">
    <!-- Page content -->
    <router-view />

    <!-- Dock-style Bottom Tabs -->
    <Tabs
      v-model:value="activeTab"
      class="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50"
    >
      <TabList class="flex gap-6 bg-gray-900 border border-gray-700 bg-opacity-80 backdrop-blur-lg px-6 py-3 shadow-lg">
        <Tab
          v-for="tab in items"
          :key="tab.route"
          :value="tab.route"
          class="flex-1"
        >
          <router-link :to="tab.route" custom v-slot="{ navigate, isActive }">
            <a
              @click="navigate"
              v-ripple
              :class="[
                'flex flex-col items-center justify-center gap-1 transform transition-all duration-200',
                isActive ? 'text-white scale-110' : 'text-gray-400 hover:text-white hover:scale-110'
              ]"
            >
              <i :class="tab.icon" class="text-3xl"></i>
              <span class="text-xs font-medium">{{ tab.label }}</span>
            </a>
          </router-link>
        </Tab>
      </TabList>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue'
const route = useRoute();

// activeTab now always reflects the current route
const activeTab = ref(route.path);

watch(
  () => route.path,
  (path) => {
    activeTab.value = path;
  }
);

const items = [
  { label: 'Home', route: '/home', icon: 'pi pi-home' },
  { label: 'Transactions', route: '/transactions', icon: 'pi pi-wallet' },
  { label: 'Add', route: '/add-transaction', icon: 'pi pi-plus' },
  { label: 'Analytics', route: '/analytics', icon: 'pi pi-chart-line' },
  { label: 'Profile', route: '/profile', icon: 'pi pi-user' }
];
</script>

<style scoped>
:deep(.p-tab) a {
  transition: all 0.2s ease;
}

:deep(.p-tab-active) a {
  color: white !important;
}
</style>
