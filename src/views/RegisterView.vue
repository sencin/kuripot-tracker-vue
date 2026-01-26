<template>
   <header class="sm:px-6 lg:px-8 p-4">
      <nav>
        <AppNavbar />
      </nav>
  </header>

  <div class="min-h-screen flex items-center justify-center px-4 ">
    <div class="w-full max-w-md bg-gray-900 shadow-xl  p-4 sm:p-8 mt-4">
      <h2 class="text-2xl font-semibold text-center mb-2 text-white">
        Create Account
      </h2>
      <p class="text-sm text-gray-400 text-center mb-6">
        Fill in your details to get started
      </p>

      <form @submit.prevent="register" class="space-y-5">

        <!-- Email -->
        <div>
          <label class="block text-sm text-gray-400 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            required
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition"
          />
        </div>

        <!-- Full name -->
        <div class="space-y-3">
          <label class="block text-sm text-gray-400">Full name</label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              v-model="form.firstName"
              placeholder="First name"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition"
            />
            <input
              v-model="form.middleName"
              placeholder="Middle name"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              v-model="form.lastName"
              placeholder="Last name"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition"
            />
            <input
              v-model="form.extensionName"
              placeholder="Suffix (Jr, III)"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm text-gray-400 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm text-gray-400 mb-1">Confirm password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium
                 disabled:opacity-50 transition"
        >
          {{ loading ? 'Registering…' : 'Register' }}
        </button>
      </form>

      <p class="text-center text-xs mt-5 text-gray-400">
        A verification code will be sent to your email
      </p>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HTTPRequest } from '@/utils/HTTPRequest'
import AppNavbar from '@/components/AppNavbar.vue'
const router = useRouter()

const loading = ref(false)
const error = ref('')
const confirmPassword = ref('')

// Only include fields required by SignupRequest
const form = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  email: '',
  password: '',
})

const register = async (): Promise<void> => {
  error.value = ''

  if (form.value.password !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  const payload = {
    firstName: form.value.firstName,
    middleName: form.value.middleName || '',
    lastName: form.value.lastName,
    extensionName: form.value.extensionName || '',
    email: form.value.email,
    password: form.value.password,
  }

  try {

    await HTTPRequest.post('/api/auth/register', payload, undefined)

    // Save the registered email for OTP verification
    localStorage.setItem('registeredEmail', payload.email)

    alert('Registration successful! Check your email for verification code.')
    router.push('/verify-otp') 

  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Registration failed. Try again.'
    }
  } finally {
    loading.value = false
  }
}

</script>

