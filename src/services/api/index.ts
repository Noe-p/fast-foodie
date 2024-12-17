import collaborators from '@/pages/api/collaborators';
import { AuthApiService } from './authService';
import { DishApiService } from './dishService';
import { FoodApiService } from './foodService';
import { MediaApiService } from './mediaService';
import { UserApiService } from './userService';
import { CollaboratorApiService } from './collaboratorService';

export const ApiService = {
  auth: AuthApiService,
  users: UserApiService,
  medias: MediaApiService,
  foods: FoodApiService,
  dishes: DishApiService,
  collaborators: CollaboratorApiService,
};
