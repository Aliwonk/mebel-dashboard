<script setup lang="ts">
import { h, resolveComponent, ref, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { randomInt, randomFrom } from "../../utils";
import type { Period, Range, Sale } from "../../types";

const props = defineProps<{
  period: Period;
  range: Range;
}>();

const UBadge = resolveComponent("UBadge");

const sampleEmails = [
  "Диван Комфорт-1 НПБ",
  "Диван Верона-15 (БНП) Стандарт П (ПУФ3+ПС+УС+Д3+ПТ+Д4П2)",
  "Кухонный гарнитур угловой Демо 3200x1400 столешница 26 мм",
  "Письменный стол Паскаль",
  "Компьютерное кресло Hiba gray - chrome",
];

const data = ref<Sale[]>([]);

watch(
  [() => props.period, () => props.range],
  () => {
    const sales: Sale[] = [];
    const currentDate = new Date();

    for (let i = 0; i < 5; i++) {
      const hoursAgo = randomInt(0, 48);
      const date = new Date(currentDate.getTime() - hoursAgo * 3600000);

      sales.push({
        id: (4600 - i).toString(),
        date: date.toISOString(),
        status: randomFrom(["Стулья", "Диваны", "Кровати"]),
        email: randomFrom(sampleEmails),
        amount: randomInt(1000, 100000),
      });
    }

    data.value = sales.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  { immediate: true }
);

const columns: TableColumn<Sale>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "date",
    header: "Каталог",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
  {
    accessorKey: "status",
    header: "Категория",
    cell: ({ row }) => {
      const color = {
        paid: "success" as const,
        failed: "error" as const,
        refunded: "neutral" as const,
      }[row.getValue("status") as string];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("status")
      );
    },
  },
  {
    accessorKey: "email",
    header: "Название",
  },
  {
    accessorKey: "amount",
    header: () => h("div", { class: "text-right" }, "Цена"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));

      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
    },
  },
];
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default',
    }"
  />
</template>
