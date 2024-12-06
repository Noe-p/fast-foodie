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
    deleteById: (id: string) => `/users/${id}`,
    updateById: (id: string) => `/users/${id}`,
  },
  address: {
    create: '/address',
    getById: (id: string) => `/address/${id}`,
    deleteById: (id: string) => `/address/${id}`,
    updateById: (id: string) => `/address/${id}`,
  },
  media: {
    upload: '/file-upload',
  },
};
