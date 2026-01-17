// const SERVER_URL: string = "https://api.mebelmodnostilno.ru/api";
const SERVER_URL: string = "http://localhost:3000/api";
const BACKEND_API = {
  ADMIN: {
    CREATE: `${SERVER_URL}/auth/register`,
    LOGIN: `${SERVER_URL}/auth/login`,
    GET_ALL: `${SERVER_URL}/auth/admins`,
    DELETE: `${SERVER_URL}/auth/delete`,
  },
  PRODUCT: {
    CREATE: `${SERVER_URL}/product`,
    GET_ONE: `${SERVER_URL}/product`,
    GET_ALL: `${SERVER_URL}/product/all`,
    CATEGORY: {
      GET_ONE: `${SERVER_URL}/product/category`,
      GET_ALL: `${SERVER_URL}/product/category/all`,
    },
    CATALOG: {
      GET_ONE: `${SERVER_URL}/product/catalog`,
      GET_ALL: `${SERVER_URL}/product/catalog/all`,
    },
    MANUFACTURER: {
      GET_ONE: `${SERVER_URL}/product/manufacturer`,
      GET_ALL: `${SERVER_URL}/product/manufacturer/all`,
    },
  },
  STORE: {
    PHONE: {
      CREATE: `${SERVER_URL}/store/phone`,
      GET_ALL: `${SERVER_URL}/store/phone/all`,
      GET_ONE: `${SERVER_URL}/store/phone`,
      UPDATE: `${SERVER_URL}/store/phone`,
      DELETE: `${SERVER_URL}/store/phone`,
    },
    EMAIL: {
      CREATE: `${SERVER_URL}/store/email`,
      GET_ALL: `${SERVER_URL}/store/email/all`,
      GET_ONE: `${SERVER_URL}/store/email`,
      UPDATE: `${SERVER_URL}/store/email`,
      DELETE: `${SERVER_URL}/store/email`,
    },
    ADDRESS: {
      CREATE: `${SERVER_URL}/store/address`,
      GET_ALL: `${SERVER_URL}/store/address/all`,
      GET_ONE: `${SERVER_URL}/store/address/`,
      UPDATE: `${SERVER_URL}/store/address`,
      DELETE: `${SERVER_URL}/store/address`,
    },
  },
};

export { BACKEND_API };
