<template>
  <div
    class="min-h-screen flex items-center justify-center sm:px-6 lg:px-8 p-4"
  >
    <!-- Form Container -->
    <div class="w-full max-w-md sm:max-w-lg">
      
      <!-- Expense Card -->
      <div class="relative rounded-xl space-y-4 sm:p-6  shadow-md sm:shadow-xl">

        <!-- Back Button -->
        <button
          @click="goBack"
          class="absolute top-3 left-3 flex items-center gap-1
                 text-xs sm:text-sm text-gray-200 hover:text-white z-10"
        >
          <i class="pi pi-arrow-left"></i>
          Back
        </button>

        <!-- Card Content with top padding so button doesn't overlap -->
        <div class="pt-6 space-y-4">
          <p class="text-sm font-semibold text-gray-100 text-center sm:text-left">
            Generate New Expense
          </p>

          <!-- Amount -->
          <InputNumber
            v-model="newTransaction.amount"
            mode="currency"
            placeholder="Amount"
            currency="PHP"
            class="!border-0"
          />

          <!-- Inline Date -->
          <div class="flex justify-center">
            <DatePicker
              v-model="selectedDate"
              inline
              class="w-full sm:w-[18rem]"
            />
          </div>

          <!-- Time -->
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
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500'"
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
                class="p-button-success"
                @click="addPaymentType"
                :disabled="!newPaymentTypeName"
              />
            </div>
          </Dialog>


          <!-- Expense Category -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-gray-400">Expense Category</label>
            <div class="grid grid-cols-2 gap-2">
              <!-- Existing categories -->
              <button
                v-for="cat in expenseCategoryOptions"
                :key="cat.id"
                type="button"
                @click="newTransaction.expenseCategoryId = cat.id"
                class="flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm transition"
                :class="newTransaction.expenseCategoryId === cat.id
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500'"
              >
                <i class="pi pi-tag text-sm" />
                {{ cat.name }}
              </button>

              <!-- Add new category button -->
              <button
                type="button"
                @click="showAddCategoryDialog = true"
                class="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white text-sm transition"
              >
                <i class="pi pi-plus text-sm" />
                New
              </button>
            </div>
          </div>

          <!-- Dialog for adding a new category -->
          <Dialog v-model:visible="showAddCategoryDialog" header="Add Expense Category" modal>
            <div class="flex flex-col gap-3">
              <InputText
                v-model="newCategoryName"
                placeholder="Category Name"
                class="p-inputtext w-full"
              />
              <Button
                label="Add Category"
                icon="pi pi-check"
                :loading="loading"
                class="p-button-success"
                @click="addExpenseCategory"
                :disabled="loading"
              />
            </div>
          </Dialog>


          <!-- Description -->
          <InputText
            v-model="newTransaction.description"
            placeholder="Description"
            class="!border-0"
          />

          <!-- Action -->
          <Button
            label="Save Expense"
            icon="pi pi-check"
            :loading="loading"
            class="w-full p-button-danger mt-2"
            @click="createTransaction"
            :disabled="loading"
          />
        </div>
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

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useAuthStore } from "@/stores/authenticate";

import { HTTPRequest } from '@/utils/HTTPRequest'

import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router'

const router = useRouter()


const toast = useToast();


const goBack = () => router.back()

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


const showAddCategoryDialog = ref(false);
const newCategoryName = ref("");
const newCategoryImage = ref("");

const showAddPaymentTypeDialog = ref(false);
const newPaymentTypeName = ref("");

const addExpenseCategory = async () => {
  if (!newCategoryName.value.trim()) return;

  try {
    loading.value = true;
    const payload = {
      name: newCategoryName.value.trim(),
      image: newCategoryImage.value?.trim() || null,
    };

    // Call backend to create category
    const res = await HTTPRequest.post<Option>('/api/expense-categories', payload, authStore.token);

    // Add new category locally
    expenseCategoryOptions.value.push(res.data);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: `Category "${res.data.name}" added`,
      life: 3000,
    });

    // Close dialog and reset
    showAddCategoryDialog.value = false;
    newCategoryName.value = "";
    newCategoryImage.value = "";
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: (err as Error).message || "Failed to add category",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

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

const expenseTransactions = computed(() =>
  transactions.value.filter(t => t.type === "EXPENSE")
);



const currentPage = ref(1);
const rowsPerPage = 5;

const totalPages = computed(() =>
  Math.ceil(expenseTransactions.value.length / rowsPerPage)
);

const paginatedTransactions = computed(() =>
  expenseTransactions.value.slice(
    (currentPage.value - 1) * rowsPerPage,
    currentPage.value * rowsPerPage
  )
);

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

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


const fetchExpenseCategories = async () => {
  try {
    loadingOptions.value = true;
    const res = await HTTPRequest.get<Option[]>('/api/expense-categories', authStore.token);
    expenseCategoryOptions.value =res.data; 
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
      fetchTransactions("EXPENSE")
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

    const res = await HTTPRequest.post<CreateExpenseResponse>("/api/transactions", payload, authStore.token);

    transactions.value.unshift(res.data.transaction);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Expense Recorded",
      life: 3000
    });

    // Reset
    newTransaction.value = {
      type: "EXPENSE",
      amount: null,
      date: "",
      time: "",
      paymentTypeId: 0,
      expenseCategoryId: 0,
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