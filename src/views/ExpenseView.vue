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
        :value="transactions"
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

const transactions = ref<Transaction[]>([]);

interface Option { id: number; name: string; }

const visible = ref(false);
const datetime24h = ref<Date | null>(null);
const loading = ref(false)
const isTransactionLoading = ref(true);
const authStore = useAuthStore();
const apiBaseUrl: string = import.meta.env.VITE_RESTAPI_URL;

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
  const token = localStorage.getItem("token");
  try {
    loadingOptions.value = true;
    const res = await fetch(`${apiBaseUrl}/api/payment-types`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch payment types");
    paymentTypeOptions.value = await res.json();

  } catch (err) {
    console.error(err);
  } finally {
    loadingOptions.value = false;
  }
};
const fetchTransactions = async () => {
  isTransactionLoading.value = true;
  const { user, token } = authStore;
  try {
     const res = await fetch(`${apiBaseUrl}/api/transactions/user/${user.user_id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to fetch transactions");

    transactions.value = await res.json();
  } finally {
    isTransactionLoading.value = false;
  }
};
const fetchExpenseCategories = async () => {
  const token = localStorage.getItem("token");
  try {
    loadingOptions.value = true;
    const res = await fetch(`${apiBaseUrl}/api/expense-categories`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch expense categories");
    expenseCategoryOptions.value = await res.json();

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

    const res = await fetch(`${apiBaseUrl}/api/transactions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to create transaction");

    const data = await res.json();
    const createdTransaction = data.transaction;

    transactions.value.unshift(createdTransaction);

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

  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
/* Apply uniform dark style to all PrimeVue input components */
.p-inputtext,
.p-inputnumber,
.p-datepicker,
.p-dropdown {
  width: 100%;
  background-color: #1f2937 !important; /* Tailwind gray-800 */
  color: #f9fafb !important;           /* Tailwind gray-50 */
  border: none !important;
  border-radius: 0.25rem !important;
  padding: 0.5rem !important;
  font-size: 0.875rem; /* small text for mobile */
}

/* Remove extra padding/margin inside InputNumber and DatePicker wrapper */
.p-inputnumber .p-inputnumber-input,
.p-datepicker input {
  padding: 0.5rem !important;
  background-color: transparent !important;
  color: inherit;
}

/* Dropdown dark style */
.p-dropdown .p-dropdown-label,
.p-dropdown .p-dropdown-trigger {
  background-color: #1f2937 !important;
  color: #f9fafb !important;
  border: none !important;
  padding: 0.5rem !important;
}

/* Fluid datepicker fix */
.p-datepicker.p-component.p-inputwrapper {
  width: 100% !important;
}

/* Focus effect */
.p-inputtext:focus,
.p-inputnumber:focus,
.p-dropdown:focus,
.p-datepicker:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important; /* Tailwind blue-500 */
}

/* Optional: Reduce dialog padding for mobile */
.p-dialog .p-dialog-content {
  padding: 1rem !important;
}
</style>

