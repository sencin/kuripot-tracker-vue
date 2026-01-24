<template>
  <div class="min-h-screen p-4 text-white flex flex-col items-center gap-6">

    <!-- Top Card: Balance & Summary -->
    <div
      class="w-full max-w-4xl rounded-2xl bg-gray-900 bg-gradient-to-br from-primary-700 to-primary-900 shadow-2xl p-6 flex flex-col sm:flex-row sm:justify-between gap-6"
    >
      <!-- Total Balance -->
      <div class="flex-1 flex flex-col justify-center sm:pr-6">
        <p class="text-sm text-gray-300">Total Balance</p>
        <p class="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">₱{{ totalBalance.toFixed(2) }}</p>
      </div>

      <!-- Summary: Income & Expense -->
      <div class="flex flex-row sm:flex-col gap-4 sm:gap-3 w-full sm:w-auto">
        <div
          class="flex-1 sm:flex-none bg-green-600/20 rounded-xl p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200"
        >
          <p class="text-xs sm:text-sm text-gray-200 uppercase tracking-wider">Total Income</p>
          <p class="font-semibold text-green-400 text-lg sm:text-xl mt-1">₱{{ totalIncome.toFixed(2) }}</p>
        </div>
        <div
          class="flex-1 sm:flex-none bg-red-600/20 rounded-xl p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200"
        >
          <p class="text-xs sm:text-sm text-gray-200 uppercase tracking-wider">Total Expense</p>
          <p class="font-semibold text-red-400 text-lg sm:text-xl mt-1">₱{{ totalExpense.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Transactions List -->
   <div class="w-full max-w-4xl mt-6 space-y-4">
  <h2 class="text-lg sm:text-xl font-semibold text-gray-200 mb-2">Recent Transactions</h2>

  <div v-if="isTransactionLoading" class="text-sm text-gray-400">Loading...</div>

  <div v-else class="space-y-2">
    <div
      v-for="tx in recentTransactions"
      :key="tx.id"
      class="flex items-center justify-between p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:shadow-md transition-shadow duration-200 bg-gray-800"
    >
      <!-- Icon -->
      <div class="flex items-center flex-shrink-0">
        <i
          :class="tx.type === 'INCOME' ? 'pi pi-money-bill text-green-400' : 'pi pi-wallet text-red-400'"
          class="text-2xl sm:text-3xl"
        ></i>
      </div>

      <!-- Stacked Details -->
      <div class="flex-1 mx-4 flex flex-col text-xs sm:text-sm space-y-0.5">
        <span class="font-semibold text-gray-100">{{ tx.type }}</span>
        <span class="text-gray-400">{{ tx.description || 'No description' }}</span>
        <span class="text-gray-400">Date: {{ tx.date }} {{ formatTimeAMPM(tx.time) }}</span>
        <span class="text-gray-400">Payment: {{ tx.paymentTypeName || '-' }}</span>
        <span v-if="tx.expenseCategoryName" class="text-gray-400">Category: {{ tx.expenseCategoryName }}</span>
      </div>

      <!-- Amount -->
      <div
        class="flex-shrink-0 font-semibold text-lg sm:text-xl"
        :class="tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'"
      >
        {{ tx.type === 'INCOME' ? '+' : '-' }}₱{{ Number(tx.amount).toFixed(2) }}
      </div>
    </div>
  </div>
</div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { HTTPRequest } from "@/utils/HTTPRequest";
import { useAuthStore } from "@/stores/authenticate";

interface Transaction {
  id: number;
  amount: string;          // backend sends string
  date: string;
  time: string;
  description: string;
  type: "EXPENSE" | "INCOME";
  paymentTypeName?: string;      // optional
  expenseCategoryName?: string;  // optional
}

const transactions = ref<Transaction[]>([]);
const authStore = useAuthStore();
const isTransactionLoading = ref(true);

// Fetch transactions
const fetchTransactions = async () => {
  isTransactionLoading.value = true;
  try {
    const res = await HTTPRequest.get<Transaction[]>('/api/transactions/me', authStore.token);
    transactions.value = res.data.reverse();
  } catch (err) {
    console.error(err);
  } finally {
    isTransactionLoading.value = false;
  }
};

onMounted(() => {
  if (authStore.token) fetchTransactions();
});

// Derived data
const totalIncome = computed(() =>
  transactions.value.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0)
);
const totalExpense = computed(() =>
  transactions.value.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0)
);
const totalBalance = computed(() => totalIncome.value - totalExpense.value);

// Show only latest 10 transactions
const recentTransactions = computed(() => transactions.value.slice(0, 10));

const formatTimeAMPM = (time?: string) => {
  if (!time) return '';

  const parts = time.split(':');
  if (parts.length < 2) return time; 

  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (isNaN(h) || isNaN(m)) return time; 

  const hour12 = h % 12 || 12;
  const period = h >= 12 ? 'PM' : 'AM';

  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

</script>
