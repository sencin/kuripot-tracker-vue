<template>
  <div class="min-h-screen px-4 text-white flex flex-col items-center gap-2">

    <h1 class="text-xl sm:text-2xl font-semibold text-gray-200 mb-4">All Transactions</h1>

    <!-- Filter Dropdown -->
    <div class="w-full max-w-5xl flex justify-center mb-2">
      <Dropdown
        v-model="filterType"
        :options="filterOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filter by Type"
        class="w-48"
      />
    </div>

    <div v-if="isLoading" class="text-sm text-gray-400">Loading...</div>

    <div v-else class="w-full max-w-5xl space-y-3">

      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border gap-2 border-gray-700 hover:border-gray-500 hover:shadow-md transition-shadow duration-200 bg-gray-900 bg-linear-to-br from-primary-700 to-primary-900"
      >
        <!-- Left Icon -->
        <div class="flex-shrink-0 mb-2 sm:mb-0">
          <i
            :class="tx.type === 'INCOME' ? 'pi pi-money-bill text-green-400' : 'pi pi-wallet text-red-400'"
            class="text-2xl sm:text-3xl"
          ></i>
        </div>

        <!-- Transaction Info -->
        <div class="flex-1 flex flex-col gap-0.5  text-sm">
          <span class="font-semibold">{{ tx.type }}</span>
          <span>Description: {{ tx.description || '-' }}</span>
          <span>Payment: {{ tx.paymentTypeName || '-' }}</span>
          <span v-if="tx.expenseCategoryName">Category: {{ tx.expenseCategoryName }}</span>
          <span>Date: {{ tx.date }} {{ formatTimeAMPM(tx.time) }}</span>
        </div>

        <!-- Amount -->
        <div
          class="flex-shrink-0 font-semibold text-lg sm:text-xl mt-2 sm:mt-0"
          :class="tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'"
        >
          {{ tx.type === 'INCOME' ? '+' : '-' }}₱{{ Number(tx.amount).toFixed(2) }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-2 sm:mt-0">
          <Button
            icon="pi pi-pencil"
            class="p-button-sm p-button-info"
            @click="editTransaction(tx)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-sm p-button-danger"
            @click="deleteTransaction(tx)"
          />
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="editDialogVisible"
      header="Edit Transaction"
      modal
      :closable="false"
      :style="{ width: '90%', maxWidth: '24rem' }"
    >
      <div class="flex flex-col gap-3">
        <InputNumber
          v-model="editTransactionData.amount"
          mode="currency"
          currency="PHP"
          placeholder="Amount"
          class="!border-0 w-full"
        />

        <DatePicker
          v-model="editTransactionData.dateObj"
          inline
          class="w-full"
        />

        <DatePicker
          v-model="editTransactionData.timeObj"
          timeOnly
          hourFormat="12"
          placeholder="Time"
          fluid
        />

            <!-- Payment Type -->
        <Dropdown
          v-model="editTransactionData.paymentTypeId"
          :options="paymentTypeOptions"
          optionLabel="name"
          optionValue="id"
          placeholder="Payment Type"
          class="w-full"
        />
        <p v-if="showErrors.paymentType" class="text-red-500 text-xs mt-1">
          Payment type is required
        </p>

        <!-- Expense Category -->
        <Dropdown
          v-if="editTransactionData.type === 'EXPENSE'"
          v-model="editTransactionData.expenseCategoryId"
          :options="expenseCategoryOptions"
          optionLabel="name"
          optionValue="id"
          placeholder="Expense Category"
          class="w-full"
        />
        <p v-if="showErrors.expenseCategory" class="text-red-500 text-xs mt-1">
          Expense category is required
        </p>

        <InputText
          v-model="editTransactionData.description"
          placeholder="Description"
          class="!border-0 w-full"
        />

        <div class="flex gap-2 mt-3">
          <Button
            label="Cancel"
            class="w-full p-button-secondary"
            @click="editDialogVisible = false"
          />
          <Button
            label="Save"
            class="w-full p-button-success"
            :loading="loading"
            @click="updateTransaction"
          />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authenticate';
import { HTTPRequest } from '@/utils/HTTPRequest';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import DatePicker from 'primevue/datepicker';
import { reactive } from 'vue';

interface Transaction {
  id: number;
  amount: string;
  date: string;
  time: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  paymentTypeName?: string;
  paymentTypeId?: number;
  expenseCategoryName?: string;
  expenseCategoryId?: number;
}

interface Option { id: number; name: string; }

const showErrors = reactive({
  paymentType: false,
  expenseCategory: false,
});

const authStore = useAuthStore();
const transactions = ref<Transaction[]>([]);
const isLoading = ref(true);
const loading = ref(false);
const filterType = ref<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

const loadingOptions = ref(false);
const paymentTypeOptions = ref<Option[]>([]);
const expenseCategoryOptions = ref<Option[]>([]);

const filterOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Income', value: 'INCOME' },
  { label: 'Expense', value: 'EXPENSE' },
];

