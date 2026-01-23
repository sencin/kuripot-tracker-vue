<template>
  <div class="p-2 sm:p-4 min-h-screen text-white ">
    <div
      class="flex flex-col sm:flex-row gap-4"
    >
      <!-- Income Section -->
      <div class="flex-1  rounded-lg shadow-md p-4 sm:p-6 overflow-auto">
        <IncomeView v-model:visible="incomeVisible" />
      </div>

      <!-- Expense Section -->
      <div class="flex-1  rounded-lg shadow-md p-4 sm:p-6 overflow-auto">
        <ExpenseView v-model:visible="expenseVisible" />
      </div>
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
