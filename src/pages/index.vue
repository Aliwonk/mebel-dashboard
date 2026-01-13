<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { mainPageStore } from "../store";
import { Address, Email, Phone } from "../types";
import { BACKEND_API } from "../constants/API.constant";
import { getCookie } from "../utils";

const phones = ref<Array<Phone>>([]);
const emails = ref<Array<Email>>([]);
const addresses = ref<Array<Address>>([]);
const loading = ref({
  phones: false,
  emails: false,
  addresses: false,
});

// Функция для добавления элемента
function addElement(type: "phone" | "email" | "address") {
  mainPageStore.modal.open = true;
  mainPageStore.modal.type = "create";
  mainPageStore.modal.data = { type };

  switch (type) {
    case "phone":
      mainPageStore.modal.title = "Добавить телефон";
      break;
    case "email":
      mainPageStore.modal.title = "Добавить почту";
      break;
    case "address":
      mainPageStore.modal.title = "Добавить адрес";
      break;
  }
}

// Функция для редактирования элемента
function selectElement(
  data: Phone | Email | Address,
  type: "phone" | "email" | "address"
) {
  mainPageStore.modal.open = true;
  mainPageStore.modal.type = "edit";
  mainPageStore.modal.data = { ...data, type };

  switch (type) {
    case "phone":
      mainPageStore.modal.title = "Редактировать телефон";
      break;
    case "email":
      mainPageStore.modal.title = "Редактировать почту";
      break;
    case "address":
      mainPageStore.modal.title = "Редактировать адрес";
      break;
  }
}

// Функция для удаления элемента
async function deleteElement(
  data: Phone | Email | Address,
  type: "phone" | "email" | "address"
) {
  if (!confirm("Вы уверены, что хотите удалить этот элемент?")) {
    return;
  }

  try {
    let endpoint = "";
    let id = data.id;

    switch (type) {
      case "phone":
        endpoint = `${BACKEND_API.STORE.PHONE.DELETE}/${id}`;
        break;
      case "email":
        endpoint = `${BACKEND_API.STORE.EMAIL.DELETE}/${id}`;
        break;
      case "address":
        endpoint = `${BACKEND_API.STORE.ADDRESS.DELETE}/${id}`;
        break;
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Удаляем элемент из локального массива
      switch (type) {
        case "phone":
          phones.value = phones.value.filter((p) => p.id !== id);
          break;
        case "email":
          emails.value = emails.value.filter((e) => e.id !== id);
          break;
        case "address":
          addresses.value = addresses.value.filter((a) => a.id !== id);
          break;
      }

      // Показываем уведомление об успехе
      showNotification("success", "Элемент успешно удален");
    } else {
      const error = await response.json();
      throw new Error(error.message || "Ошибка при удалении");
    }
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    showNotification(
      "error",
      error instanceof Error ? error.message : "Ошибка при удалении"
    );
  }
}

