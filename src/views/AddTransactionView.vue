<template>
  <div class="p-4 space-y-6 min-h-screen text-white">

    <!-- Cards Section -->
<div class="flex gap-3 justify-center flex-wrap">
  <!-- Add Income Card -->
  <div
    class="flex-1 max-w-[200px] bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 cursor-pointer shadow flex flex-col items-center justify-center transition transform hover:scale-105"
    @click="openDialog('INCOME')"
  >
    <i class="pi pi-money-bill text-3xl mb-1"></i>
    <span class="font-medium text-sm text-center">Add Income</span>
  </div>

  <!-- Add Expense Card -->
  <div
    class="flex-1 max-w-[200px] bg-red-500 hover:bg-red-600 text-white rounded-lg p-3 cursor-pointer shadow flex flex-col items-center justify-center transition transform hover:scale-105"
    @click="openDialog('EXPENSE')"
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
    <!-- Dialog Form -->
    <Dialog
      v-model:visible="visible"
      pt:root:class="!border-0 !bg-transparent"
      pt:mask:class="backdrop-blur-sm"
      :modal="true"
      :closable="false"
      :style="{ width: '90%', maxWidth: '24rem' }"
    >
      <template #container="{ closeCallback }">
        <div
          class="flex flex-col px-4 py-4 gap-3 rounded-xl"
          :style="dialogBg"
        >
          <div class="flex flex-col gap-3 text-sm">
            <p>Generate New {{ type === 'EXPENSE' ? 'Expense' : 'Income' }}</p>

            <InputNumber
              v-model="newTransaction.amount"
              mode="currency"
              placeholder="Amount"
              currency="PHP"
              class="!p-0 !h-auto !text-white !border-0"
            />

            <DatePicker
              v-model="selectedDate"
              inputId="transaction-date"
              showIcon
              placeholder="Date"
              iconDisplay="input"
              fluid
              class="!p-0 !h-auto !text-black !border-0"
            />

            <DatePicker
              v-model="selectedTime"
              inputId="transaction-time"
              timeOnly
              placeholder="Time"
              hourFormat="12"
              fluid
              class="!p-0 !h-auto !text-black !border-0"
            />

            <Dropdown
              v-model="newTransaction.paymentTypeId"
              :options="paymentTypeOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Payment Type"
              class="w-full"
              :loading="loadingOptions"
            />

            <Dropdown
              v-if="type === 'EXPENSE'"
              v-model="newTransaction.expenseCategoryId"
              :options="expenseCategoryOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Expense Category"
              class="w-full"
              :loading="loadingOptions"
            />

            <InputText
              v-model="newTransaction.description"
              placeholder="Description"
              size="large"
              class="!p-2 !border-0 !text-white w-full"
            />
          </div>

          <div class="flex flex-col gap-2 mt-3 sm:flex-row">
            <Button
              label="Cancel"
              class="w-full sm:w-1/2 p-button-secondary"
              @click="closeCallback"
            />
            <Button
              label="Save"
              icon="pi pi-sign-in"
              :loading="loading"
              class="w-full sm:w-1/2 p-button-success"
              @click="createTransaction"
            />
          </div>
        </div>
      </template>
    </Dialog>

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
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authenticate';
import { HTTPRequest } from '@/utils/HTTPRequest';

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

const paymentTypeOptions = ref<Option[]>([]);
const expenseCategoryOptions = ref<Option[]>([]);

const lastTransactions = computed(() =>
  transactions.value.slice(0, 10) // take the first 10 items
);


const dialogBg = computed(() => ({
  backgroundImage:
    type.value === 'EXPENSE'
      ? 'radial-gradient(circle at left top, var(--p-red-500), var(--p-red-700))'
      : 'radial-gradient(circle at left top, var(--p-green-500), var(--p-green-700))'
}));

const openDialog = (t: 'EXPENSE' | 'INCOME') => {
  type.value = t;
  newTransaction.value.type = t;
  visible.value = true;
};

const fetchPaymentTypes = async () => {
  loadingOptions.value = true;
  try {
    paymentTypeOptions.value = await HTTPRequest.get('/api/payment-types', authStore.token);
  } catch (err) { console.error(err); }
  loadingOptions.value = false;
};

const fetchExpenseCategories = async () => {
  loadingOptions.value = true;
  try {
    expenseCategoryOptions.value = await HTTPRequest.get('/api/expense-categories', authStore.token);
  } catch (err) { console.error(err); }
  loadingOptions.value = false;
};

const fetchTransactions = async () => {
  isTransactionLoading.value = true;
  try {
    const data = await HTTPRequest.get<Transaction[]>('/api/transactions/me', authStore.token);
    transactions.value = data.reverse();
  } catch (err) {
    console.error(err);
  } finally {
    isTransactionLoading.value = false;
  }
};


onMounted(() => {
  fetchPaymentTypes();
  fetchExpenseCategories();
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

const createTransaction = async () => {
  if (!selectedDate.value || !selectedTime.value) return;

  const d = selectedDate.value;
  const t = selectedTime.value;

  newTransaction.value.date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  newTransaction.value.time = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:00`;

  loading.value = true;
  try {
    const data = await HTTPRequest.post<{ transaction: Transaction }>('/api/transactions', authStore.token, newTransaction.value);
    transactions.value.unshift(data.transaction);
    toast.add({ severity:'success', summary:'Success', detail: `${type.value} Recorded`, life:3000 });
    // Reset
    newTransaction.value = { type:type.value, amount:null, date:'', time:'', paymentTypeId:0, expenseCategoryId:null, description:'' };
    selectedDate.value = null;
    selectedTime.value = null;
    visible.value = false;
  } catch (err) {
    console.error(err);
    toast.add({ severity:'error', summary:'Error', detail:(err as Error).message || 'Failed', life:3000 });
  }
  loading.value = false;
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
