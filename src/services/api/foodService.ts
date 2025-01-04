import { ApiResponse, CreateFoodApi, UpdateFoodApi, UpdateUserApi, User } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';
import { Food } from '@/types/dto/Food';

const get = async (): Promise<Food[]> => {
  return (await HttpService.get(API_ROUTES.foods.get)).data;
};

const update = async (payload: UpdateFoodApi, id:string): Promise<Food> => {
  return (await HttpService.patch(API_ROUTES.foods.update(id), payload)).data;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.foods.delete, id);
};

const create = async (payload: CreateFoodApi): Promise<Food> => {
  return (await HttpService.post(API_ROUTES.foods.create, payload)).data;
}

export const FoodApiService = {
  get,
  update,
  remove,
  create,
};
