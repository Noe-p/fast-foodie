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
    deleteById: (id: string) => `/users/${id}`,
    updateById: (id: string) => `/users/${id}`,
  },
  address: {
    create: '/api/address',
    getById: (id: string) => `/address/${id}`,
    deleteById: (id: string) => `/address/${id}`,
    updateById: (id: string) => `/address/${id}`,
  },
  media: {
    upload: '/api/upload',
  },
};
