<template>
  <div class="p-4 space-y-6 min-h-screen text-white">
    <div class="flex gap-3 justify-center flex-wrap">
      <!-- Add Income Card -->
      <div
        class="flex-1 max-w-[200px]
              bg-green-500 hover:bg-green-600
              text-white rounded-lg p-3
              cursor-pointer shadow
              flex flex-col items-center justify-center
              transition transform hover:scale-105"
        @click="goToIncome"
      >
        <i class="pi pi-money-bill text-3xl mb-1"></i>
        <span class="font-medium text-sm text-center">Add Income</span>
      </div>

      <!-- Add Expense Card -->
      <div
        class="flex-1 max-w-[200px]
              bg-red-500 hover:bg-red-600
              text-white rounded-lg p-3
              cursor-pointer shadow
              flex flex-col items-center justify-center
              transition transform hover:scale-105"
        @click="goToExpense"
      >
        <i class="pi pi-wallet text-3xl mb-1"></i>
        <span class="font-medium text-sm text-center">Add Expense</span>
      </div>
    </div>


  <div class="flex items-center justify-between mt-2">
    <h2 class="text-sm font-semibold text-gray-300 tracking-wide">
      Last Added Transactions
    </h2>
  </div>

    <!-- Transactions Table -->
    <div v-if="isTransactionLoading" class="text-sm text-gray-400">
      Fetching data from server...
    </div>
    <div v-else class="w-full overflow-x-auto">
   <div class="flex flex-col gap-3 w-full">
  <div
    v-for="tx in lastTransactions"
    :key="tx.id"
    class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-900 transition border border-gray-700"
  >
    <!-- Left Icon -->
    <div class="flex-shrink-0">
      <i
        :class="tx.type === 'INCOME' ? 'pi pi-money-bill text-green-400 text-2xl' : 'pi pi-wallet text-red-400 text-2xl'"
      ></i>
    </div>

    <!-- Middle: type/category & date -->
    <div class="flex-1 mx-3 flex flex-col min-w-0">
      <span class="font-semibold text-sm truncate text-white">
        {{ tx.type === 'INCOME' ? 'Income' : tx.expenseCategoryName || 'Expense' }}
      </span>
      <span class="text-xs text-gray-400 truncate">
        {{ tx.date }} {{ formatTimeAMPM(tx.time) }}
      </span>
    </div>

    <!-- Right: amount -->
    <div class="flex-shrink-0 font-semibold text-lg text-right">
      <span :class="tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'">
        {{ tx.type === 'INCOME' ? '+' : '-' }}₱{{ Number(tx.amount).toFixed(2) }}
      </span>
    </div>
  </div>
</div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authenticate';
import { HTTPRequest } from '@/utils/HTTPRequest';
import { useRouter } from 'vue-router'

const toast = useToast();
const authStore = useAuthStore();

interface Transaction {
  id: number;
  amount: string;
  date: string;
  time: string;
  description: string;
  expenseCategoryName?: string;
  paymentTypeName: string;
  type: 'EXPENSE' | 'INCOME';
}

interface Option { id: number; name: string; }

const visible = ref(false);
const type = ref<'EXPENSE' | 'INCOME'>('EXPENSE');
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<Date | null>(null);
const loading = ref(false);
const loadingOptions = ref(false);
const isTransactionLoading = ref(true);
const transactions = ref<Transaction[]>([]);
const newTransaction = ref({
  type: 'EXPENSE',
  amount: null as number | null,
  date: '',
  time: '',
  paymentTypeId: 0,
  expenseCategoryId: null as number | null,
  description: ''
});


const router = useRouter()

const goToIncome = () => {
  router.push({ name: 'income' })  
}

const goToExpense = () => {
  router.push({ name: 'expenses' })
}

const lastTransactions = computed(() =>
  transactions.value.slice(0, 10) // take the first 10 items
);


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
  fetchTransactions();
});

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

<style scoped>
.p-inputtext, .p-dropdown, .p-inputnumber, .p-datepicker {
  width: 100%;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  padding: 0.75rem !important;
  background-color: #1f2937 !important;
  color: #f9fafb !important;
  border: none !important;
}
@media(min-width:640px){
  .p-inputtext, .p-dropdown, .p-inputnumber, .p-datepicker { font-size:0.875rem; }
}
</style>
