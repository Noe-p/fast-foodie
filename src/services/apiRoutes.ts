
export const API_ROUTES = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    update: '/users/me',
    delete: '/users/me',
  },
  media: {
    upload: '/upload',
    delete: (id: string) => `/upload/${id}`,
  },
  dishes: {
    get: '/dishes',
    create: '/dishes',
    update: (id: string) => `/dishes/${id}`,
    delete: (id: string) => `/dishes/${id}`,
    getTags: '/dishes/getTags',
  },
  foods: {
    get: '/foods',
    create: '/foods',
    update: (id: string) => `/foods/${id}`,
    delete: (id: string) => `/foods/${id}`,
  },
  collaborators: {
    get: '/collaborators',
    create: '/collaborators',
    delete: (id: string) => `/collaborators/${id}`,
  },
};
