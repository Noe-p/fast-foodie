import { AuthLoginApi, RegisterApi } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const register = async (payload: RegisterApi): Promise<string> => {
  return (await HttpService.post(API_ROUTES.auth.register, payload)).data
    .token;
};

const login = async (payload: AuthLoginApi): Promise<string> => {
  return (await HttpService.post(API_ROUTES.auth.login, payload)).data
    .token;
};

const logout = async (): Promise<void> => {
  await HttpService.post(API_ROUTES.auth.logout);
}

export const AuthApiService = {
  login,
  register,
  logout,
};
