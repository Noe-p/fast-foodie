
export const API_ROUTES = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  users: {
    me: '/api/users/me',
    update: '/api/users/me',
    delete: '/api/users/me',
  },
  media: {
    upload: '/api/upload',
    delete: (id: string) => `/api/upload/${id}`,
  },
  dishes: {
    get: '/api/dishes',
    create: '/api/dishes',
    update: (id: string) => `/api/dishes/${id}`,
    delete: (id: string) => `/api/dishes/${id}`,
    getTags: '/api/dishes/getTags',
  },
  foods: {
    get: '/api/foods',
    create: '/api/foods',
    update: (id: string) => `/api/foods/${id}`,
    delete: (id: string) => `/api/foods/${id}`,
  },
  collaborators: {
    get: '/api/collaborators',
    create: '/api/collaborators',
    delete: (id: string) => `/api/collaborators/${id}`,
  },
};
