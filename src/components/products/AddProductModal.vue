<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import z from "zod";
import { getCookie } from "../../utils";

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

// Схема валидации
const schema = z.object({
  name: z
    .string({
      error: "Поле обязательно для заполнения",
    })
    .min(2, "Название слишком короткое"),
  price: z
    .number({
      error: "Поле обязательно для заполнения",
    })
    .positive("Цена должна быть положительной"),
  description: z.string().optional(),
  catalog_id: z
    .number({
      error: "Поле обязательно для заполнения",
    })
    .int("ID каталога должен быть целым числом")
    .positive("ID каталога должен быть положительным")
    .optional(),
  category_id: z
    .number({
      error: "Поле обязательно для заполнения",
    })
    .int("ID категории должен быть целым числом")
    .positive("ID категории должен быть положительным")
    .optional(),
  manufacturer_id: z
    .number({
      error: "Поле обязательно для заполнения",
    })
    .int("ID производителя должен быть целым числом")
    .positive("ID производителя должен быть положительным")
    .optional(),
  telegram_notification: z.boolean().optional(),
  dimensions: z.object({
    lenght: z // Исправлено на lenght (согласно примеру сервера)
      .number({
        error: "Поле обязательно для заполнения",
      })
      .nonnegative("Длина не может быть отрицательной")
      .default(0),
    width: z
      .number({
        error: "Поле обязательно для заполнения",
      })
      .nonnegative("Ширина не может быть отрицательной")
      .default(0),
    height: z
      .number({
        error: "Поле обязательно для заполнения",
      })
      .nonnegative("Высота не может быть отрицательной")
      .default(0),
    depth: z
      .number({
        error: "Поле обязательно для заполнения",
      })
      .nonnegative("Глубина не может быть отрицательной")
      .default(0),
    weight: z
      .number({
        error: "Поле обязательно для заполнения",
      })
      .nonnegative("Вес не может быть отрицательной")
      .default(0),
  }),
  catalog: z
    .object({
      name: z.string().min(1, "Название каталога обязательно"),
    })
    .optional(),
  category: z
    .object({
      name: z.string().min(1, "Название категории обязательно"),
    })
    .optional(),
  manufacturer: z
    .object({
      name: z.string().min(1, "Название производителя обязательно"),
    })
    .optional(),
});

type Schema = z.output<typeof schema>;

type FormData = {
  name?: string;
  price: number;
  description?: string;
  telegram_notification?: boolean;
  dimensions: {
    lenght: number;
    width: number;
    height: number;
    depth: number;
  };
  catalog?: { name: string };
  catalog_id?: number;
  category?: { name: string };
  category_id?: number;
  manufacturer?: { name: string };
  manufacturer_id?: number;
};

// Инициализация состояния
const state = reactive<Partial<Schema>>({
  name: undefined,
  price: undefined,
  description: undefined,
  catalog_id: undefined,
  category_id: undefined,
  manufacturer_id: undefined,
  telegram_notification: false,
  dimensions: {
    lenght: 0,
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
  },
  catalog: undefined,
  category: undefined,
  manufacturer: undefined,
});

// Для загрузки данных выпадающих списков
const catalog = ref<{
  id: number | undefined;
  name: string | undefined;
  new: boolean;
}>({
  id: undefined,
  name: undefined,
  new: false,
});

const category = ref<{
  id: number | undefined;
  name: string | undefined;
  new: boolean;
}>({
  id: undefined,
  name: undefined,
  new: false,
});

const manufacturer = ref<{
  id: number | undefined;
  name: string | undefined;
  new: boolean;
}>({
  id: undefined,
  name: undefined,
  new: false,
});

const categories = ref<Array<{ id: number; name: string }>>([]);
const manufacturers = ref<Array<{ id: number; name: string }>>([]);
const catalogs = ref<Array<{ id: number; name: string }>>([]);
const loading = ref(false);
const images = ref<File[]>([]); // Для хранения выбранных изображений

// Загрузка данных для выпадающих списков
async function loadOptions() {
  loading.value = true;
  try {
    const [categoriesResponse, manufacturersResponse, catalogsResponse] =
      await Promise.all([
        fetch("http://localhost:3000/api/product/category/all?all=true"),
        fetch("http://localhost:3000/api/product/manufacturer/all?all=true"),
        fetch("http://localhost:3000/api/product/catalog/all?all=true"),
      ]);

    if (categoriesResponse.ok) {
      const result = await categoriesResponse.json();
      categories.value = result.data;
    }

    if (manufacturersResponse.ok) {
      const result = await manufacturersResponse.json();
      manufacturers.value = result.data;
    }

    if (catalogsResponse.ok) {
      const result = await catalogsResponse.json();
      catalogs.value = result.data;
    }

    console.log(catalogs);
  } catch (error) {
    console.error("Ошибка при загрузке опций:", error);
  } finally {
    loading.value = false;
  }
}

