export const ROUTES = {
  dishes: {
    index: '/',
    detail: (id: string) => `/dishes/${id}`,
    week: 'weeklyDish',
  },
  shoppingList: '/shopping-list',
  user: '/user',
  auth: {
    login: '/login',
    register: '/register',
  },
};
