import { CreateDishApi, UpdateDishApi } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const get = async (): Promise<Dish[]> => {
  return (await HttpService.get(API_ROUTES.dishes.get)).data;
};

const update = async (payload: UpdateDishApi, id: string): Promise<Dish> => {
  return (await HttpService.patch(API_ROUTES.dishes.update(id), payload)).data;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.dishes.delete(id));
};

const create = async (payload: CreateDishApi): Promise<Dish> => {
  return (await HttpService.post(API_ROUTES.dishes.create, payload)).data;
};

const getTags = async (): Promise<string[]> => {
  return (await HttpService.get(API_ROUTES.dishes.getTags)).data;
};

const deleteTag = async (tag: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.dishes.deleteTag(tag));
};

export const DishApiService = {
  get,
  update,
  remove,
  create,
  getTags,
  deleteTag,
};
