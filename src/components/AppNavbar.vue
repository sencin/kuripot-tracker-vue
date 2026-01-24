<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { RouterLink, useRouter } from 'vue-router'
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


// Collapsible menus state
const openMenus = ref<Record<string, boolean>>({
  Main: true,
  record: true,
  application: true,
})

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() =>
  authStore.isAuthenticated ? authStore.user : null
)

// Menu for logged-in users
const authMenu: MenuSection[] = [
  {
    title: 'Main Menu',
    key: 'Main',
    items: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/home' },
      { label: 'Overview', icon: 'pi pi-chart-bar', to: '/overview' },
      {
        label: 'Record',
        icon: 'pi pi-calculator',
        key: 'record',
        children: [
          { label: 'Income', icon: 'pi pi-cart-plus', to: '/record/income' },
          { label: 'Expenses', icon: 'pi pi-cart-minus', to: '/record/expenses' },
        ],
      },
      // { label: 'About Us', icon: 'pi pi-users', to: '/team' },
    ],
  },
  // {
  //   title: 'APPLICATION',
  //   key: 'application',
  //   items: [
  //     { label: 'Projects', icon: 'pi pi-folder', to: '/projects' },
  //     { label: 'Performance', icon: 'pi pi-chart-bar', to: '/performance' },
  //   ],
  // },
]

// Menu for guests
const guestMenu: MenuItem[] = [
  { label: 'Login', icon: 'pi pi-sign-in', to: '/login' },
  { label: 'Register', icon: 'pi pi-user-plus', to: '/register' },
  // { label: 'About', icon: 'pi pi-info-circle', to: '/about' },
]

// Computed menu based on user
const menu = computed<MenuSection[] | MenuItem[]>(() => (user.value ? authMenu : guestMenu))

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push({ name: "login" }); 
    visible.value = false
  }
};

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
            <!-- <Button
              type="button"
              @click="closeCallback"
              icon="pi pi-times"
              severity="danger"
              variant="text"
              class="p-0.5 text-xs"
            /> -->
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
          <div v-if="user" class="mt-auto px-4 py-4">
        
            <!-- Account + Logout buttons -->
            <div class="flex items-center gap-2">
              <RouterLink to="/profile" class="flex-auto">
                <Button 
                  label="Account" 
                  icon="pi pi-user" 
                  class="w-full" 
                  variant="outlined" 
                />
              </RouterLink>

              <Button 
                label="Logout" 
                icon="pi pi-sign-out" 
                class="flex-auto"
                severity="danger" 
                variant="outlined"
                @click="handleLogout"
              />
            </div>
          </div>
        </div>
      </template>
    </Drawer>

    <Button icon="pi pi-bars" @click="visible = true" severity="secondary" />
  </div>
</template>