// Функция для загрузки данных
async function loadData(type: "PHONE" | "EMAIL" | "ADDRESS") {
  try {
    switch (type) {
      case "PHONE":
        loading.value.phones = true;
        break;
      case "EMAIL":
        loading.value.emails = true;
        break;
      case "ADDRESS":
        loading.value.addresses = true;
        break;
    }

    const response = await fetch(BACKEND_API.STORE[type].GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    switch (type) {
      case "PHONE":
        phones.value = result.data || [];
        break;
      case "EMAIL":
        emails.value = result.data || [];
        break;
      case "ADDRESS":
        addresses.value = result.data || [];
        break;
    }
  } catch (error) {
    console.error(`Ошибка при загрузке ${type}:`, error);
    showNotification("error", `Ошибка при загрузке данных`);
  } finally {
    switch (type) {
      case "PHONE":
        loading.value.phones = false;
        break;
      case "EMAIL":
        loading.value.emails = false;
        break;
      case "ADDRESS":
        loading.value.addresses = false;
        break;
    }
  }
}

// Функция для показа уведомлений
function showNotification(type: "success" | "error", message: string) {
  // Здесь можно использовать ваш UI компонент для уведомлений
  // Например, если используется Nuxt UI:
  // useToast().add({ title: message, color: type === 'success' ? 'green' : 'red' })

  // Временно используем alert
  alert(message);
}

// Обработчик события после сохранения из модального окна
function handleSaved(type: "phone" | "email" | "address") {
  switch (type) {
    case "phone":
      loadData("PHONE");
      break;
    case "email":
      loadData("EMAIL");
      break;
    case "address":
      loadData("ADDRESS");
      break;
  }
}

onMounted(async () => {
  await Promise.all([
    loadData("EMAIL"),
    loadData("PHONE"),
    loadData("ADDRESS"),
  ]);
});
</script>

<template>
  <ModalFormStoreInf @saved="handleSaved" />
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Главная" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        variant="soft"
        :ui="{
          container: 'gap-y-1.5',
          wrapper: 'items-start',
          leading:
            'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25',
          title: 'font-normal text-muted text-xs uppercase',
        }"
        class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <div class="caption">
              <span class="text-2xl font-semibold text-highlighted">
                Мебель Модно Стильно
              </span>
            </div>
          </div>

          <!-- Контактная информация в карточках -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Телефоны -->
            <UCard class="hover:shadow-lg transition-shadow duration-300">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-phone" class="w-5 h-5 text-primary" />
                    <h3 class="text-lg font-semibold">Телефоны</h3>
                  </div>
                  <UButton
                    color="primary"
                    icon="i-lucide-circle-plus"
                    variant="ghost"
                    size="xs"
                    label="Добавить"
                    style="cursor: pointer"
                    :ui="{ icon: 'w-4 h-4' }"
                    @click="addElement('phone')"
                    :loading="loading.phones"
                  />
                </div>
              </template>

              <div v-if="loading.phones" class="text-center py-4">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-6 h-6 animate-spin mx-auto"
                />
              </div>

              <div
                class="flex items-center justify-between p-3 mb-3 rounded-lg hover:bg-gray-800 transition-colors"
                v-else-if="phones.length > 0"
                v-for="phone in phones"
                :key="phone.id"
              >
                <div
                  class="flex flex-1 items-center"
                  style="cursor: pointer"
                  @click="selectElement(phone, 'phone')"
                >
                  <div class="flex w-full items-center gap-3">
                    <div class="relative">
                      <div
                        class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <UIcon
                          name="i-lucide-phone"
                          class="w-5 h-5 text-primary"
                        />
                        <span
                          v-if="phone.isMain"
                          class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        />
                      </div>
                    </div>
                    <div>
                      <p class="font-medium">{{ phone.phone }}</p>
                      <p class="text-xs text-gray-500">{{ phone.name }}</p>
                    </div>
                  </div>
                </div>
                <UButton
                  color="error"
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  size="xs"
                  :ui="{
                    icon: 'w-4 h-4',
                    rounded: 'rounded-full',
                  }"
                  style="cursor: pointer"
                  @click="deleteElement(phone, 'phone')"
                  :loading="loading.phones"
                />
              </div>
              <p v-else-if="!loading.phones">Данные отсутствуют</p>
            </UCard>

            <!-- Электронная почта -->
            <UCard class="hover:shadow-lg transition-shadow duration-300">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-mail" class="w-5 h-5 text-primary" />
                    <h3 class="text-lg font-semibold">Электронная почта</h3>
                  </div>
                  <UButton
                    color="primary"
                    icon="i-lucide-circle-plus"
                    variant="ghost"
                    size="xs"
                    label="Добавить"
                    style="cursor: pointer"
                    :ui="{ icon: 'w-4 h-4' }"
                    @click="addElement('email')"
                    :loading="loading.emails"
                  />
                </div>
              </template>

              <div v-if="loading.emails" class="text-center py-4">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-6 h-6 animate-spin mx-auto"
                />
              </div>

              <div
                class="flex items-center justify-between p-3 mb-3 rounded-lg hover:bg-gray-800 transition-colors"
                v-else-if="emails.length > 0"
                v-for="email in emails"
                :key="email.id"
              >
                <div
                  class="flex flex-1 items-center"
                  style="cursor: pointer"
                  @click="selectElement(email, 'email')"
                >
                  <div class="flex w-full items-center gap-3">
                    <div class="relative">
                      <div
                        class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                      >
                        <UIcon
                          name="i-lucide-mail"
                          class="w-5 h-5 text-blue-600"
                        />
                        <span
                          v-if="email.isMain"
                          class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        />
                      </div>
                    </div>
                    <div>
                      <p class="font-medium">{{ email.email }}</p>
                      <p class="text-xs text-gray-500">{{ email.name }}</p>
                    </div>
                  </div>
                </div>
                <UButton
                  color="error"
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  size="xs"
                  :ui="{
                    icon: 'w-4 h-4',
                    rounded: 'rounded-full',
                  }"
                  style="cursor: pointer"
                  @click="deleteElement(email, 'email')"
                  :loading="loading.emails"
                />
              </div>
              <p v-else-if="!loading.emails">Данные отсутствуют</p>
            </UCard>

            <!-- Адреса -->
            <UCard class="hover:shadow-lg transition-shadow duration-300">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-map-pin"
                      class="w-5 h-5 text-primary"
                    />
                    <h3 class="text-lg font-semibold">Адреса</h3>
                  </div>
                  <UButton
                    color="primary"
                    icon="i-lucide-circle-plus"
                    variant="ghost"
                    size="xs"
                    label="Добавить"
                    style="cursor: pointer"
                    :ui="{ icon: 'w-4 h-4' }"
                    @click="addElement('address')"
                    :loading="loading.addresses"
                  />
                </div>
              </template>

              <div v-if="loading.addresses" class="text-center py-4">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-6 h-6 animate-spin mx-auto"
                />
              </div>

              <div class="space-y-4" v-else-if="addresses.length > 0">
                <div
                  class="flex items-center justify-between p-4 mb-4 rounded-lg border border-gray-800 hover:bg-gray-800 transition-all"
                  v-for="address in addresses"
                  :key="address.id"
                >
                  <div
                    class="flex w-full flex-row items-center justify-between space-y-2 gap-10"
                    style="cursor: pointer"
                    @click="selectElement(address, 'address')"
                  >
                    <div class="address-body">
                      <div class="flex items-start gap-2 mb-1">
                        <UIcon
                          name="i-lucide-map-pin"
                          class="w-4 h-4 text-gray-400 mt-0.5"
                        />
                        <div>
                          <p class="font-medium">{{ address.address }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 text-sm">
                        <UIcon
                          name="i-lucide-clock"
                          class="w-4 h-4 text-gray-400"
                        />
                        <span class="text-gray-600">{{ address.hours }}</span>
                      </div>
                    </div>
                  </div>
                  <UButton
                    color="error"
                    icon="i-lucide-trash-2"
                    variant="ghost"
                    size="xs"
                    :ui="{
                      icon: 'w-4 h-4',
                      rounded: 'rounded-full',
                    }"
                    style="cursor: pointer"
                    @click="deleteElement(address, 'address')"
                    :loading="loading.addresses"
                  />
                </div>
              </div>
              <p v-else-if="!loading.addresses">Данные отсутствуют</p>
            </UCard>
          </div>
        </div>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.hover\:z-1:hover {
  z-index: 1;
}

.pl-13 {
  padding-left: 3.25rem; /* 13 * 0.25rem */
}
</style>
