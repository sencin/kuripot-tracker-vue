<template>
  <div class="p-2 flex flex-col items-center gap-4">
    <!-- Open Dialog Button -->
       <div class="flex justify-start w-full">
      <Button
        label="Add Expense"
        icon="pi pi-plus"
        @click="visible = true"
        class="p-button-sm p-button-info justify-start w-full sm:w-auto"
      />
    </div>

    <!-- Expense Dialog -->
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
          style="background-image: radial-gradient(circle at left top, var(--p-primary-700), var(--p-primary-900))"
        >
          <!-- Form Fields -->
          <div class="flex flex-col gap-3 text-sm">
            <p>Generate New Expense</p>
            <InputNumber
              v-model="newTransaction.amount"
              mode="currency"
              placeholder="Amount"
              currency="PHP"
              class="!p-0 !h-auto !text-white !border-0"
            />

            <DatePicker
              id="datepicker-24h"
              v-model="datetime24h"
              showTime
              hourFormat="24"
              placeholder="Select Date & Time"
              class="!p-0 !h-auto !text-white !border-0 w-full"
              fluid
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
              class="!p-2  !border-0 !text-white w-full"
            />
          </div>

          <!-- Buttons -->
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

    
      <div v-if="isTransactionLoading" class="text-sm text-gray-400">
        Fetching data from server...
      </div>

    <!-- Transactions Table -->
     <div v-else  class="w-full overflow-x-auto">
      <DataTable
        :value="expenseTransactions"
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        stripedRows
        responsiveLayout="scroll"
        class="min-w-[24rem] sm:min-w-[60rem]"
      >
        <Column field="expenseCategoryName" header="Category" />

        <Column field="amount" header="Amount">
          <template #body="{ data }">
            ₱{{ Number(data.amount).toFixed(2) }}
          </template>
        </Column>

        <Column field="description" header="Description" />

        <Column field="paymentTypeName" header="Payment" />

        <Column field="date" header="Date & Time">
          <template #body="{ data }">
            {{ data.date }} {{ data.time }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useAuthStore } from "@/stores/authenticate";

import { HTTPRequest } from '@/utils/HTTPRequest'

import { useToast } from 'primevue/usetoast';
const toast = useToast();

interface Transaction {
  id: number;
  amount: string;          // backend sends string
  date: string;
  time: string;
  description: string;
  expenseCategoryName: string;
  paymentTypeName: string;
  type: "EXPENSE" | "INCOME";
  year: string;
}

interface CreateExpenseResponse {
  transaction: Transaction
}
const transactions = ref<Transaction[]>([]);

interface Option { id: number; name: string; }

const visible = ref(false);
const datetime24h = ref<Date | null>(null);
const loading = ref(false)
const isTransactionLoading = ref(true);
const authStore = useAuthStore();
const apiBaseUrl: string = import.meta.env.VITE_RESTAPI_URL;

const expenseTransactions = computed(() =>
  transactions.value.filter(t => t.type === "EXPENSE")
);

const newTransaction = ref({
  type: "EXPENSE",
  amount: null as number | null, 
  date: "",
  time: "",
  paymentTypeId: 0,
  expenseCategoryId: 0,
  description: ""
});

const paymentTypeOptions = ref<Option[]>([]);
const expenseCategoryOptions = ref<Option[]>([]);
const loadingOptions = ref(false);


const canFetchTransactions = computed(() => {
  return !!authStore.token && !!authStore.user?.user_id;
});


const fetchPaymentTypes = async () => {
  try {
    loadingOptions.value = true;
    paymentTypeOptions.value = await HTTPRequest.get('/api/payment-types', authStore.token)
  } catch (err) {
    console.error(err);
  } finally {
    loadingOptions.value = false;
  }
};
const fetchTransactions = async () => {
  isTransactionLoading.value = true;
  try {
     const data = await HTTPRequest.get<Transaction[]>(`/api/transactions/user/${authStore.user.user_id}`, authStore.token)
     transactions.value = data.reverse();
  } finally {
    isTransactionLoading.value = false;
  }
};
const fetchExpenseCategories = async () => {
  try {
    loadingOptions.value = true;
    expenseCategoryOptions.value = await HTTPRequest.get('/api/expense-categories', authStore.token)
  } catch (err) {
    console.error(err);
  } finally {
    loadingOptions.value = false;
  }
};



onMounted(() => {
  fetchPaymentTypes();
  fetchExpenseCategories();
});

watch(
  canFetchTransactions,
  (ready) => {
    if (ready) {
      fetchTransactions();
    }
  },
  { immediate: true }
);

const createTransaction = async () => {
  if (!datetime24h.value) return;

  const dt = datetime24h.value;
  newTransaction.value.date = dt.toISOString()?.split("T")[0] ?? "";
  newTransaction.value.time = `${dt.getHours().toString().padStart(2,"0")}:${dt.getMinutes().toString().padStart(2,"0")}:00`;

  const payload = { ...newTransaction.value };
  const token = localStorage.getItem("token");

  try {
    loading.value = true;
    const data = await HTTPRequest.post<CreateExpenseResponse>('/api/transactions', authStore.token, payload)
    const createdTransaction = data.transaction;
    transactions.value.unshift(createdTransaction);

     toast.add({
      severity: "success",
      summary: "Success",
      detail: "Expense Recorded",
      life: 3000
    });

    // Reset form
    newTransaction.value = {
      type: "EXPENSE",
      amount: null,
      date: "",
      time: "",
      paymentTypeId: 0,
      expenseCategoryId: 0,
      description: ""
    };
    datetime24h.value = null;
    visible.value = false;

  } catch (err: unknown) {
    console.error(err);
    
     toast.add({
      severity: "error",
      summary: "Error",
      detail: (err as Error).message || "Failed to create transaction",
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
/* Ensure inputs/buttons take full width on mobile */
.p-inputtext, .p-dropdown, .p-inputnumber, .p-datepicker {
  width: 100%;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  padding: 0.75rem !important;
  background-color: #1f2937 !important;
  color: #f9fafb !important;
  border: none !important;
}

@media (min-width: 640px) {
  .p-inputtext, .p-dropdown, .p-inputnumber, .p-datepicker {
    font-size: 0.875rem;
  }
}
</style>