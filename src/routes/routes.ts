export const ROUTES = {
  home: '/',
  dynamicPage: '/dynamic-page',
  users: {
    index: '/users',
    detail: (id: string) => `/users/${id}`,
  },
  auth: {
    login: '/login',
    register: '/register',
  },
};
