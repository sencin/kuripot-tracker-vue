<template>
  <div class="p-2 flex flex-col items-center gap-4">
    <!-- Open Dialog Button -->
       <div class="flex justify-start w-full">
      <Button
        label="Add Income"
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
            <p>Generate New Income</p>
            <InputNumber
              v-model="newTransaction.amount"
              mode="currency"
              placeholder="Amount"
              currency="PHP"
              class="!p-0 !h-auto !text-white !border-0"
            />

              <DatePicker
                v-model="selectedDate"
                inputId="income-date"
                showIcon
                placeholder="Date"
                iconDisplay="input"
                fluid
                 class="!p-0 !h-auto !text-black !border-0"
              />
        
              <DatePicker
                v-model="selectedTime"
                inputId="income-time"
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
     <DataTable :value="incomeTransactions" paginator:rows="5" stripedRows responsiveLayout="scroll">

        <Column field="amount" header="Amount">
          <template #body="{ data }">
            ₱{{ Number(data.amount).toFixed(2) }}
          </template>
        </Column>

        <Column field="description" header="Description" />

        <Column field="paymentTypeName" header="Payment" />

        <Column field="date" header="Date & Time">
          <template #body="{ data }">
            {{ data.date }} {{ formatTimeAMPM(data.time) }}
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
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<Date | null>(null);
const loading = ref(false)
const isTransactionLoading = ref(true);
const authStore = useAuthStore();
const apiBaseUrl: string = import.meta.env.VITE_RESTAPI_URL;

const newTransaction = ref({
  type: "INCOME",
  amount: null as number | null, 
  date: "",
  time: "",
  paymentTypeId: 0,
  expenseCategoryId: null,
  description: ""
});

const paymentTypeOptions = ref<Option[]>([]);

const loadingOptions = ref(false);


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

const canFetchTransactions = computed(() => !!authStore.token);

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

const fetchTransactions = async (type?: "INCOME" | "EXPENSE") => {
  isTransactionLoading.value = true;
  try {
    // Construct URL with optional type filter
    let url = '/api/transactions/me';
    if (type) url += `?type=${type}`;

    // Fetch transactions using JWT only
    const data = await HTTPRequest.get<Transaction[]>(url, authStore.token);

    // Reverse to show latest first
    transactions.value = data.reverse();
  } catch (err) {
    console.error(err);
  } finally {
    isTransactionLoading.value = false;
  }
};


const incomeTransactions = computed(() =>
  transactions.value.filter(t => t.type === "INCOME")
);

onMounted(() => {
  fetchPaymentTypes();
});

watch(
  canFetchTransactions,
  (ready) => {
    if (ready) {
      fetchTransactions("INCOME")
    }
  },
  { immediate: true }
);

const createTransaction = async () => {
  if (!selectedDate.value || !selectedTime.value) return;

  const d = selectedDate.value;
  const t = selectedTime.value;

  // DATE — extract using LOCAL time (PH safe)
  newTransaction.value.date =
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // TIME — extract using LOCAL time
  newTransaction.value.time =
    `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:00`;

  const payload = { ...newTransaction.value };

  try {
    loading.value = true;

    const data = await HTTPRequest.post<CreateExpenseResponse>(
      "/api/transactions",
      authStore.token,
      payload
    );

    transactions.value.unshift(data.transaction);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Income Recorded",
      life: 3000
    });

    // Reset
    newTransaction.value = {
      type: "INCOME",
      amount: null,
      date: "",
      time: "",
      paymentTypeId: 0,
      expenseCategoryId: null,
      description: ""
    };

    selectedDate.value = null;
    selectedTime.value = null;
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