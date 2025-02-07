export const ROUTES = {
  dishes: {
    index: '/',
    detail: (id: string) => `/dishes/${id}`,
    week: '/weeklyDish',
    update: (id: string) => `/dishes/update/${id}`,
    create: '/dishes/create',
  },
  shoppingList: '/shoppingList',
  user: '/user',
  users: {
    detail: (id: string) => `/users/${id}`,
  },
  auth: {
    login: '/login',
    register: '/register',
  },
};
