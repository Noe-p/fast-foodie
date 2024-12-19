export const ROUTES = {
  dishes: {
    index: '/',
    detail: (id: string) => `/dishes/${id}`,
    week: '/dishes/week',
  },
  shoppingList: '/shopping-list',
  user: '/user',
  auth: {
    login: '/login',
    register: '/register',
  },
};
