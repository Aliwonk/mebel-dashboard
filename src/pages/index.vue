<script setup lang="ts">
import { onMounted, ref } from "vue";
import { mainPageStore } from "../store";
import { Address, Email, Phone } from "../types";
import { BACKEND_API } from "../constants/API.constant";

const phones = ref<Array<Phone>>([]);
const emails = ref<Array<Email>>([]);
const addresses = ref<Array<Address>>([]);

function addElement(type: "phone" | "email" | "address") {
  mainPageStore.modal.open = true;
  mainPageStore.modal.type = "create";

  switch (type) {
    case "phone":
      mainPageStore.modal.title = "Добавить телефон";
      mainPageStore.modal.data = { type: "phone" };
      break;
    case "email":
      mainPageStore.modal.title = "Добавить почту";
      mainPageStore.modal.data = { type: "email" };
      break;
    case "address":
      mainPageStore.modal.title = "Добавить адрес";
      mainPageStore.modal.data = { type: "address" };
      break;
    default:
      mainPageStore.modal.title = "Добавить данные";
      mainPageStore.modal.data = { type: null };
      break;
  }
}

function selectElement(
  data: Phone | Email | Address,
  type: "phone" | "email" | "address"
) {
  mainPageStore.modal.open = true;
  mainPageStore.modal.type = "edit";

  switch (type) {
    case "phone":
      mainPageStore.modal.title = "Редактировать телефон";
      mainPageStore.modal.data = { type: "phone", ...data };
      break;
    case "email":
      mainPageStore.modal.title = "Редактировать почту";
      mainPageStore.modal.data = { type: "email", ...data };
      break;
    case "address":
      mainPageStore.modal.title = "Редактировать адрес";
      mainPageStore.modal.data = { type: "address", ...data };
      break;
    default:
      mainPageStore.modal.title = "Редактировать данные";
      mainPageStore.modal.data = { type: null, ...data };
      break;
  }
}

function deleteElement(data: Phone | Email | Address) {
  console.log(data);
}

async function loadData(type: "PHONE" | "EMAIL" | "ADDRESS") {
  const response = await fetch(BACKEND_API.STORE[type].GET_ALL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();

  if (response.ok) {
    switch (type) {
      case "PHONE":
        phones.value = result.data;
        break;
      case "EMAIL":
        emails.value = result.data;
        break;
      case "ADDRESS":
        addresses.value = result.data;
        break;
    }
    console.log(result.data);
  }
}

onMounted(async () => {
  await loadData("EMAIL");
  await loadData("PHONE");
  await loadData("ADDRESS");
});
</script>

<template>
  <ModalFormStoreInf />
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
                  />
                </div>
              </template>

              <div
                class="flex items-center justify-between p-3 mb-3 rounded-lg hover:bg-gray-800 transition-colors"
                v-if="phones.length > 0"
                v-for="phone in phones"
                :key="phone.id"
                style="cursor: pointer"
              >
                <div
                  class="flex flex-1 items-center"
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
                />
              </div>
              <p v-else>Данные отсутствуют</p>
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
                  />
                </div>
              </template>

              <div
                class="flex items-center justify-between p-3 mb-3 rounded-lg hover:bg-gray-800 transition-colors"
                v-if="emails.length > 0"
                v-for="email in emails"
                :key="email.id"
                style="cursor: pointer"
              >
                <div
                  class="flex flex-1 items-center"
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
                />
              </div>
              <p v-else>Данные отсутствуют</p>
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
                  />
                </div>
              </template>

              <div
                class="space-y-4"
                v-if="addresses.length > 0"
                v-for="address in addresses"
                :key="address.id"
                style="cursor: pointer"
              >
                <div
                  class="flex items-center justify-between p-4 mb-4 rounded-lg border border-gray-800 hover:bg-gray-800 transition-all"
                >
                  <div
                    class="flex w-full flex-row items-center justify-between space-y-2 gap-10"
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
                  />
                </div>
              </div>
              <p v-else>Данные отсутствуют</p>
            </UCard>
          </div>

          <!-- Дополнительные действия -->
          <!-- <div class="flex flex-wrap gap-3 pt-4 border-t">
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-pencil"
              label="Редактировать информацию"
            />
            <UButton
              color="gray"
              variant="outline"
              icon="i-lucide-share-2"
              label="Поделиться контактами"
            />
            <UButton
              color="gray"
              variant="outline"
              icon="i-lucide-printer"
              label="Распечатать визитку"
            />
          </div> -->
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
