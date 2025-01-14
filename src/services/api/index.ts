import { AuthApiService } from './authService';
import { CollaboratorApiService } from './collaboratorService';
import { DishApiService } from './dishService';
import { FoodApiService } from './foodService';
import { MediaApiService } from './mediaService';
import { UserApiService } from './userService';

export const ApiService = {
  auth: AuthApiService,
  users: UserApiService,
  medias: MediaApiService,
  foods: FoodApiService,
  dishes: DishApiService,
  collaborators: CollaboratorApiService,
};
