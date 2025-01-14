'use client';
import { Col } from '@/components/Helpers/Helpers';
import { ApiService } from '@/services/api';
import { MediaDto } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import tw from 'tailwind-styled-components';
import { P14 } from '..';
import { Input } from '../ui/input';
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
  const { t } = useTranslation();
  const { toast } = useToast();

  const { mutate: fileUpload, isPending } = useMutation({
    mutationFn: ApiService.medias.fileUpload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: t('toast:file.upload.error'),
        description: t(error.message),
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      setUploadedFiles((prevUploadedFiles) => {
        return multiple ? [...prevUploadedFiles, data] : [data];
      });
    },
  });

  useEffect(() => {
    if (defaultValue) {
      setUploadedFiles(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onImageUpload(uploadedFiles.map((file) => file));
    const favoriteFile = uploadedFiles.find((file) => file.id === favorite);
    if (!favoriteFile && uploadedFiles.length > 0 && onFavoriteChange) {
      onFavoriteChange(uploadedFiles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles]);

  async function removeFile(file: MediaDto) {
    try {
      await ApiService.medias.fileRemove(file.id);
      setUploadedFiles((prevUploadedFiles) => {
        return prevUploadedFiles.filter((item) => item.id !== file.id);
      });
    }
    catch (error: any) {
      toast({
        title: t('toast:file.upload.error'),
        description: t(error.data.message),
        variant: 'destructive',
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await Promise.all(
      acceptedFiles.map(async (file) => {
        fileUpload(file);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div>
        <label
          {...getRootProps()}
          className='relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 '
        >
          <div className='text-center '>
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

        <Input
          {...getInputProps()}
          id='dropzone-file'
          accept='image/*'
          type='file'
          className='hidden'
          multiple={multiple}
        />
      </div>

      <div className='mt-3'>
        {uploadedFiles.length > 0 && (
          <P14 className='text-foreground'>{t('file.filesUploaded')}</P14>
        )}
        <div className='flex flex-wrap mt-2 space-x-1 '>
          {isPending ? (
            <div className='flex justify-center'>
              <Loader2 className='w-6 h-6 animate-spin' />
            </div>
          ) : (
            uploadedFiles.map((file) => {
              return (
                <ImageCard
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const Image = tw.img`
  w-15
  h-15
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
