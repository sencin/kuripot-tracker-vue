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

        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition" :loading="loading"
        >
          Log In
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-500 hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from '@/stores/authenticate.ts'
const { authenticate } = useAuthStore();

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false)

const handleLogin = async () => {
  const userInput = {
    email: email.value,
    password: password.value,
  };

  loading.value = true;

  console.log("Logging in with", userInput);

  try {
    await authenticate('login', userInput);
    await router.push({ name: "dashboard" });
  } catch (error: unknown) {
    console.error("Login failed:", error);
  }
  finally{
     loading.value = false;
  }
};

</script>