// Обработчик отправки формы
async function onSubmit(event: Event) {
  event.preventDefault();
  loading.value = true;

  try {
    // Подготовка данных
    const formData: FormData = {
      name: state.name,
      price: Number(state.price),
      description: state.description,
      telegram_notification: state.telegram_notification,
      dimensions: {
        lenght: Number(state.dimensions?.lenght),
        width: Number(state.dimensions?.width),
        height: Number(state.dimensions?.height),
        depth: Number(state.dimensions?.depth),
      },
    };

    // Обработка каталога
    if (catalog.value.new && catalog.value.name) {
      formData.catalog = { name: catalog.value.name };
    } else if (state.catalog_id) {
      formData.catalog_id = Number(state.catalog_id);
    }

    // Обработка категории
    if (category.value.new && category.value.name) {
      formData.category = { name: category.value.name };
    } else if (state.category_id) {
      formData.category_id = Number(state.category_id);
    }

    // Обработка производителя
    if (manufacturer.value.new && manufacturer.value.name) {
      formData.manufacturer = { name: manufacturer.value.name };
    } else if (state.manufacturer_id) {
      formData.manufacturer_id = Number(state.manufacturer_id);
    }

    // Валидация данных
    const validatedData = schema.parse(formData);

    // Создание FormData для отправки с файлами
    const dataToSend = new FormData();

    // Добавляем все поля кроме изображений
    Object.entries(validatedData).forEach(([key, value]) => {
      if (key === "dimensions") {
        dataToSend.append(key, JSON.stringify(value));
      } else if (
        key === "catalog" ||
        key === "category" ||
        key === "manufacturer"
      ) {
        dataToSend.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        dataToSend.append(key, String(value));
      }
    });

    // Добавляем изображения
    images.value.forEach((file, index: number) => {
      dataToSend.append("images", file);
    });

    // Отправка данных на сервер
    const response = await fetch("http://localhost:3000/api/product", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: dataToSend,
    });

    if (response.ok) {
      // Сброс формы
      Object.assign(state, {
        name: undefined,
        price: undefined,
        description: undefined,
        quantity: undefined,
        catalog_id: undefined,
        category_id: undefined,
        manufacturer_id: undefined,
        telegram_notification: true,
        dimensions: {
          lenght: 0,
          width: 0,
          height: 0,
          depth: 0,
        },
        catalog: undefined,
        category: undefined,
        manufacturer: undefined,
      });

      images.value = [];
      catalog.value = { id: undefined, name: undefined, new: false };
      category.value = { id: undefined, name: undefined, new: false };
      manufacturer.value = { id: undefined, name: undefined, new: false };

      // Закрытие модального окна и эмит события успеха
      emit("update:open", false);
      emit("success");
      console.log("Товар успешно добавлен");
    } else {
      const error = await response.json();
      console.error("Ошибка при добавлении товара:", error);
    }
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      console.error("Ошибка валидации:", validationError);
    } else {
      console.error("Ошибка:", validationError);
    }
  } finally {
    loading.value = false;
  }
}

// Обработчик открытия
async function onOpen(value: boolean) {
  if (value) {
    await loadOptions();
  }
}

// Обработчик отмены
function onCancel() {
  emit("update:open", false);
}
</script>

