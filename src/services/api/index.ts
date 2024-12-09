import { AuthApiService } from './authService';
import { MediaApiService } from './mediaService';
import { UserApiService } from './userService';

export const ApiService = {
  auth: AuthApiService,
  users: UserApiService,
  medias: MediaApiService,
};
