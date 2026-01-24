<template>
  <div class="min-h-screen flex items-center justify-center  px-4">
    <div class="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
      <h2 class="text-3xl font-bold mb-6 text-white text-center">Enter Access Code</h2>

      <div class="w-full">
        <input
          v-model="accessCode"
          type="text"
          placeholder="Enter your code"
          class="w-full p-4 rounded-xl text-gray-900 placeholder-gray-500 bg-gray-100 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-shadow duration-200 hover:shadow-lg"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm mt-2 text-center">{{ error }}</p>

      <button
        @click="verifyCode"
        :disabled="loading"
        class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50 transition-colors duration-200"
      >
        {{ loading ? 'Verifying...' : 'Submit' }}
      </button>

      <p class="text-gray-400 text-sm mt-4 text-center">
        Only users with a valid code can access registration.
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HTTPRequest } from '@/utils/HTTPRequest'
import axios from 'axios'

const router = useRouter()
const accessCode = ref('')
const loading = ref(false)
const error = ref('')

interface DevAccessResponse {
  valid: boolean
  message?: string
}

const verifyCode = async (): Promise<void> => {
  error.value = ''

  if (!accessCode.value) {
    error.value = 'Code is required'
    return
  }

  loading.value = true

  try {
    const res = await HTTPRequest.post<DevAccessResponse>('/api/auth/dev-access', { code: accessCode.value })

    console.log(res)

    if (res.status === 200) {
      sessionStorage.setItem('devAccess', 'true')
      router.push('/register')
    } else {
      error.value = res.data.message || 'Invalid access code'
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message || `HTTP ${err.response?.status} error`
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Failed to verify code. Try again.'
    }
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  if (sessionStorage.getItem('devAccess') === 'true') {
    router.push('/register')
  }
})
</script>

<!-- delete this page if done testing -->