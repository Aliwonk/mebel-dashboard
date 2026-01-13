<script setup lang="ts">
import { ref, watch, computed, reactive } from "vue";
import { mainPageStore } from "../../store";
import { BACKEND_API } from "../../constants/API.constant";
import { getCookie } from "../../utils";

const emit = defineEmits<{
  (event: "saved", type: "phone" | "email" | "address"): void;
}>();

const formData = ref<any>(null);
const isSubmitting = ref(false);
const validationErrors = reactive<Record<string, string>>({});

// Правила валидации
const validationRules = {
  phone: {
    phone: (value: string) => {
      if (!value) return "Номер телефона обязателен";
      const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}[-]?\d{2}[-]?\d{2}$/;
      if (!phoneRegex.test(value))
        return "Введите корректный номер телефона (+7 XXX XXX-XX-XX)";
      return true;
    },
    name: (value: string) => {
      if (!value) return "Название обязательно";
      if (value.length > 50) return "Название не должно превышать 50 символов";
      return true;
    },
  },
  email: {
    email: (value: string) => {
      if (!value) return "Email обязателен";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Введите корректный email";
      return true;
    },
    name: (value: string) => {
      if (!value) return "Название обязательно";
      if (value.length > 50) return "Название не должно превышать 50 символов";
      return true;
    },
  },
  address: {
    address: (value: string) => {
      if (!value) return "Адрес обязателен";
      if (value.length > 200) return "Адрес не должен превышать 200 символов";
      return true;
    },
    hours: (value: string) => {
      if (!value) return "Часы работы обязательны";
      if (value.length > 100)
        return "Часы работы не должны превышать 100 символов";
      return true;
    },
  },
};

// Следим за открытием модального окна
watch(
  () => mainPageStore.modal.open,
  (value) => {
    if (value && mainPageStore.modal.data) {
      // Сбрасываем ошибки
      Object.keys(validationErrors).forEach(
        (key) => delete validationErrors[key]
      );

      if (mainPageStore.modal.type === "create") {
        const defaults = {
          phone: { phone: "", name: "Главный", isMain: false },
          email: { email: "", name: "Главный", isMain: false },
          address: { address: "", hours: "Пн-Пт: 9:00-18:00", isMain: false },
        };

        formData.value = {
          ...defaults[mainPageStore.modal.data.type as keyof typeof defaults],
          type: mainPageStore.modal.data.type,
        };
      } else {
        formData.value = { ...mainPageStore.modal.data };
        // Форматируем телефон для отображения
        if (mainPageStore.modal.data.type === "phone" && formData.value.phone) {
          formData.value.phone = formatPhoneNumber(formData.value.phone);
        }
      }
    } else {
      formData.value = null;
    }
  }
);

// Проверка валидации
function validate() {
  if (!formData.value || !formData.value.type) return false;

  const type = formData.value.type as keyof typeof validationRules;
  const rules = validationRules[type];
  let isValid = true;

  Object.keys(rules).forEach((key) => {
    const result = rules[key](formData.value[key]);
    if (typeof result === "string") {
      validationErrors[key] = result;
      isValid = false;
    } else {
      delete validationErrors[key];
    }
  });

  return isValid;
}

// Проверяем, есть ли ошибки
const hasErrors = computed(() => {
  return Object.keys(validationErrors).length > 0;
});

// Форматирование номера телефона
function formatPhoneNumber(value: string) {
  let numbers = value.replace(/\D/g, "");

  if (numbers.length > 11) {
    numbers = numbers.substring(0, 11);
  }

  if (numbers.length >= 1 && numbers[0] !== "7") {
    numbers = "7" + numbers.substring(1);
  }

  if (numbers.length === 11) {
    return `+7 ${numbers.substring(1, 4)} ${numbers.substring(
      4,
      7
    )}-${numbers.substring(7, 9)}-${numbers.substring(9, 11)}`;
  }

  return numbers;
}

// Обработчик ввода телефона
function handlePhoneInput(value: string) {
  formData.value.phone = formatPhoneNumber(value);
  // Сбрасываем ошибку для этого поля
  if (validationErrors.phone) {
    delete validationErrors.phone;
  }
}

