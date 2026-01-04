<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authenticate.ts'
import type { User } from '@/stores/authenticate'

// Drawer visibility
const visible = ref(false)

// Menu item type
interface MenuItem {
  label: string
  icon: string
  to?: string
  key?: string // for collapsible parent
  children?: MenuItem[] // nested submenu
}

// Section type
interface MenuSection {
  title: string
  key: string
  items: MenuItem[]
}

const user = ref<User | null>(null)
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.getUser();
  user.value = authStore.user.user_id ? authStore.user : null;
});

watch(
  () => authStore.user,
  (val) => {
    user.value = val.user_id ? val : null;
  },
  { deep: true },
);


// Collapsible menus state
const openMenus = ref<Record<string, boolean>>({
  favorites: true,
  record: true,
  application: true,
})

// Menu for logged-in users
const authMenu: MenuSection[] = [
  {
    title: 'FAVORITES',
    key: 'favorites',
    items: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/' },
      { label: 'Overview', icon: 'pi pi-bookmark', to: '/overview' },
      {
        label: 'Record',
        icon: 'pi pi-chart-line',
        key: 'record',
        children: [
          { label: 'Income', icon: 'pi pi-chart-line', to: '/record/income' },
          { label: 'Expenses', icon: 'pi pi-chart-line', to: '/record/expenses' },
        ],
      },
      { label: 'Team', icon: 'pi pi-users', to: '/team' },
    ],
  },
  {
    title: 'APPLICATION',
    key: 'application',
    items: [
      { label: 'Projects', icon: 'pi pi-folder', to: '/projects' },
      { label: 'Performance', icon: 'pi pi-chart-bar', to: '/performance' },
    ],
  },
]

// Menu for guests
const guestMenu: MenuItem[] = [
  { label: 'Login', icon: 'pi pi-sign-in', to: '/login' },
  { label: 'Register', icon: 'pi pi-user-plus', to: '/register' },
  { label: 'About', icon: 'pi pi-info-circle', to: '/about' },
]

// Computed menu based on user
const menu = computed<MenuSection[] | MenuItem[]>(() => (user.value ? authMenu : guestMenu))
</script>

<template>
  <div class="card flex justify-start">
    <Drawer v-model:visible="visible">
      <template #container="{ closeCallback }">
        <div class="flex flex-col h-full">
          <!-- Drawer Header -->
          <div class="flex items-center justify-between px-6 pt-4 shrink-0">
            <span class="inline-flex items-center gap-2">
              <svg width="35" height="40" viewBox="0 0 35 40" fill="none">
                <path d="..." fill="var(--p-primary-color)" />
                <path d="..." fill="var(--p-text-color)" />
              </svg>
              <span class="font-semibold text-2xl text-primary">Kuripot Tracker</span>
            </span>
            <Button
              type="button"
              @click="closeCallback"
              icon="pi pi-times"
              severity="danger"
              variant="outlined"
              class="p-0.5 text-xs"
            />
          </div>

          <!-- Drawer Menu -->
          <div class="overflow-y-auto">
            <!-- Logged-in menu -->
            <template v-if="user">
              <ul
                class="list-none p-4 m-0"
                v-for="section in menu as MenuSection[]"
                :key="section.key"
              >
                <li>
                  <div
                    class="p-4 flex items-center justify-between text-surface-500 dark:text-surface-400 cursor-pointer"
                    @click="openMenus[section.key] = !openMenus[section.key]"
                  >
                    <span class="font-medium">{{ section.title }}</span>
                    <i
                      :class="openMenus[section.key] ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                    ></i>
                  </div>
                  <ul
                    v-show="openMenus[section.key]"
                    class="list-none p-0 m-0 overflow-hidden transition-all duration-300"
                  >
                    <template v-for="item in section.items">
                      <li v-if="!item.children" :key="item.to">
                        <RouterLink
                          :to="item.to!"
                          class="flex items-center p-4 rounded hover:bg-surface-100 dark:hover:bg-surface-800"
                          @click="visible = false"
                        >
                          <i :class="item.icon + ' mr-2'"></i>
                          {{ item.label }}
                        </RouterLink>
                      </li>
                      <li v-else :key="item.key">
                        <div
                          class="flex items-center p-4 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                          @click="openMenus[item.key!] = !openMenus[item.key!]"
                        >
                          <i :class="item.icon + ' mr-2'"></i>
                          {{ item.label }}
                          <i
                            :class="
                              openMenus[item.key!]
                                ? 'pi pi-chevron-up ml-auto'
                                : 'pi pi-chevron-down ml-auto'
                            "
                          ></i>
                        </div>
                        <ul
                          v-show="openMenus[item.key!]"
                          class="list-none pl-4 transition-all duration-300"
                        >
                          <li v-for="child in item.children" :key="child.to">
                            <RouterLink
                              :to="child.to!"
                              class="flex items-center p-4 rounded hover:bg-surface-100 dark:hover:bg-surface-800"
                              @click="visible = false"
                            >
                              <i :class="child.icon + ' mr-2'"></i>
                              {{ child.label }}
                            </RouterLink>
                          </li>
                        </ul>
                      </li>
                    </template>
                  </ul>
                </li>
              </ul>
            </template>

            <!-- Guest menu -->
            <template v-else>
              <ul class="list-none p-4 m-0">
                <li v-for="item in menu as MenuItem[]" :key="item.to">
                  <RouterLink
                    :to="item.to!"
                    class="flex items-center p-4 rounded hover:bg-surface-100 dark:hover:bg-surface-800"
                    @click="visible = false"
                  >
                    <i :class="item.icon + ' mr-2'"></i>
                    {{ item.label }}
                  </RouterLink>
                </li>
              </ul>
            </template>
          </div>

          <!-- Drawer Footer -->
          <div v-if="user" class="mt-auto">
            <hr class="mb-4 mx-4 border-t border-0 border-surface-200 dark:border-surface-700" />
            <RouterLink
              to="/profile"
              class="m-4 flex items-center cursor-pointer p-4 gap-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800"
              @click="visible = false"
            >
              <Avatar
                image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                shape="circle"
              />
              <span class="font-bold">{{ user.first_name }}</span>
            </RouterLink>
          </div>
        </div>
      </template>
    </Drawer>

    <Button icon="pi pi-bars" @click="visible = true" severity="secondary" />
  </div>
</template>
