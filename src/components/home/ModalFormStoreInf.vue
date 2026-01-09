<script setup lang="ts">
import { ref, watch, computed, reactive } from "vue";
import { mainPageStore } from "../../store";

const formData = ref<any>(null);
const isSubmitting = ref(false);

// Правила валидации для разных типов
const validationRules = {
  phone: {
    phone: (value: string) => {
      if (!value) return "Номер телефона обязателен";
      return true;
    },
    name: (value: string) => {
      if (!value) return "Название обязательно";
      return true;
    },
  },
  email: {
    email: (value: string) => {
      if (!value) return "Email обязателен";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Введите корректный email";
      return true;
    },
    name: (value: string) => {
      if (!value) return "Название обязательно";
      return true;
    },
  },
  address: {
    address: (value: string) => {
      if (!value) return "Адрес обязателен";
      return true;
    },
    hours: (value: string) => {
      if (!value) return "Часы работы обязательны";
      return true;
    },
  },
};

// Следим за открытием модального окна
watch(
  () => mainPageStore.modal.open,
  (value) => {
    if (value && mainPageStore.modal.data) {
      // Копируем данные, чтобы не мутировать оригинал
      formData.value = { ...mainPageStore.modal.data };
      // Если создание нового, добавляем пустые значения
      if (mainPageStore.modal.type === "create") {
        const defaults = {
          phone: { phone: "", name: "Главный" },
          email: { email: "", name: "Главный" },
          address: { address: "", hours: "" },
        };

        formData.value = {
          ...defaults[formData.value.type as keyof typeof defaults],
          type: formData.value.type,
        };
      } else {
        if (mainPageStore.modal.data.type === "phone") {
          formData.value.phone = formatPhoneNumber(
            mainPageStore.modal.data.phone
          );
        }
      }
    }
  }
);

// Вычисляем, есть ли ошибки валидации
const validationErrors = computed(() => {
  if (!formData.value || !formData.value.type) return {};

  const rules =
    validationRules[formData.value.type as keyof typeof validationRules];
  const errors: Record<string, string> = {};

  if (!rules) return errors;

  Object.keys(rules).forEach((key) => {
    if (formData.value[key]) {
      const result = rules[key](formData.value[key]);
      if (typeof result === "string") {
        errors[key] = result;
      }
    }
  });

  return errors;
});

// Форматируем номер телефона
function formatPhoneNumber(value: string) {
  // Удаляем все нецифровые символы
  let numbers = value.replace(/\D/g, "");

  // Ограничиваем длину
  if (numbers.length > 11) {
    numbers = numbers.substring(0, 11);
  }

  // Форматируем по шаблону +7 (XXX) XXX-XX-XX
  if (numbers.length === 11) {
    return `+7 ${numbers.substring(1, 4)} ${numbers.substring(
      4,
      7
    )}-${numbers.substring(7, 9)}-${numbers.substring(9, 11)}`;
  }

  return numbers;
}

// Обработчик изменения номера телефона
function handlePhoneInput(value: string) {
  formData.value.phone = formatPhoneNumber(value);
}

// Сохраняем изменения
function save() {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
}

// Закрываем модальное окно
function cancel() {
  mainPageStore.modal.open = false;
}
</script>

<template>
  <UModal
    v-model:open="mainPageStore.modal.open"
    :title="mainPageStore.modal.title ?? 'Форма'"
    :modal="true"
    :ui="{ width: 'sm:max-w-md' }"
  >
    <template #body>
      <div class="form space-y-6 p-1">
        <!-- Форма для телефона -->
        <div v-if="formData?.type === 'phone'" class="space-y-4">
          <UFormField
            label="Номер телефона"
            :error="validationErrors.number"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.phone"
              @update:model-value="handlePhoneInput"
              placeholder="Введите номер телефона"
              icon="i-lucide-phone"
              autofocus
              class="w-full"
            >
            </UInput>
          </UFormField>

          <UFormField
            label="Название телефона"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.name"
              placeholder="Введите название, например, офис и т.д"
              :ui="{
                icon: 'text-gray-400',
              }"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="
              mainPageStore.modal.data.isMain ||
              mainPageStore.modal.type === 'create'
            "
            label="Показывать в меню сайта клиента"
          >
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
            />
          </UFormField>

          <UFormField
            label="Название email"
            :ui="{ label: 'font-medium text-sm' }"
          >
            <UInput
              v-model="formData.name"
              placeholder="Введите название, например, офис и т.д"
              :ui="{
                icon: 'text-gray-400',
              }"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="
              mainPageStore.modal.data.isMain ||
              mainPageStore.modal.type === 'create'
            "
            label="Показывать в меню сайта клиента"
          >
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
            />
            <template #help>
              <p class="text-xs text-gray-500 mt-1">
                Примеры: "Пн-Пт: 9:00-18:00", "Ежедневно: 10:00-22:00"
              </p>
            </template>
          </UFormField>

          <!-- Дополнительные поля (можно раскрыть по необходимости) -->
          <!-- <div class="border-t pt-4">
            <UButton
              variant="ghost"
              color="gray"
              size="xs"
              icon="i-lucide-plus"
              label="Добавить дополнительные параметры"
            />
          </div> -->
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
            :disabled="isSubmitting"
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
