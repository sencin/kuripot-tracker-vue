<template>
  <div class="min-h-screen flex items-center justify-center px-4 ">
    <div class="w-full max-w-md bg-gray-900 shadow-xl rounded-xl p-6 sm:p-8">
      <h2 class="text-2xl font-semibold text-center mb-2 text-white">
        Verify Your Account
      </h2>
      <p class="text-sm text-gray-400 text-center mb-6">
        Enter the OTP sent to <span class="font-medium">{{ email }}</span>
      </p>

      <form @submit.prevent="verifyOtp" class="space-y-5">

        <!-- OTP -->
        <div>
          <label class="block text-sm text-gray-400 mb-1">OTP Code</label>
          <input
            v-model="otp"
            type="text"
            placeholder="Enter OTP"
            required
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 font-medium
                 disabled:opacity-50 transition"
        >
          {{ loading ? 'Verifying…' : 'Verify OTP' }}
        </button>
      </form>

      <p class="text-center text-xs mt-5 text-gray-400">
        Didn’t receive an OTP? Check your spam folder or request again.
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HTTPRequest } from '@/utils/HTTPRequest'

const router = useRouter()

const otp = ref('')
const error = ref('')
const loading = ref(false)

// Get email from localStorage (set after registration)
const email = ref('')

onMounted(() => {
  const storedEmail = localStorage.getItem('registeredEmail')
  if (!storedEmail) {
    router.push('/register')
    return
  }
  email.value = storedEmail
})

const verifyOtp = async (): Promise<void> => {
  error.value = ''

  if (!otp.value) {
    error.value = 'OTP is required'
    return
  }

  if (!email.value) {
    error.value = 'No registered email found. Please register first.'
    return
  }

  loading.value = true

  try {
     const response = await HTTPRequest.post<{ message: string }>('/api/auth/verify-otp',{   
        email: email.value,
        otp: otp.value
      }
    )

    alert(response.data.message || 'OTP verified successfully!')

    router.push('/login')

    localStorage.removeItem('registeredEmail')

  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Failed to verify OTP. Try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
