import { UpdateUserApi, User } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const me = async (): Promise<User> => {
  return (await HttpService.get(API_ROUTES.users.me)).data;
};

const updateMe = async (payload: UpdateUserApi): Promise<User> => {
  return (await HttpService.patch(API_ROUTES.users.update, payload)).data;
};

const deleteMe = async (): Promise<void> => {
  await HttpService.delete(API_ROUTES.users.delete);
};

const removeCollaborator = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.users.removeCollaborator(id));
}

export const UserApiService = {
  me,
  updateMe,
  deleteMe,
  removeCollaborator,
};
