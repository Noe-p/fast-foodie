import { MediaDto } from '@/types';
import { API_ROUTES } from '../apiRoutes';
import { HttpService } from '../httpService';

const fileUpload = async (
  file: File,
  params?: { onUploadProgress: (progressEvent: ProgressEvent) => void }
): Promise<MediaDto> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    return (
      await HttpService.post(API_ROUTES.media.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes pour les uploads
        ...params,
      })
    ).data;
  } catch (error: any) {
    // Log détaillé pour le debugging
    console.error('Upload error:', {
      fileName: file.name,
      fileSize: file.size,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Remonter l'erreur avec plus de contexte
    throw {
      ...error,
      fileName: file.name,
      fileSize: file.size,
      originalError: error,
    };
  }
};

const fileRemove = async (id: string): Promise<void> => {
  await HttpService.delete(API_ROUTES.media.delete(id));
};

export const MediaApiService = {
  fileUpload,
  fileRemove,
};
