const SERVER_URL: string = "https://api.mebelmodnostilno.ru";
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
};

export { BACKEND_API };
