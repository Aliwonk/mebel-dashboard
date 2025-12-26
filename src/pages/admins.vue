<script setup lang="ts">
import {
  useTemplateRef,
  h,
  ref,
  watch,
  resolveComponent,
  onMounted,
  computed,
} from "vue";
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel, type Row } from "@tanstack/table-core";
import type { Admin } from "../types";
import { BACKEND_API } from "../constants/API.constant";
import { getCookie } from "../utils";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const toast = useToast();
const table = useTemplateRef("table");
const dataTable = ref<Admin[]>([]);
const allAdmins = ref<Admin[]>([]);
const dataFetching = ref<boolean>(false);
const delAdminModal = ref<{
  open: boolean;
  id_admin: string | null;
  super_admin_password: string | null;
}>({
  open: false,
  id_admin: null,
  super_admin_password: null,
});

// Переменная для поиска
const searchQuery = ref<string>("");

// Фильтрация данных по поисковому запросу
const filteredAdmins = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAdmins.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return allAdmins.value.filter((admin) => {
    const fullName = `${admin.surname} ${admin.name}`.toLowerCase();
    const login = admin.login.toLowerCase();

    return fullName.includes(query) || login.includes(query);
  });
});

// Обновляем dataTable при изменении filteredAdmins
watch(
  filteredAdmins,
  (newValue) => {
    dataTable.value = newValue;
  },
  { immediate: true }
);

const deleteAdmin = async () => {
  delAdminModal.value.open = false;
  const response = await fetch(
    `${BACKEND_API.ADMIN.DELETE}/${delAdminModal.value.id_admin}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        super_admin_password: delAdminModal.value.super_admin_password,
      }),
    }
  );

  const result = await response.json();
  if (response.ok) {
    allAdmins.value = allAdmins.value.filter(
      (admin) => String(admin.id) !== delAdminModal.value.id_admin
    );

    const admin = allAdmins.value.find(
      (admin) => String(admin.id) === delAdminModal.value.id_admin
    );
    toast.add({
      title: "Администратор удален",
      description: `Администратор ${admin?.surname} ${admin?.name}`,
      type: "background",
      color: "success",
    });
  } else {
    toast.add({
      title: "Ошибка при удалении",
      description: `При удалении произошла ошибка: ${result.message}`,
      type: "background",
      color: "error",
    });
  }
};

async function fetchAdmins() {
  dataFetching.value = true;
  const response = await fetch(BACKEND_API.ADMIN.GET_ALL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getCookie("token")}`,
      "Content-Type": "applicaiton/json",
    },
  });
  const result: { data: Admin[]; count: number } = await response.json();
  if (response.ok) {
    allAdmins.value = result.data;
  }
  dataFetching.value = false;
}

function getRowItems(row: Row<Admin>) {
  return [
    {
      type: "label",
      label: "Действия",
    },
    {
      label: "Удалить",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        delAdminModal.value.id_admin = String(row.original.id);
        delAdminModal.value.open = true;
      },
    },
  ];
}

const columns: TableColumn<Admin>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullname",
    header: "ФИО",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h("div", undefined, [
          h(
            "p",
            { class: "font-medium text-highlighted" },
            `${row.original.surname} ${row.original.name}`
          ),
        ]),
      ]);
    },
  },
  {
    accessorKey: "login",
    header: "Логин",
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
              class: "ml-auto",
            })
        )
      );
    },
  },
];

const statusFilter = ref("all");

onMounted(async () => {
  await fetchAdmins();
});

watch(
  () => statusFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return;

    const statusColumn = table.value.tableApi.getColumn("status");
    if (!statusColumn) return;

    if (newVal === "all") {
      statusColumn.setFilterValue(undefined);
    } else {
      statusColumn.setFilterValue(newVal);
    }
  }
);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
</script>

<template>
  <UDashboardPanel id="admins">
    <template #header>
      <UDashboardNavbar title="Администраторы">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <AdminAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="searchQuery"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Поиск по ФИО или логину..."
        >
          <template #trailing>
            <UButton
              v-if="searchQuery"
              color="gray"
              variant="link"
              icon="i-lucide-x"
              :padded="false"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>

        <UModal
          v-model:open="delAdminModal.open"
          title="Удалить администратора"
        >
          <template #body>
            <UForm class="space-y-4">
              <UFormField
                label="Пароль супер администратора"
                name="super_admin_password"
              >
                <UInput
                  v-model="delAdminModal.super_admin_password"
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
                  @click="delAdminModal.open = false"
                />
                <UButton
                  label="Удалить"
                  color="error"
                  variant="solid"
                  type="submit"
                  @click="deleteAdmin"
                />
              </div>
            </UForm>
          </template>
        </UModal>
      </div>

      <div v-if="searchQuery" class="mt-2 text-sm text-gray-500">
        Найдено администраторов: {{ filteredAdmins.length }}
      </div>

      <UTable
        ref="table"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        class="shrink-0 mt-4"
        :data="dataTable ?? []"
        :columns="columns"
        :loading="dataFetching"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0',
        }"
      />

      <div
        v-if="dataTable.length > 0"
        class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
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
        v-else-if="!dataFetching"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <UIcon name="i-lucide-users" class="w-12 h-12 text-gray-300 mb-4" />
        <p class="text-gray-500">
          {{
            searchQuery ? "Администраторы не найдены" : "Нет администраторов"
          }}
        </p>
        <p v-if="searchQuery" class="text-sm text-gray-400 mt-1">
          Попробуйте изменить поисковый запрос
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
