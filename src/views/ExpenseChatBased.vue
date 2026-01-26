<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">

    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md">
  
            <!-- Back Button -->
        <button @click="goBack" class="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition">
          <i class="pi pi-arrow-left"></i>
        </button>

         <div class="flex-1 flex justify-center">
            <p class="text-sm font-semibold text-gray-100 text-center">
              Generate New Expense
            </p>
          </div>
          

        <!-- Centered Form Button -->
          <div class="flex items-center">
          <Button
            label="Form"
            size="small"
              :outlined="true"
            @click="goToForm"
          />
        </div>
    </div>


    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
      <div
        v-for="msg in chatMessages"
        :key="msg.id"
        class="max-w-xs sm:max-w-md p-3 rounded-xl break-words shadow-md"
        :class="msg.sender === 'USER'
          ? 'self-end bg-red-500/20 text-red-400'
          : 'self-start bg-gray-700 text-gray-200'"
      >
        <div class="text-sm">{{ msg.text }}</div>
        <div class="text-xs text-gray-400 mt-1 text-right">{{ formatTimeAMPM(msg.timestamp) }}</div>
      </div>
    </div>

    <!-- Input + Category Picker -->
    <div class="flex-shrink-0 border-t border-gray-700 p-3 bg-gray-800">

      <!-- Selected Category Preview -->
      <div v-if="chatCategory" class="text-sm text-red-400 mb-2 text-center font-medium">
        {{ chatCategory.name }} selected
      </div>

      <!-- Category Emoji Scroll -->
      <div class="flex gap-2 overflow-x-auto mb-3 py-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <!-- Existing categories -->
        <button
            v-for="cat in expenseCategoryOptions"
            :key="cat.id"
            @click="chatCategory = cat"
            class="flex flex-col items-center justify-center p-2 rounded-xl text-xs transition border min-w-[50px]"
            :class="chatCategory?.id === cat.id
            ? 'border-red-500 bg-red-500/20 text-red-400'
            : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'"
        >
            <span class="text-xl">{{ '🏷️' }}</span>
            <span class="truncate max-w-full">{{ cat.name }}</span>
        </button>

        <!-- + Button for creating new category -->
        <button
            @click="newCategoryDialogVisible = true"
            class="flex flex-col items-center justify-center p-2 rounded-xl text-xs border border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700 min-w-[50px]"
        >
            <span class="text-xl">+</span>
            <span class="truncate max-w-full">New</span>
        </button>
      </div>

      <!-- Dialog for new category -->
    <Dialog
    v-model:visible="newCategoryDialogVisible"
    header="Create New Expense Category"
    :modal="true"
    :closable="true"
    :style="{ width: '90%', maxWidth: '20rem' }"
    >
    <div class="flex flex-col gap-3">
        <InputText
        v-model="newCategoryName"
        placeholder="Category Name"
        class="!border-0 w-full p-2 rounded-lg bg-gray-800 text-white"
        />
        <InputText
        v-model="newCategoryEmoji"
        placeholder="Emoji (optional)"
        class="!border-0 w-full p-2 rounded-lg bg-gray-800 text-white"
        />
        <div class="flex gap-2 mt-2">
        <Button
            label="Cancel"
            class="w-full p-button-secondary"
            @click="newCategoryDialogVisible = false"
        />
        <Button
            label="Create"
            class="w-full p-button-success"
            :loading="creatingCategory"
            @click="createNewCategory"
        />
        </div>
    </div>
    </Dialog>

      <!-- Chat Input + Send -->
      <div class="flex gap-2 items-center">
        <InputText
          v-model="chatInput"
          placeholder="Enter amount and description (e.g. 250 Starbucks)"
          class="flex-1 p-3 rounded-full bg-gray-900 !border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          @keyup.enter="submitChatExpense"
        />
        <Button
          label="Send"
          icon="pi pi-send"
          class="p-button-danger p-button-rounded"
          :disabled="!chatInput"
          :loading="loading"
          @click="submitChatExpense"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { HTTPRequest } from "@/utils/HTTPRequest";
