<script setup lang="ts">
import { ref } from "vue";
import { setCookie } from "../utils";
import { authStore } from "../store";
import { BACKEND_API } from "../constants/API.constant";

const toast = useToast();
const formData = ref({
  login: "",
  password: "",
});

async function handleSubmit() {
  const response: Response = await fetch(BACKEND_API.ADMIN.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData.value),
  });
  const data = await response.json();
  if (!response.ok) {
    toast.add({
      title: "Ошибка входа",
      color: "error",
      description: data.message || "Не удалось войти в систему.",
      type: "background",
    });
    return;
  }
  setCookie("token", data.token, { maxAge: data.expires });
  authStore.isAuthenticated = true;
}
</script>

<template>
  <UMain class="flex items-center justify-center">
    <div class="w-full flex flex-col items-center justify-center gap-4 p-4">
      <UPageCard class="w-full max-w-md" title="Вход в систему">
        <UForm class="flex flex-col gap-4">
          <UFormField name="login" label="Логин">
            <UInput
              v-model="formData.login"
              placeholder="Введите логин"
              class="w-full"
            />
          </UFormField>

          <UFormField name="password" label="Пароль">
            <UInput
              v-model="formData.password"
              type="password"
              placeholder="Введите пароль"
              class="w-full"
            />
          </UFormField>

          <UButton
            label="Войти"
            class="w-fit"
            type="submit"
            @click="handleSubmit"
          />
        </UForm>
      </UPageCard>
    </div>
  </UMain>
</template>
