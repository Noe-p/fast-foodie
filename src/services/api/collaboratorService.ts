import {
  CollaboratorDto,
  CreateCollaboratorApi,
  UpdateCollaboratorApi,
} from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const sendAsk = async (
  body: CreateCollaboratorApi
): Promise<CollaboratorDto> => {
  return await HttpService.post(API_ROUTES.collaborators.sendAsk, body);
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.collaborators.delete(id));
};

const accept = async (id: string): Promise<CollaboratorDto> => {
  return await HttpService.post(API_ROUTES.collaborators.accept(id));
};

const update = async (
  id: string,
  body: UpdateCollaboratorApi
): Promise<CollaboratorDto> => {
  return await HttpService.put(API_ROUTES.collaborators.update(id), body);
};

export const CollaboratorApiService = {
  remove,
  sendAsk,
  accept,
  update,
};
