<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
// import { useStorage } from "@vueuse/core";
import type { NavigationMenuItem } from "@nuxt/ui";
import Login from "./pages/login.vue";
import { authStore } from "./store";

// const toast = useToast();
const route = useRoute();

const open = ref(false);

const links = [
  [
    {
      label: "Главная",
      icon: "i-lucide-house",
      to: "/",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Товары",
      icon: "i-lucide-shopping-bag",
      to: "/products",
      // badge: "4",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Телеграм",
      icon: "i-lucide-bot",
      to: "/telegram",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Администраторы",
      icon: "i-lucide-users",
      to: "/admins",
      onSelect: () => {
        open.value = false;
      },
    },
    // {
    //   label: "Settings",
    //   to: "/settings",
    //   icon: "i-lucide-settings",
    //   defaultOpen: true,
    //   type: "trigger",
    //   children: [
    //     {
    //       label: "General",
    //       to: "/settings",
    //       exact: true,
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //     {
    //       label: "Members",
    //       to: "/settings/members",
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //     {
    //       label: "Notifications",
    //       to: "/settings/notifications",
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //     {
    //       label: "Security",
    //       to: "/settings/security",
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //   ],
    // },
  ],
  [
    {
      label: "Feedback",
      icon: "i-lucide-message-circle",
      to: "https://github.com/nuxt-ui-templates/dashboard-vue",
      target: "_blank",
    },
    {
      label: "Help & Support",
      icon: "i-lucide-info",
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
  ],
] satisfies NavigationMenuItem[][];

const groups = computed(() => [
  {
    id: "links",
    label: "Go to",
    items: links.flat(),
  },
  {
    id: "code",
    label: "Code",
    items: [
      {
        id: "source",
        label: "View page source",
        icon: "simple-icons:github",
        to: `https://github.com/nuxt-ui-templates/dashboard-vue/blob/main/src/pages${
          route.path === "/" ? "/index" : route.path
        }.vue`,
        target: "_blank",
      },
    ],
  },
]);

// const cookie = useStorage("cookie-consent", "pending");
// if (cookie.value !== "accepted") {
//   toast.add({
//     title:
//       "We use first-party cookies to enhance your experience on our website.",
//     duration: 0,
//     close: false,
//     actions: [
//       {
//         label: "Accept",
//         color: "neutral",
//         variant: "outline",
//         onClick: () => {
//           cookie.value = "accepted";
//         },
//       },
//       {
//         label: "Opt out",
//         color: "neutral",
//         variant: "ghost",
//       },
//     ],
//   });
// }
</script>

<template>
  <Suspense>
    <UApp>
      <Login v-if="!authStore.isAuthenticated" />
      <UDashboardGroup v-else unit="rem" storage="local">
        <UDashboardSidebar
          id="default"
          v-model:open="open"
          collapsible
          resizable
          class="bg-elevated/25"
          :ui="{ footer: 'lg:border-t lg:border-default' }"
        >
          <template #header>
            <div
              style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              class="title"
            >
              <p style="text-transform: uppercase; font-weight: 600">
                Панель управления
              </p>
            </div>
          </template>

          <template #default="{ collapsed }">
            <UNavigationMenu
              :collapsed="collapsed"
              :items="links[0]"
              orientation="vertical"
              tooltip
              popover
            />
          </template>

          <template #footer="{ collapsed }">
            <UserMenu :collapsed="collapsed" />
          </template>
        </UDashboardSidebar>

        <UDashboardSearch :groups="groups" />

        <RouterView />

        <NotificationsSlideover />
      </UDashboardGroup>
    </UApp>
  </Suspense>
</template>
