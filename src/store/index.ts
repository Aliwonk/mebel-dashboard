import { reactive } from "vue";
import { getCookie } from "../utils";

export const authStore = reactive({
  isAuthenticated: getCookie("token") ? true : false,
});

export const productPageStore = reactive({
  modal: {
    edit: false,
    create: false,
  },
});

export const mainPageStore = reactive<{
  modal: {
    open: boolean;
    type: "create" | "edit" | null;
    title: string | null;
    data: any;
  };
}>({
  modal: {
    open: false,
    type: null,
    title: null,
    data: null,
  },
});
