import { UpdateUserApi, UserDto } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const me = async (): Promise<UserDto> => {
  return (await HttpService.get(API_ROUTES.users.me)).data;
};

const updateMe = async (payload: UpdateUserApi): Promise<UserDto> => {
  return (await HttpService.patch(API_ROUTES.users.update, payload)).data;
};

const deleteMe = async (): Promise<void> => {
  await HttpService.delete(API_ROUTES.users.delete);
};

const deleteById = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.users.deleteById(id));
};

const updateById = async (
  id: string,
  payload: UpdateUserApi
): Promise<UserDto> => {
  return (await HttpService.patch(API_ROUTES.users.updateById(id), payload))
    .data;
};

export const UserApiService = {
  me,
  updateMe,
  deleteMe,
  deleteById,
  updateById,
};
