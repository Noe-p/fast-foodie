import { DrawerMotion } from '@/components/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import {
  formatApiErrorMessage,
  formatValidationErrorMessage,
} from '@/services/error';
import { UpdateUserApi } from '@/types';
import { userValidation } from '@/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts';
import { RowBetween } from '@/components';
import ImageUpload from '@/components/Inputs/ImageUpload';

interface DrawerUpdateUserProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerUpdateUser(props: DrawerUpdateUserProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const [errorApi, setErrorApi] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, refreshUser } = useAuthContext();

  const form = useForm<UpdateUserApi>({
    resolver: yupResolver(userValidation.update),
    mode: 'onTouched',
  });

  const { mutate: updateEvent, isPending } = useMutation({
    mutationFn: (data: UpdateUserApi) =>
      ApiService.users.updateById(currentUser?.id ?? '', data),
    onSuccess: (data) => {
      refreshUser();
      toast({
        title: t('toast:update.success'),
        description: t('toast:success.update', { name: data.firstName }),
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
      setErrorApi(formatApiErrorMessage(error.data.message, t));
      formatValidationErrorMessage(error.data.message, form.setError);
      toast({
        title: t('toast:update.error'),
        description: `${error.message} : ${error.name}`,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        ...currentUser,
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
        email: currentUser.email ?? '',
        profilePicture: currentUser.profilePicture?.id ?? '',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!currentUser) {
    return <></>;
  }

  return (
    <DrawerMotion isOpen={isOpen} onClose={onClose} title={t('user:update')}>
      <Content className={className}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => updateEvent({ ...values }))}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:firstName.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:firstName.placeholder')}
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
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:lastName.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:lastName.placeholder')}
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:email.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:email.placeholder')}
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
                      form.setValue('profilePicture', v[0]);
                    }}
                    multiple={false}
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
            <FormMessage>{errorApi}</FormMessage>
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