import { useAuthStore } from "@/stores/authenticate";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import Dialog from 'primevue/dialog';
const router = useRouter();

const toast = useToast();
const authStore = useAuthStore();

interface Option { id: number; name: string; image?: string; }

const expenseCategoryOptions = ref<Option[]>([]);
const chatCategory = ref<Option | null>(null);
const chatMessages = ref<{ id: string; sender: "USER" | "SYSTEM"; text: string; timestamp: number }[]>([]);
const chatInput = ref<string>("");
const loading = ref(false);
const messagesContainer = ref<HTMLDivElement | null>(null);

const goToForm = () => {
  localStorage.setItem('inputMode', 'FORM'); // persist mode
  router.push({ name: 'expenses' }); // route to form-based expense page
};

const goBack =()=>{
  router.push({ name: 'AddTransaction' });
}
// Parse input: "250 Starbucks"
const parseInput = (input: string | undefined) => {
  const trimmed = input?.trim() || "";
  const parts = trimmed.split(" ").filter(p => p.length > 0); 
  if (parts.length === 0) return { amount: null, description: "" };

  const amountStr = parts[0] ?? "";
  const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));

  const description = parts.slice(1).join(" ");
  return { amount: isNaN(amount) ? null : amount, description };
};


// Submit chat
const submitChatExpense = async () => {
  const { amount, description } = parseInput(chatInput.value);

  if (!amount) {
    toast.add({ severity: "error", summary: "Invalid Input", detail: "Enter a valid amount first", life: 3000 });
    return;
  }

  const payload = {
    type: "EXPENSE",
    amount,
    expenseCategoryId: chatCategory.value?.id || null,
    description
  };

  loading.value = true;
  try {
    await HTTPRequest.post("/api/transactions", payload, authStore.token);

    chatMessages.value.push({
      id: crypto.randomUUID(),
      sender: "USER",
      text: chatInput.value,
      timestamp: Date.now(),
    });

    chatMessages.value.push({
      id: crypto.randomUUID(),
      sender: "SYSTEM",
      text: `Recorded ₱${amount} ${description} under ${chatCategory.value?.name || "Uncategorized"}`,
      timestamp: Date.now(),
    });

    nextTick(() => {
      if (messagesContainer.value)
        messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' });
    });

    chatInput.value = "";
    chatCategory.value = null;

  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "Error", detail: (err as Error).message || "Failed to create transaction", life: 3000 });
  } finally {
    loading.value = false;
  }
};

const fetchExpenseCategories = async () => {
  try {
    const res = await HTTPRequest.get<Option[]>("/api/expense-categories", authStore.token);
    expenseCategoryOptions.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchExpenseCategories);

const formatTimeAMPM = (timestamp: number) => {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes();
  const hour12 = h % 12 || 12;
  const period = h >= 12 ? "PM" : "AM";
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};


const newCategoryDialogVisible = ref(false);
const newCategoryName = ref("");
const newCategoryEmoji = ref("");
const creatingCategory = ref(false);

const createNewCategory = async () => {
  if (!newCategoryName.value.trim()) return;

  creatingCategory.value = true;
  try {
    // POST to backend
    const payload = {
      name: newCategoryName.value.trim(),
      image: newCategoryEmoji.value || null
    };
    const res = await HTTPRequest.post<Option>("/api/expense-categories", payload, authStore.token);

    // Add new category to list and select it
    expenseCategoryOptions.value.push(res.data);
    console.log(res.data)
    chatCategory.value = res.data;

    newCategoryDialogVisible.value = false;
    newCategoryName.value = "";
    newCategoryEmoji.value = "";
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: (err as Error).message || "Failed to create category",
      life: 3000
    });
  } finally {
    creatingCategory.value = false;
  }
};

</script>

<style scoped>
/* Scrollbar styling */
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #4b5563; 
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background-color: #1f2937; 
}
</style>
