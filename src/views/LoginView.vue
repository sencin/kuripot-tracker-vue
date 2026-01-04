<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="********"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

           <Button
          type="submit"
          label="Log In"
          icon="pi pi-sign-in"
          class="w-full"
          :loading="loading"
        />
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-500 hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter, RouterLink } from "vue-router"
import { useAuthStore } from "@/stores/authenticate"

import Button from "primevue/button"

const { authenticate } = useAuthStore()
const router = useRouter()

const email = ref("")
const password = ref("")
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  try {
    await authenticate("login", {
      email: email.value,
      password: password.value
    })
    await router.push({ name: "dashboard" })
  } catch (error) {
    console.error("Login failed:", error)
  } finally {
    loading.value = false
  }
}
</script>
