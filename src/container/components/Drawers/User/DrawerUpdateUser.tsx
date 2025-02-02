import { DrawerMotion } from '@/components/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { UpdateUserApi } from '@/types';
import { userValidation } from '@/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { RowBetween } from '@/components';
import ImageUpload from '@/components/Inputs/ImageUpload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts';
import { formatValidationErrorMessage } from '@/services/error';

interface DrawerUpdateUserProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerUpdateUser(props: DrawerUpdateUserProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, refreshUser } = useAuthContext();

  const form = useForm<UpdateUserApi>({
    resolver: yupResolver(userValidation.update),
    mode: 'onTouched',
  });

  const { mutate: updateEvent, isPending } = useMutation({
    mutationFn: (data: UpdateUserApi) => ApiService.users.updateMe(data),
    onSuccess: (data) => {
      refreshUser();
      toast({
        title: t('valid:api.user.updatedSuccess'),
      });
      form.reset();
      queryClient.refetchQueries({
        queryKey: ['user'],
        exact: false,
        type: 'all',
      });
      onClose();
    },

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      formatValidationErrorMessage(error.data.errors, form.setError);
      toast({
        title: t(error.data.response.title),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        ...currentUser,
        userName: currentUser.userName ?? '',
        profilePicture: currentUser.profilePicture?.url ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!currentUser) {
    return <></>;
  }

  return (
    <DrawerMotion
      className='relative h-min'
      isOpen={isOpen}
      onClose={onClose}
      title={t('user:update.title')}
    >
      <Content className={className}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => updateEvent({ ...values }))}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='userName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:userName.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:userName.placeholder')}
                      enterKeyHint='next'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='profilePicture'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:profilePicture.label')}</FormLabel>
                  <ImageUpload
                    onFavoriteChange={(v) => form.setValue('profilePicture', v)}
                    favorite={form.watch('profilePicture')}
                    onImageUpload={(v) => {
                      if (!v.length) {
                        return;
                      }
                      const image = v[0];
                      field.onChange(image.id);
                    }}
                    multiple={false}
                    defaultValue={
                      currentUser.profilePicture && [currentUser.profilePicture]
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <RowBetween className='mt-10 gap-2'>
              <Button className='w-full z-50' type='button' onClick={onClose}>
                {t('generics.cancel')}
              </Button>
              <Button
                disabled={isPending || !form.formState.isValid}
                className='w-full z-50'
                isLoading={isPending}
                type='submit'
              >
                {t('generics.update')}
              </Button>
            </RowBetween>
          </form>
        </Form>
      </Content>
    </DrawerMotion>
  );
}

const Content = tw.div`
  px-4
  pb-5
`;

const InputStyled = tw(Input)`
`;