// Сохранение данных
async function save() {
  if (isSubmitting.value || hasErrors.value) return;

  if (!validate()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const type = formData.value.type;
    const isCreate = mainPageStore.modal.type === "create";

    // Подготавливаем данные для отправки
    const payload = { ...formData.value };
    delete payload.type;

    // Для телефона убираем форматирование перед отправкой
    if (type === "phone" && payload.phone) {
      payload.phone = payload.phone.replace(/\D/g, "");
    }

    let endpoint = "";
    let method = "";
    let headers = {
      Authorization: `Bearer ${getCookie("token")}`,
      "Content-Type": "application/json",
    };

    switch (type) {
      case "phone":
        endpoint = isCreate
          ? BACKEND_API.STORE.PHONE.CREATE
          : `${BACKEND_API.STORE.PHONE.UPDATE}/${formData.value.id}`;
        break;
      case "email":
        endpoint = isCreate
          ? BACKEND_API.STORE.EMAIL.CREATE
          : `${BACKEND_API.STORE.EMAIL.UPDATE}/${formData.value.id}`;
        break;
      case "address":
        endpoint = isCreate
          ? BACKEND_API.STORE.ADDRESS.CREATE
          : `${BACKEND_API.STORE.ADDRESS.UPDATE}/${formData.value.id}`;
        break;
    }

    method = isCreate ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ошибка при сохранении");
    }

    // Закрываем модальное окно
    mainPageStore.modal.open = false;

    // Отправляем событие об успешном сохранении
    emit("saved", type);

    // Показываем уведомление об успехе
    showNotification(
      "success",
      isCreate ? "Элемент успешно создан" : "Элемент успешно обновлен"
    );
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    showNotification(
      "error",
      error instanceof Error ? error.message : "Ошибка при сохранении"
    );
  } finally {
    isSubmitting.value = false;
  }
}

// Закрытие модального окна
function cancel() {
  mainPageStore.modal.open = false;
}

// Показ уведомления
function showNotification(type: "success" | "error", message: string) {
  // Здесь можно использовать ваш UI компонент для уведомлений
  alert(message); // Временное решение
}
</script>

<template>
  <UModal
    v-model:open="mainPageStore.modal.open"
    :title="mainPageStore.modal.title ?? 'Форма'"
    :modal="true"
    :ui="{ width: 'sm:max-w-md' }"
    @close="cancel"
  >
    <template #body>
      <div class="form space-y-6 p-1">
        <!-- Форма для телефона -->
        <div v-if="formData?.type === 'phone'" class="space-y-4">
          <UFormField
            label="Номер телефона"
            :error="validationErrors.phone"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.phone"
              @update:model-value="handlePhoneInput"
              placeholder="+7 XXX XXX-XX-XX"
              icon="i-lucide-phone"
              autofocus
              class="w-full"
              :ui="{
                icon: validationErrors.phone ? 'text-red-500' : 'text-gray-400',
              }"
            >
            </UInput>
          </UFormField>

          <UFormField
            label="Название телефона"
            :error="validationErrors.name"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.name"
              placeholder="Введите название, например, офис и т.д"
              :ui="{
                icon: validationErrors.name ? 'text-red-500' : 'text-gray-400',
              }"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Показывать в меню сайта клиента">
            <USwitch v-model="formData.isMain" />
          </UFormField>
        </div>

        <!-- Форма для email -->
        <div v-else-if="formData?.type === 'email'" class="space-y-4">
          <UFormField
            label="Email адрес"
            :error="validationErrors.email"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="example@domain.com"
              icon="i-lucide-mail"
              autofocus
              class="w-full"
              :ui="{
                icon: validationErrors.email ? 'text-red-500' : 'text-gray-400',
              }"
            />
          </UFormField>

          <UFormField
            label="Название email"
            :error="validationErrors.name"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.name"
              placeholder="Введите название, например, офис и т.д"
              :ui="{
                icon: validationErrors.name ? 'text-red-500' : 'text-gray-400',
              }"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Показывать в меню сайта клиента">
            <USwitch v-model="formData.isMain" />
          </UFormField>
        </div>

        <!-- Форма для адреса -->
        <div v-else-if="formData?.type === 'address'" class="space-y-4">
          <UFormField
            label="Адрес"
            :error="validationErrors.address"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UTextarea
              v-model="formData.address"
              placeholder="ул. Примерная, д. 10, офис 25"
              :rows="3"
              icon="i-lucide-map-pin"
              autofocus
              class="w-full"
              :ui="{
                icon: validationErrors.address
                  ? 'text-red-500'
                  : 'text-gray-400',
              }"
            />
          </UFormField>

          <UFormField
            label="Часы работы"
            :error="validationErrors.hours"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.hours"
              placeholder="Пн-Пт: 9:00-18:00"
              icon="i-lucide-clock"
              class="w-full"
              :ui="{
                icon: validationErrors.hours ? 'text-red-500' : 'text-gray-400',
              }"
            />
            <template #help>
              <p class="text-xs text-gray-500 mt-1">
                Примеры: "Пн-Пт: 9:00-18:00", "Ежедневно: 10:00-22:00"
              </p>
            </template>
          </UFormField>

          <UFormField label="Показывать в меню сайта клиента">
            <USwitch v-model="formData.isMain" />
          </UFormField>
        </div>

        <!-- Сообщение об ошибке типа -->
        <div v-else class="text-center py-8">
          <UIcon
            name="i-lucide-alert-circle"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500">Неизвестный тип данных</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div></div>

        <div class="flex gap-3">
          <UButton variant="outline" :disabled="isSubmitting" @click="cancel">
            Отмена
          </UButton>
          <UButton
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting || hasErrors"
            @click="save"
          >
            {{
              mainPageStore.modal.type === "create" ? "Добавить" : "Сохранить"
            }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.form :deep(.ui-input) input:focus,
.form :deep(.ui-textarea) textarea:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
}
</style>
