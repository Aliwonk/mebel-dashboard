<script setup lang="ts">
import { ref } from "vue";

const state = ref("");

console.log(state);
</script>
<template>
  <UDashboardPanel id="telegram">
    <template #header>
      <UDashboardNavbar title="Телеграм настройки" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageList>
        <UPageCard>
          <template #body>
            <div>Группа</div>
          </template>
        </UPageCard>
      </UPageList>
    </template>
  </UDashboardPanel>
</template>
