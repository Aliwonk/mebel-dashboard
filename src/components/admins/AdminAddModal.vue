<script setup lang="ts">
import { ref, reactive } from "vue";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { BACKEND_API } from "../../constants/API.constant";
import { getCookie } from "../../utils";

const formData = ref({
  fecthing: false,
  success: false,
});
const schema = z.object({
  surname: z
    .string({ error: "Поле обязательно для заполнения" })
    .min(2, "Фамиилия слишком короткая"),
  name: z
    .string({ error: "Поле обязательно для заполнения" })
    .min(2, "Имя слишком короткая"),
  password: z
    .string({ error: "Поле обязательно для заполнения" })
    .min(6, "Пароль слишком короткий. Мин. 6 символов"),
  super_admin_password: z
    .string({ error: "Поле обязательно для заполнения" })
    .min(2, "Пароль супер адмнистратора короктая"),
  login: z
    .string({ error: "Поле обязательно для заполнения" })
    .min(6, "Логин слишком короткий. Мин. 6 символов"),
});
const open = ref(false);

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  surname: undefined,
  name: undefined,
  login: undefined,
  password: undefined,
  super_admin_password: undefined,
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  formData.value.fecthing = true;
  const response = await fetch(BACKEND_API.ADMIN.CREATE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getCookie("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
  if (response.ok) {
    formData.value.success = true;
    toast.add({
      title: "Администратор добавлен",
      description: `Новый администратор ${event.data.surname} ${event.data.name} успешно добавлен`,
      color: "success",
    });
  } else {
    const result: { message: string } = await response.json();
    toast.add({
      title: "Произошла ошибка",
      description: `При добавлении произошла ошибка: ${
        result.message || "ошибка"
      }`,
      color: "error",
    });
  }
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Добавить администратора"
    description="Форма добавлнения нового администратора"
  >
    <UButton label="Добавить адмнистратора" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Фамилия" name="surname">
          <UInput
            v-model="state.surname"
            placeholder="Введите фамилию"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Имя" name="name">
          <UInput
            v-model="state.name"
            placeholder="Введите имя"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Логин" name="login">
          <UInput
            v-model="state.login"
            placeholder="Введите логин"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Пароль" name="password">
          <UInput
            v-model="state.password"
            placeholder="Введите пароль"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Пароль супер администратора"
          name="super_admin_password"
        >
          <UInput
            v-model="state.super_admin_password"
            type="password"
            placeholder="Введите пароль супер администратора"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Отмена"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Добавить"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
