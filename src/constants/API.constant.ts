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
  },
};

export { BACKEND_API };
