<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import z from "zod";
import { getCookie } from "../../utils";
import { BACKEND_API } from "../../constants/API.constant";
import type { Product } from "../../types";

const props = defineProps<{
  productId?: number | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
  refresh: [];
}>();

// Состояние окна
const isOpen = defineModel<boolean>("open", { default: false });
const isEditMode = computed(() => !!props.productId);
const modalTitle = computed(() =>
  isEditMode.value ? "Редактировать товар" : "Создать товар"
);
const submitButtonText = computed(() =>
  isEditMode.value ? "Сохранить изменения" : "Добавить товар"
);

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
  telegram_notification: z.boolean().optional(),
  dimensions: z.object({
    length: z
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
});

// Инициализация состояния
const state = reactive({
  name: "",
  price: 0,
  description: "",
  telegram_notification: false,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
  },
  catalog_id: undefined as number | undefined,
  category_id: undefined as number | undefined,
  manufacturer_id: undefined as number | undefined,
});

// Данные для выпадающих списков
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
const images = ref<File[]>([]);
const existingImages = ref<Array<{ id: number; url: string }>>([]);
const imagesToDelete = ref<number[]>([]);

// Загрузка данных для выпадающих списков
async function loadOptions() {
  loading.value = true;
  try {
    const [categoriesResponse, catalogsResponse, manufacturersResponse] =
      await Promise.all([
        fetch(`${BACKEND_API.PRODUCT.CATEGORY.GET_ALL}?all=true`),
        fetch(`${BACKEND_API.PRODUCT.CATALOG.GET_ALL}?all=true`),
        fetch(`${BACKEND_API.PRODUCT.MANUFACTURER.GET_ALL}?all=true`),
      ]);

    if (categoriesResponse.ok) {
      const result = await categoriesResponse.json();
      categories.value = result.data || [];
    }

    if (manufacturersResponse.ok) {
      const result = await manufacturersResponse.json();
      manufacturers.value = result.data || [];
    }

    if (catalogsResponse.ok) {
      const result = await catalogsResponse.json();
      catalogs.value = result.data || [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке опций:", error);
  } finally {
    loading.value = false;
  }
}

// Загрузка данных товара для редактирования
async function loadProductData(productId: number) {
  loading.value = true;
  try {
    const response = await fetch(`${BACKEND_API.PRODUCT.GET_ONE}/${productId}`);
    if (response.ok) {
      const result = await response.json();
      const product: Product = result.data;

      // Заполняем форму данными товара
      state.name = product.name;
      state.price = Number(product.price);
      state.description = product.description || "";
      state.telegram_notification = product.telegram_notification || false;
      state.dimensions =
        product.dimensions && product.dimensions.length > 0
          ? product.dimensions[0]
          : {
              length: 0,
              width: 0,
              height: 0,
              depth: 0,
              weight: 0,
            };

      // Устанавливаем ID категорий, производителей и каталогов
      if (product.categories && product.categories.length > 0) {
        state.category_id = product.categories[0].id;
        category.value = {
          id: product.categories[0].id,
          name: product.categories[0].name,
          new: false,
        };
      }

      if (product.manufacturers && product.manufacturers.length > 0) {
        state.manufacturer_id = product.manufacturers[0].id;
        manufacturer.value = {
          id: product.manufacturers[0].id,
          name: product.manufacturers[0].name,
          new: false,
        };
      }

      if (product.catalogs && product.catalogs.length > 0) {
        state.catalog_id = product.catalogs[0].id;
        catalog.value = {
          id: product.catalogs[0].id,
          name: product.catalogs[0].name,
          new: false,
        };
      }

      // Сохраняем существующие изображения
      existingImages.value = product.images || [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных товара:", error);
  } finally {
    loading.value = false;
  }
}

// Сброс формы
function resetForm() {
  Object.assign(state, {
    name: "",
    price: 0,
    description: "",
    telegram_notification: false,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
    },
    catalog_id: undefined,
    category_id: undefined,
    manufacturer_id: undefined,
  });

  images.value = [];
  existingImages.value = [];
  imagesToDelete.value = [];

  catalog.value = { id: undefined, name: undefined, new: false };
  category.value = { id: undefined, name: undefined, new: false };
  manufacturer.value = { id: undefined, name: undefined, new: false };
}

// Обработчик открытия модального окна
watch(isOpen, async (value) => {
  if (value) {
    await loadOptions();
    if (props.productId) {
      await loadProductData(props.productId);
    } else {
      resetForm();
    }
  }
});

// Удаление существующего изображения
function deleteExistingImage(imageId: number) {
  imagesToDelete.value.push(imageId);
  existingImages.value = existingImages.value.filter(
    (img) => img.id !== imageId
  );
}

// Подготовка данных для отправки
function prepareFormData() {
  const formData = new FormData();

  // Основные поля
  formData.append("name", state.name);
  formData.append("price", state.price.toString());
  if (state.description) {
    formData.append("description", state.description);
  }
  formData.append(
    "telegram_notification",
    state.telegram_notification.toString()
  );

  // Габариты
  formData.append("dimensions", JSON.stringify(state.dimensions));

  // ID категорий, производителей и каталогов
  if (state.category_id) {
    formData.append("category_id", state.category_id.toString());
  }
  if (state.manufacturer_id) {
    formData.append("manufacturer_id", state.manufacturer_id.toString());
  }
  if (state.catalog_id) {
    formData.append("catalog_id", state.catalog_id.toString());
  }

  // Новые изображения
  images.value.forEach((file, index) => {
    formData.append("images", file);
  });

  // ID изображений для удаления (только в режиме редактирования)
  if (isEditMode.value && imagesToDelete.value.length > 0) {
    formData.append("images_to_delete", JSON.stringify(imagesToDelete.value));
  }

  // Новые категории/производители/каталоги
  if (category.value.new && category.value.name) {
    formData.append("category", JSON.stringify({ name: category.value.name }));
  }

  if (manufacturer.value.new && manufacturer.value.name) {
    formData.append(
      "manufacturer",
      JSON.stringify({ name: manufacturer.value.name })
    );
  }

  if (catalog.value.new && catalog.value.name) {
    formData.append("catalog", JSON.stringify({ name: catalog.value.name }));
  }

  return formData;
}

// Обработчик отправки формы
async function onSubmit(event: Event) {
  event.preventDefault();
  loading.value = true;

  try {
    // Подготовка FormData
    const formData = prepareFormData();

    // Определяем URL и метод в зависимости от режима
    let url = BACKEND_API.PRODUCT.CREATE;
    let method = "POST";

    if (isEditMode.value && props.productId) {
      url = `${BACKEND_API.PRODUCT.GET_ONE}/${props.productId}`;
      method = "PUT";
    }

    // Отправка данных на сервер
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: formData,
    });

    if (response.ok) {
      // Сброс формы
      resetForm();

      // Закрытие модального окна
      isOpen.value = false;

      // Уведомление об успехе
      emit("success");
      emit("refresh");

      // Показываем уведомление
      showNotification(
        "success",
        isEditMode.value ? "Товар успешно обновлен" : "Товар успешно добавлен"
      );
    } else {
      const error = await response.json();
      throw new Error(error.message || "Ошибка при сохранении товара");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showNotification(
      "error",
      error instanceof Error ? error.message : "Произошла ошибка при сохранении"
    );
  } finally {
    loading.value = false;
  }
}

// Функция для показа уведомлений
function showNotification(type: "success" | "error", message: string) {
  // Здесь можно использовать ваш UI компонент для уведомлений
  const event = new CustomEvent("show-notification", {
    detail: { type, message },
  });
  window.dispatchEvent(event);
}

// Обработчик отмены
function onCancel() {
  resetForm();
  isOpen.value = false;
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="
      isEditMode ? 'Форма редактирования товара' : 'Форма добавления товара'
    "
    :ui="{ width: 'sm:max-w-lg' }"
  >
    <template #body>
      <UForm ref="form" :state="state" class="space-y-4" @submit="onSubmit">
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
        <div class="space-y-4">
          <UFormField label="Каталог" name="catalog_id" required>
            <div class="space-y-2">
              <UInput
                v-if="catalog.new"
                v-model="catalog.name"
                placeholder="Введите название каталога"
                class="w-full"
                :disabled="loading"
              />
              <USelect
                v-else
                v-model="state.catalog_id"
                class="w-full"
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
            </div>
          </UFormField>

          <UFormField label="Категория" name="category_id" required>
            <div class="space-y-2">
              <UInput
                v-if="category.new"
                v-model="category.name"
                placeholder="Введите название категории"
                class="w-full"
                :disabled="loading"
              />
              <USelect
                v-else
                v-model="state.category_id"
                class="w-full"
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
            </div>
          </UFormField>

          <UFormField label="Производитель" name="manufacturer_id" required>
            <div class="space-y-2">
              <UInput
                v-if="manufacturer.new"
                v-model="manufacturer.name"
                placeholder="Введите название производителя"
                class="w-full"
                :disabled="loading"
              />
              <USelect
                v-else
                v-model="state.manufacturer_id"
                class="w-full"
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
            </div>
          </UFormField>
        </div>

        <!-- Габариты -->
        <div class="border rounded-lg p-4 space-y-4">
          <p class="text-sm font-medium text-gray-700">Габариты товара</p>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Длина (мм)" name="dimensions.length" required>
              <UInput
                v-model="state.dimensions.length"
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
                step="0.1"
                min="0"
                :disabled="loading"
              />
            </UFormField>
          </div>
        </div>

        <!-- Существующие изображения (только в режиме редактирования) -->
        <div v-if="isEditMode && existingImages.length > 0" class="space-y-2">
          <p class="text-sm font-medium text-gray-700">
            Существующие изображения
          </p>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="image in existingImages"
              :key="image.id"
              class="relative group"
            >
              <img
                :src="image.url"
                :alt="state.name"
                class="w-full h-24 object-cover rounded-lg"
              />
              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="solid"
                size="xs"
                class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="deleteExistingImage(image.id)"
              />
            </div>
          </div>
        </div>

        <!-- Новые изображения -->
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700">
            {{
              isEditMode ? "Добавить новые изображения" : "Изображения товара"
            }}
          </p>
          <UFileUpload
            v-model="images"
            multiple
            position="inside"
            layout="grid"
            :interactive="false"
            icon="i-lucide-image"
            :label="
              isEditMode
                ? 'Добавьте новые изображения'
                : 'Загрузите картинки сюда'
            "
            description="SVG, PNG, JPG или GIF (макс. 4MB)"
            class="w-full"
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
                <p class="font-bold">
                  Кол-во новых картинок ({{ images.length }})
                </p>
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
            description="Оповестить о новом товаре в телеграм группу"
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
            :disabled="loading"
          />
          <UButton
            :label="submitButtonText"
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

<style scoped>
.form :deep(.ui-input) input:focus,
.form :deep(.ui-textarea) textarea:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
}
</style>
