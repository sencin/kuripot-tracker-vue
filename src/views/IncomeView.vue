<template>
  <div class="min-h-screen flex items-center justify-center">
    <!-- Form Container -->
    <div class="relative w-full max-w-md sm:max-w-lg">
      <!-- Income Card -->
      <div
        class="rounded-xl
               space-y-4
               sm:p-4
               bg-gradient-to-br from-primary-700 to-primary-900
               shadow-md sm:shadow-xl"
      >
        <!-- Back Button inside card, top-left -->
        <button
          @click="goBack"
          class="absolute top-3 left-3 flex items-center gap-1
                 text-xs sm:text-sm text-gray-200 hover:text-white"
        >
          <i class="pi pi-arrow-left"></i>
          Back
        </button>

        <p class="text-sm font-semibold text-white text-center sm:text-left mt-6">
          Generate New Income
        </p>

        <InputNumber
          v-model="newTransaction.amount"
          mode="currency"
          placeholder="Amount"
          currency="PHP"
          class="!border-0"
        />

        <!-- Inline Date Picker -->
        <div class="flex justify-center">
          <DatePicker
            v-model="selectedDate"
            inline
            class="w-full sm:w-[18rem]"
          />
        </div>

        <DatePicker
          v-model="selectedTime"
          timeOnly
          hourFormat="12"
          placeholder="Time"
          fluid
        />

        <!-- Payment Method -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-gray-400">Payment Method</label>
            <div class="grid grid-cols-2 gap-2">
              <!-- Existing payment types -->
              <button
                v-for="opt in paymentTypeOptions"
                :key="opt.id"
                type="button"
                @click="newTransaction.paymentTypeId = opt.id"
                class="flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm transition"
                :class="newTransaction.paymentTypeId === opt.id
                  ? 'border-green-400 bg-green-500/10 text-green-300'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400'"
              >
                <i class="pi pi-wallet text-sm" />
                {{ opt.name }}
              </button>

              <!-- Add new payment type button -->
              <button
                type="button"
                @click="showAddPaymentTypeDialog = true"
                class="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white text-sm transition"
              >
                <i class="pi pi-plus text-sm" />
                New
              </button>
            </div>
          </div>

          <!-- Dialog for adding a new Payment Type -->
          <Dialog v-model:visible="showAddPaymentTypeDialog" header="Add Payment Method" modal>
            <div class="flex flex-col gap-3">
              <InputText
                v-model="newPaymentTypeName"
                placeholder="Payment Method Name"
                class="p-inputtext w-full"
              />
              <Button
                label="Add Payment Method"
                icon="pi pi-check"
                :loading="loading"
                class="p-button-success"
                @click="addPaymentType"
                :disabled="loading"
              />
            </div>
          </Dialog>


        <InputText
          v-model="newTransaction.description"
          placeholder="Description"
          class="!border-0"
        />

        <!-- Action -->
        <Button
          label="Save Income"
          icon="pi pi-check"
          :loading="loading"
          class="w-full p-button-success mt-2"
          @click="createTransaction"
        />
      </div>
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
import { useRouter } from 'vue-router'
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useAuthStore } from "@/stores/authenticate";

import { HTTPRequest } from '@/utils/HTTPRequest'

import { useToast } from 'primevue/usetoast';
const toast = useToast();
const router = useRouter()




const goBack = () => {
  router.back() // or router.push({ name: 'Dashboard' }) if you want a specific route
}

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

const showAddPaymentTypeDialog = ref(false);
const newPaymentTypeName = ref("");

const addPaymentType = async () => {
  if (!newPaymentTypeName.value.trim()) return;

  try {
    loading.value = true;
    const payload = { name: newPaymentTypeName.value.trim() };

    // POST to backend to create payment type
    const res = await HTTPRequest.post<Option>('/api/payment-types', payload, authStore.token);

    // Add locally
    paymentTypeOptions.value.push(res.data);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: `Payment Method "${res.data.name}" added`,
      life: 3000,
    });

    // Reset and close dialog
    showAddPaymentTypeDialog.value = false;
    newPaymentTypeName.value = "";
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: (err as Error).message || "Failed to add payment method",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};


const newTransaction = ref({
  type: "INCOME",
  amount: null as number | null, 
  date: "",
  time: "",
  paymentTypeId: 0,
  expenseCategoryId: null,
  description: ""
});

const incomePage = ref(1);
const rowsPerPage = 5;

const totalIncomePages = computed(() =>
  Math.ceil(incomeTransactions.value.length / rowsPerPage)
);

const paginatedIncome = computed(() =>
  incomeTransactions.value.slice(
    (incomePage.value - 1) * rowsPerPage,
    incomePage.value * rowsPerPage
  )
);

function prevIncomePage() {
  if (incomePage.value > 1) incomePage.value--;
}

function nextIncomePage() {
  if (incomePage.value < totalIncomePages.value) incomePage.value++;
}

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
    const res = await HTTPRequest.get<Option[]>('/api/payment-types', authStore.token);
    paymentTypeOptions.value = res.data; 
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
    const res = await HTTPRequest.get<Transaction[]>(url, authStore.token);

    // Reverse to show latest first
    transactions.value = res.data.reverse();
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

    const res = await HTTPRequest.post<CreateExpenseResponse>("/api/transactions", payload, authStore.token,
    );

    transactions.value.unshift(res.data.transaction);

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
    router.push({ name: 'AddTransaction' })

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