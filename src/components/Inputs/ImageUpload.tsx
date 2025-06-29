'use client';

import { Col } from '@/components/Helpers/Helpers';
import { ApiService } from '@/services/api';
import { cn } from '@/services/utils';
import { MediaDto } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import tw from 'tailwind-styled-components';
import { P14 } from '..';
import { useToast } from '../ui/use-toast';

export interface ImageUploadProps {
  onImageUpload: (files: MediaDto[]) => void;
  defaultValue?: MediaDto[];
  favorite?: string;
  onFavoriteChange?: (favorite: string) => void;
  multiple?: boolean;
}

export default function ImageUpload(props: ImageUploadProps) {
  const {
    onImageUpload,
    defaultValue,
    multiple = true,
    favorite,
    onFavoriteChange,
  } = props;

  const [uploadedFiles, setUploadedFiles] = useState<MediaDto[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]); // Nouvel état pour les fichiers en cours d'upload
  const { t } = useTranslation();
  const { toast } = useToast();

  const { mutate: fileUpload } = useMutation({
    mutationFn: ApiService.medias.fileUpload,
    onError: (error: any) => {
      console.error('ImageUpload error:', error);

      // Gestion spécifique des différents types d'erreurs
      let errorMessage = t('toast:file.upload.error');

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage =
          t('toast:file.upload.timeout') ||
          'Upload timeout - fichier trop volumineux';
      } else if (error.response?.status === 413) {
        errorMessage =
          t('toast:file.upload.tooLarge') || 'Fichier trop volumineux';
      } else if (error.response?.status >= 500) {
        errorMessage = t('toast:file.upload.serverError') || 'Erreur serveur';
      } else if (error.fileName) {
        errorMessage = `Erreur lors de l'upload de ${error.fileName}`;
      }

      toast({
        title: errorMessage,
        description:
          error.response?.data?.message || error.message || 'Erreur inconnue',
        variant: 'destructive',
      });

      // Nettoyer le fichier en cours d'upload en cas d'erreur
      if (error.fileName) {
        setUploadingFiles((prev) =>
          prev.filter((file) => file.name !== error.fileName)
        );
      }
    },
    onSuccess: (data, variables) => {
      setUploadedFiles((prev) => [...prev, data]);
      setUploadingFiles(
        (prev) => prev.filter((file) => file.name !== variables.name) // Supprime le fichier en cours d'upload
      );
    },
  });

  const prevUploadedFiles = useRef(uploadedFiles);

  useEffect(() => {
    if (defaultValue) {
      setUploadedFiles(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    // Ne mettre à jour onImageUpload que si la liste des fichiers a changé
    if (
      JSON.stringify(uploadedFiles) !==
      JSON.stringify(prevUploadedFiles.current)
    ) {
      onImageUpload(uploadedFiles.map((file) => file));
      prevUploadedFiles.current = uploadedFiles; // Mettre à jour la référence
    }

    const favoriteFile = uploadedFiles.find((file) => file.id === favorite);
    if (!favoriteFile && uploadedFiles.length > 0 && onFavoriteChange) {
      onFavoriteChange(uploadedFiles[0].id);
    }
  }, [uploadedFiles, favorite, onFavoriteChange]);

  const removeFile = async (file: MediaDto) => {
    try {
      await ApiService.medias.fileRemove(file.id);
      setUploadedFiles((prev) => prev.filter((item) => item.id !== file.id));
    } catch (error: any) {
      toast({
        title: t('toast:file.upload.error'),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Validation des fichiers avant upload
      const validFiles = acceptedFiles.filter((file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB max
        if (file.size > maxSize) {
          toast({
            title: t('toast:file.upload.tooLarge'),
            description: `${file.name} dépasse la taille maximale de 10MB`,
            variant: 'destructive',
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Ajouter les nouveaux fichiers uniquement si nécessaire
      setUploadingFiles((prev) => {
        const newFiles = validFiles.filter(
          (file) => !prev.some((existing) => existing.name === file.name)
        );
        return [...prev, ...newFiles];
      });

      validFiles.forEach((file) => {
        fileUpload(file);
      });
    },
    [fileUpload, toast, t]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: multiple,
  });

  return (
    <div>
      <div>
        <label
          {...getRootProps()}
          className='relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
        >
          <div className='text-center'>
            <div className='p-2 mx-auto border rounded-md max-w-min'>
              <Upload className='text-gray-600' size={20} />
            </div>

            <p className='mt-2 text-sm text-gray-600'>
              <span className='font-semibold'>{t('file.upload.drag')}</span>
            </p>
            <p className='text-xs text-gray-500'>
              {t('file.upload.description')}
            </p>
          </div>
        </label>

        <input
          {...getInputProps()}
          id='dropzone-file'
          accept='image/*'
          type='file'
          className='hidden'
          multiple={multiple}
        />
      </div>

      <div className='mt-3'>
        {(uploadedFiles.length > 0 || uploadingFiles.length > 0) && (
          <P14 className='text-foreground'>{t('file.filesUploaded')}</P14>
        )}
        <div className='flex flex-wrap mt-2 space-x-1'>
          {uploadingFiles.map((file) => (
            <ImageCard key={file.name}>
              <Image src={URL.createObjectURL(file)} alt={file.name} />
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30'>
                <Loader2 className='w-6 h-6 animate-spin text-white' />
              </div>
              <RemoveButton
                onClick={() => {
                  setUploadingFiles((prev) =>
                    prev.filter((f) => f.name !== file.name)
                  );
                }}
              >
                <X size={15} />
              </RemoveButton>
            </ImageCard>
          ))}
          {uploadedFiles.map((file) => (
            <ImageCard
              className={cn(favorite === file.id && 'border-2 border-primary')}
              onClick={(e) => {
                e.preventDefault();
                onFavoriteChange && onFavoriteChange(file.id);
              }}
              key={file.id}
            >
              <Image src={file.url} alt={file.filename} />
              <RemoveButton onClick={() => removeFile(file)}>
                <X size={15} />
              </RemoveButton>
            </ImageCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const Image = tw.img`
  w-15
  h-20
  object-cover
  rounded-md
  border 
`;

const RemoveButton = tw(Col)`
  bg-destructive
  cursor-pointer
  hover:scale-105
  justify-center
  items-center
  text-white
  translate-x-1/2
  -translate-y-1/2
  transition-all
  md:hidden
  group-hover:flex
  absolute
  rounded-full
  top-0
  right-0
  w-5
  h-5
`;

const ImageCard = tw.div`
  w-fit
  cursor-pointer
  flex
  relative
  justify-between
  items-center
  rounded-md
  border
  border-gray-300
  group
  hover:border-gray-500
  transition-all
`;