<template>
  <UModal
    title="Создать товар"
    description="Форма добавления товара"
    :ui="{ width: 'sm:max-w-lg' }"
    @update:open="onOpen"
  >
    <UButton label="Добавить товар" icon="i-lucide-plus" />
    <template #body>
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Основные поля -->
        <UFormField label="Название" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Введите название товара"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="Описание" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Введите описание товара"
            class="w-full"
            :disabled="loading"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Цена (₽)" name="price" required>
          <UInput
            v-model="state.price"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <!-- Выпадающие списки -->
        <div class="flex" style="flex-direction: column">
          <UFormField
            class="w-full mb-2"
            label="Каталог"
            name="catalog_id"
            required
          >
            <UInput
              v-if="catalog.new"
              v-model="catalog.name"
              placeholder="Введите название каталога"
              class="w-full mb-2"
              :disabled="loading"
            />
            <USelect
              v-else
              v-model="state.catalog_id"
              class="w-full mb-2"
              :items="
                catalogs.map((catalog) => ({
                  label: catalog.name,
                  value: catalog.id,
                }))
              "
              placeholder="Выберите каталог"
              :disabled="loading"
              :loading="loading"
            />
            <USwitch
              v-model="catalog.new"
              label="Новый каталог"
              description="Добавить новый каталог"
              size="sm"
              color="neutral"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>

          <UFormField
            class="w-full mb-2"
            label="Категория"
            name="category_id"
            required
          >
            <UInput
              v-if="category.new"
              v-model="category.name"
              placeholder="Введите название категории"
              class="w-full mb-2"
              :disabled="loading"
            />
            <USelect
              v-else
              v-model="state.category_id"
              class="w-full mb-2"
              :items="
                categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))
              "
              placeholder="Выберите категорию"
              :disabled="loading"
              :loading="loading"
            />
            <USwitch
              v-model="category.new"
              label="Новая категория"
              description="Добавить новую категорию"
              size="sm"
              color="neutral"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>

          <UFormField
            class="w-full mb-2"
            label="Производитель"
            name="manufacturer_id"
            required
          >
            <UInput
              v-if="manufacturer.new"
              v-model="manufacturer.name"
              placeholder="Введите название производителя"
              class="w-full mb-2"
              :disabled="loading"
            />
            <USelect
              v-else
              v-model="state.manufacturer_id"
              class="w-full mb-2"
              :items="
                manufacturers.map((manufacturer) => ({
                  label: manufacturer.name,
                  value: manufacturer.id,
                }))
              "
              placeholder="Выберите производителя"
              :disabled="loading"
              :loading="loading"
            />
            <USwitch
              v-model="manufacturer.new"
              label="Новый производитель"
              description="Добавить нового производителя"
              size="sm"
              color="neutral"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>
        </div>

        <!-- Габариты -->
        <div class="border rounded-lg p-4 space-y-4">
          <p class="text-sm font-medium text-gray-700">Габариты товара</p>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Длина (мм)" name="dimensions.lenght" required>
              <UInput
                v-model="state.dimensions.lenght"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                :disabled="loading"
              />
            </UFormField>

            <UFormField label="Ширина (мм)" name="dimensions.width" required>
              <UInput
                v-model="state.dimensions.width"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                :disabled="loading"
              />
            </UFormField>

            <UFormField label="Высота (мм)" name="dimensions.height" required>
              <UInput
                v-model="state.dimensions.height"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                :disabled="loading"
              />
            </UFormField>

            <UFormField label="Глубина (мм)" name="dimensions.depth" required>
              <UInput
                v-model="state.dimensions.depth"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                :disabled="loading"
              />
            </UFormField>

            <UFormField label="Вес (кг)" name="dimensions.weight" required>
              <UInput
                v-model="state.dimensions.weight"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                :disabled="loading"
              />
            </UFormField>
          </div>
        </div>

        <!-- Рисунки -->
        <div class="flex" style="flex-direction: column">
          <p class="text-md font-sm text-weight-600 mb-1">Рисунки товара</p>
          <UFileUpload
            v-model="images"
            multiple
            position="inside"
            layout="grid"
            :interactive="false"
            icon="i-lucide-image"
            label="Загрузите картинки сюда"
            description="SVG, PNG, JPG или GIF (макс. 4MB)"
            class="w-100"
          >
            <template #actions="{ open }">
              <UButton
                label="Выбрать картинки"
                icon="i-lucide-upload"
                color="neutral"
                variant="outline"
                @click="open()"
              />
            </template>

            <template #files-top="{ open, files }">
              <div
                v-if="images.length"
                class="mb-2 flex items-center justify-between"
              >
                <p class="font-bold">Кол-во картинок ({{ images.length }})</p>

                <UButton
                  icon="i-lucide-plus"
                  label="Добавить еще"
                  color="neutral"
                  variant="outline"
                  class="-my-2"
                  @click="open()"
                />
              </div>
            </template>
          </UFileUpload>
        </div>

        <!-- Дополнительные опции -->
        <UFormField label="Уведомления телеграм" name="telegram_notification">
          <USwitch
            v-model="state.telegram_notification"
            label="Отправить уведомление"
            description="Оповести о новом товаре в телеграм группу"
            size="sm"
            color="neutral"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
          />
        </UFormField>

        <!-- Кнопки действий -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <UButton
            label="Отмена"
            color="gray"
            variant="ghost"
            @click="onCancel"
          />
          <UButton
            label="Добавить товар"
            color="primary"
            type="submit"
            :loading="loading"
            :disabled="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
