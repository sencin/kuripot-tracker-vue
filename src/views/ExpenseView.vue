<template>
  <div class="p-2 flex justify-center">
    <!-- Open Dialog Button -->
    <Button label="Add Expense" icon="pi pi-plus" @click="visible = true" class="p-button-sm p-button-info" />

    <!-- Expense Dialog -->
    <Dialog
      v-model:visible="visible"
      pt:root:class="!border-0 !bg-transparent"
      pt:mask:class="backdrop-blur-sm"
      :modal="true"
      :closable="false"
      :style="{ width: '20rem' }"
    >
      <template #container="{ closeCallback }">
        <div
          class="flex flex-col px-4 py-4 gap-2 rounded-xl"
          style="background-image: radial-gradient(circle at left top, var(--p-primary-700), var(--p-primary-900))"
        >
          <!-- Header Icon -->
          <svg width="30" height="35" viewBox="0 0 35 40" fill="none" class="block mx-auto">
            <path
              d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
              fill="var(--p-primary-200)"
            />
          </svg>

          <!-- Form Fields -->
          <div class="grid gap-2 text-sm">
            <InputNumber
              v-model="newTransaction.amount"
              mode="decimal"
              placeholder="Amount"
              class="!bg-gray-700 !border-0 !text-white !p-2"
            />

            <DatePicker
              id="datepicker-24h"
              v-model="datetime24h"
              showTime
              hourFormat="24"
              placeholder="Select Date & Time"
              class="!bg-gray-700 !border-0 !text-white !p-2"
              fluid
            />

            <Dropdown
              v-model="newTransaction.paymentTypeId"
              :options="paymentTypeOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Payment Type"
              class="!bg-gray-700 !border-0 !text-white !p-2"
            />

            <Dropdown
              v-model="newTransaction.expenseCategoryId"
              :options="expenseCategoryOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Expense Category"
              class="!bg-gray-700 !border-0 !text-white !p-2"
            />

            <InputText
              v-model="newTransaction.description"
              placeholder="Description"
              class="!bg-gray-700 !border-0 !text-white !p-2"
            />
          </div>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-2 mt-2 text-sm">
            <Button label="Cancel" class="!p-2 w-full sm:w-1/2 p-button-secondary" @click="closeCallback" />
            <Button label="Save"  icon="pi pi-sign-in"  :loading="loading" class="p-2 w-full sm:w-1/2 p-button-success" @click="createTransaction" />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";

interface Option { id: number; name: string; }

const visible = ref(false);
const datetime24h = ref<Date | null>(null);
const loading = ref(false)

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


const paymentTypeOptions = ref<Option[]>([
  { id: 1, name: "Cash" },
]);

const expenseCategoryOptions = ref<Option[]>([
  { id: 1, name: "Bills" },
]);

const createTransaction = async () => {
  if (!datetime24h.value) return;
  
  const dt = datetime24h.value;
  newTransaction.value.date = dt.toISOString()?.split("T")[0] ?? "";
  newTransaction.value.time = `${dt.getHours().toString().padStart(2,"0")}:${dt.getMinutes().toString().padStart(2,"0")}:00`;

  const payload = { ...newTransaction.value };
  const token = localStorage.getItem("token");


  try {
    loading.value = true
    const res = await fetch(`${apiBaseUrl}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to create transaction");

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
  }
  finally {
    loading.value = false
  }
};
</script>

<style scoped>
.p-inputtext, .p-dropdown, .p-inputnumber, .p-datepicker {
  width: 100%;
  background-color: #1f2937 !important; /* Tailwind gray-800 */
  color: #f9fafb !important; /* Tailwind gray-50 */
  border-radius: 0.25rem;
  padding: 0.5rem !important;
  border: none !important;
  font-size: 0.875rem;
}
</style>
