import { ApiResponse, CreateDishApi, UpdateDishApi, UpdateUserApi, User } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';
import { Dish } from '@/types/dto/Dish';

const get = async (): Promise<Dish> => {
  return (await HttpService.get(API_ROUTES.dishes.get)).data;
};

const update = async (payload: UpdateDishApi, id:string): Promise<Dish> => {
  return (await HttpService.patch(API_ROUTES.dishes.update(id), payload)).data;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.dishes.delete, id);
};

const create = async (payload: CreateDishApi): Promise<Dish> => {
  return (await HttpService.post(API_ROUTES.dishes.create, payload)).data;
}

export const DishApiService = {
  get,
  update,
  remove,
  create,
};
