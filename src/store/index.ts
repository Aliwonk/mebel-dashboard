import { reactive } from "vue";
import { getCookie } from "../utils";

export const authStore = reactive({
  isAuthenticated: getCookie("token") ? true : false,
});
