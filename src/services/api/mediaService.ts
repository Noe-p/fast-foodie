import { MediaDto } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const fileUpload = async (
  file: File,
  params?: { onUploadProgress: (progressEvent: ProgressEvent) => void }
): Promise<MediaDto> => {
  const formData = new FormData();
  formData.append('file', file);
  return (
    await HttpService.post(API_ROUTES.media.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...params,
    })
  ).data;
};

const fileRemove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.media.delete(id));
}

export const MediaApiService = {
  fileUpload,
  fileRemove,
};
