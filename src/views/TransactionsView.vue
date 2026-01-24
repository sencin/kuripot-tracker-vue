<template>
  <div class="p-2 sm:p-4 min-h-screen text-white ">
    <div
      class="flex flex-col sm:flex-row gap-4"
    >
    <p>Still in development wuwuwuwuw</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IncomeView from './IncomeView.vue'
import ExpenseView from './ExpenseView.vue'

const incomeVisible = ref(false)
const expenseVisible = ref(false)
</script>
