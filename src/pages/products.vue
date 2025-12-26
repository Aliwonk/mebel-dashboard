<script setup lang="ts">
import { TableColumn } from "@nuxt/ui";
import { Product } from "../types";
import { type Row } from "@tanstack/table-core";
import {
  onMounted,
  ref,
  h,
  resolveComponent,
  computed,
  watch,
  useTemplateRef,
} from "vue";
import { BACKEND_API } from "../constants/API.constant";
import { getPaginationRowModel } from "@tanstack/table-core";

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UInput = resolveComponent("UInput");

const table = useTemplateRef("table");
const allProducts = ref<Product[]>([]);
const dataTable = ref<Product[]>([]);
const fetchingProduct = ref<boolean>(false);
const pagination = ref({
  pageIndex: 0,
  pageSize: 12,
});
const searchQuery = ref<string>("");

// Фильтрация данных по поисковому запросу
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return allProducts.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return allProducts.value.filter((product) => {
    const name = product.name.toLowerCase();
    const categories =
      product.categories?.map((cat) => cat.name.toLowerCase()).join(" ") || "";
    const manufacturers =
      product.manufacturers?.map((man) => man.name.toLowerCase()).join(" ") ||
      "";

    return (
      name.includes(query) ||
      categories.includes(query) ||
      manufacturers.includes(query)
    );
  });
});

// Обновляем dataTable при изменении filteredProducts
watch(
  filteredProducts,
  (newValue) => {
    dataTable.value = newValue;
  },
  { immediate: true }
);

// Сбрасываем пагинацию при поиске
watch(searchQuery, () => {
  pagination.value.pageIndex = 0;
});

const tableColumn: TableColumn<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 70,
  },
  {
    accessorKey: "name",
    header: "Название",
    size: 200,
  },
  {
    accessorKey: "categories",
    header: "Категории",
    size: 150,
    cell: ({ row }) => {
      const categories = row.original.categories;
      if (categories && categories.length > 0) {
        return h(
          "div",
          { class: "flex flex-wrap gap-1" },
          categories.map((cat) =>
            h(UBadge, {
              label: cat.name,
              color: "gray",
              variant: "subtle",
              size: "lg",
            })
          )
        );
      }
      return "-";
    },
  },
  {
    accessorKey: "manufacturers",
    header: "Производители",
    size: 150,
    cell: ({ row }) => {
      const manufacturers = row.original.manufacturers;
      if (manufacturers && manufacturers.length > 0) {
        return h(
          "div",
          { class: "flex flex-col gap-1" },
          manufacturers.map((man) => h("span", { class: "text-sm" }, man.name))
        );
      }
      return "-";
    },
  },
  {
    accessorKey: "price",
    header: "Цена",
    size: 100,
    cell: (row) => {
      const price = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(row.getValue()));
      return h("span", { class: "font-medium" }, `${price}`);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              size: "sm",
              class: "ml-auto",
            })
        )
      );
    },
  },
];

function getRowItems(row: Row<Product>) {
  return [
    {
      type: "label",
      label: "Действия",
    },
    {
      label: "Изменить",
      icon: "i-lucide-square-pen",
      color: "info",
      onSelect() {
        editProduct(row.original.id);
      },
    },
    {
      label: "Удалить",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        deleteProduct(row.original.id);
      },
    },
  ];
}

async function fetchProducts() {
  fetchingProduct.value = true;
  try {
    const response = await fetch(BACKEND_API.PRODUCT.GET_ALL + "/?all=true");
    const result: {
      data: Array<Product>;
      count: number;
      page: number;
      totalPages: number;
    } = await response.json();

    if (response.ok) {
      allProducts.value = result.data;
    }
  } catch (error) {
    console.error("Ошибка при загрузке товаров:", error);
  } finally {
    fetchingProduct.value = false;
  }
}

function editProduct(id: number) {
  console.log("Редактировать товар:", id);
}

function deleteProduct(id: number) {
  console.log("Удалить товар:", id);
}

onMounted(async () => {
  await fetchProducts();
});
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="Список товаров">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <AddProductModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4">
        <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
          <UInput
            v-model="searchQuery"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Поиск по названию, категории или производителю..."
            size="sm"
          >
            <template #trailing>
              <UButton
                v-if="searchQuery"
                color="gray"
                variant="link"
                icon="i-lucide-x"
                :padded="false"
                size="xs"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>

        <div v-if="searchQuery" class="mb-2 text-sm text-gray-500">
          Найдено товаров: {{ filteredProducts.length }}
        </div>

        <UTable
          ref="table"
          v-model:pagination="pagination"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          :data="dataTable"
          :columns="tableColumn"
          :loading="fetchingProduct"
          class="shrink-0"
          :ui="{
            base: 'min-w-full border-separate border-spacing-0',
            thead: '[&>tr]:bg-gray-50 dark:[&>tr]:bg-gray-800/50',
            th: 'py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap',
            td: 'py-3 px-4 text-sm border-t border-gray-200 dark:border-gray-700',
            tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
            wrapper:
              'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          }"
        >
          <template #empty-state>
            <div class="text-center py-12">
              <UIcon
                name="i-lucide-package"
                class="w-12 h-12 mx-auto text-gray-300 mb-4"
              />
              <h3
                class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"
              >
                {{ searchQuery ? "Товары не найдены" : "Товары отсутствуют" }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                {{
                  searchQuery
                    ? "Попробуйте изменить поисковый запрос"
                    : "Начните добавлять товары, чтобы они появились здесь."
                }}
              </p>
            </div>
          </template>
        </UTable>

        <div
          v-if="dataTable.length > 0"
          class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-4"
        >
          <div class="flex items-center gap-1.5">
            <UPagination
              :default-page="
                (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
              "
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>

        <div
          v-else-if="!fetchingProduct"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <UIcon name="i-lucide-package" class="w-12 h-12 text-gray-300 mb-4" />
          <p class="text-gray-500">
            {{ searchQuery ? "Товары не найдены" : "Товары отсутствуют" }}
          </p>
          <p v-if="searchQuery" class="text-sm text-gray-400 mt-1">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
