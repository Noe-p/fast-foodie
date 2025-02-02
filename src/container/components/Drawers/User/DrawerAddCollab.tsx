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

interface DrawerAddCollabProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerAddCollab(props: DrawerAddCollabProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, refreshUser } = useAuthContext();

  const form = useForm<UpdateUserApi>({
    resolver: yupResolver(userValidation.update),
    mode: 'onTouched',
  });

  const { mutate: addCollab, isPending } = useMutation({
    mutationFn: (data: UpdateUserApi) => ApiService.users.updateMe(data),
    onSuccess: (data) => {
      refreshUser();
      form.reset();
      onClose();
      toast({
        title: t('toast:collaborator.add.success'),
      });
      queryClient.refetchQueries({
        queryKey: ['user'],
        exact: false,
        type: 'all',
      });
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
        userName: currentUser.userName,
        profilePicture: undefined,
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
      title={t('user:title')}
    >
      <Content className={className}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => addCollab({ ...values }))}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='collaboratorName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:collaborator.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:collaborator.placeholder')}
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
                {t('user:collaborator.add')}
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
