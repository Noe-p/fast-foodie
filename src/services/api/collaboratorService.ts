import { ApiResponse, Collaborator, CollaboratorApi, User } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const get = async (): Promise<User[]> => {
  return (await HttpService.get(API_ROUTES.collaborators.get)).data;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.collaborators.delete, id);
};

const create = async (payload: CollaboratorApi): Promise<Collaborator> => {
  return (await HttpService.post(API_ROUTES.collaborators.create, payload)).data;
}

export const CollaboratorApiService = {
  get,
  remove,
  create,
};