const fetchTransactions = async () => {
  isLoading.value = true;
  try {
    const res = await HTTPRequest.get<Transaction[]>('/api/transactions/me', authStore.token);
    transactions.value = res.data.reverse();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchPaymentTypes = async () => {
  try {
    loadingOptions.value = true;
    const res = await HTTPRequest.get<Option[]>('/api/payment-types', authStore.token);
    paymentTypeOptions.value = res.data; 
  } catch (err) {
    console.error(err);
  } finally {
    loadingOptions.value = false;
  }
};

const fetchExpenseCategories = async () => {
  try {
    loadingOptions.value = true;
    const res = await HTTPRequest.get<Option[]>('/api/expense-categories', authStore.token);
    expenseCategoryOptions.value = res.data; 
  } catch (err) {
    console.error(err);
  } finally {
    loadingOptions.value = false;
  }
};

const validateEdit = (): boolean => {
  // Reset errors
  showErrors.paymentType = false;
  showErrors.expenseCategory = false;

  let valid = true;

  if (!editTransactionData.value.paymentTypeId) {
    showErrors.paymentType = true;
    valid = false;
  }

  if (editTransactionData.value.type === 'EXPENSE' && !editTransactionData.value.expenseCategoryId) {
    showErrors.expenseCategory = true;
    valid = false;
  }

  return valid;
};

// Filtered transactions
const filteredTransactions = computed(() => {
  if (filterType.value === 'ALL') return transactions.value;
  return transactions.value.filter(t => t.type === filterType.value);
});

// Edit logic
const editDialogVisible = ref(false);
const editTransactionData = ref<any>({});

const editTransaction = (tx: Transaction) => {
  editTransactionData.value = {
    ...tx,
    dateObj: new Date(tx.date),
    timeObj: new Date(`${tx.date}T${tx.time}`),
  };
  editDialogVisible.value = true;
};

const updateTransaction = async () => {

  if (!validateEdit()) return; 

  const tx = editTransactionData.value;

  const payload = {
    type: tx.type, // add this
    amount: tx.amount,
    date: `${tx.dateObj.getFullYear()}-${(tx.dateObj.getMonth()+1)
      .toString()
      .padStart(2, '0')}-${tx.dateObj.getDate().toString().padStart(2, '0')}`,
    time: `${tx.timeObj.getHours().toString().padStart(2, '0')}:${tx.timeObj
      .getMinutes()
      .toString()
      .padStart(2, '0')}:00`,
    description: tx.description,
    paymentTypeId: tx.paymentTypeId,
    expenseCategoryId: tx.expenseCategoryId,
  };

  try {
    loading.value = true;
    await HTTPRequest.put(`/api/transactions/${tx.id}`, payload, authStore.token);
    await fetchTransactions();
    editDialogVisible.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};


// Delete logic
const deleteTransaction = async (tx: Transaction) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;
  try {
    await HTTPRequest.delete(`/api/transactions/${tx.id}`, authStore.token);
    transactions.value = transactions.value.filter(t => t.id !== tx.id);
  } catch (err) {
    console.error(err);
  }
};

// Format time
const formatTimeAMPM = (time?: string) => {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return time;
  const hour12 = h % 12 || 12;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

// Fetch everything on mount
onMounted(() => {
  fetchTransactions();
  fetchPaymentTypes();
  fetchExpenseCategories();
});

watch(editDialogVisible, (visible) => {
  if (!visible) {
    showErrors.paymentType = false;
    showErrors.expenseCategory = false;
  }
});

</script>

