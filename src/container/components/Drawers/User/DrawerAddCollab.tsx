import { DrawerMotion } from '@/components/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { CollaboratorType, CreateCollaboratorApi } from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { Col, P16, RowBetween } from '@/components';
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
import { CollaboratorValidation } from '@/validations';
import { useEffect } from 'react';
interface DrawerAddCollabProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  type: CollaboratorType;
}

export function DrawerAddCollab(props: DrawerAddCollabProps): JSX.Element {
  const { className, isOpen, onClose, type } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, refreshUser } = useAuthContext();

  const form = useForm<CreateCollaboratorApi>({
    resolver: yupResolver(CollaboratorValidation.create),
    mode: 'onTouched',
    defaultValues: {
      type: type,
    },
  });

  const { mutate: addCollab, isPending } = useMutation({
    mutationFn: (data: CreateCollaboratorApi) =>
      ApiService.collaborators.sendAsk(data),
    onSuccess: (data) => {
      refreshUser();
      form.reset();
      onClose();
      toast({
        title: t('toast:collaborator.isPending.success'),
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
    form.setValue('type', type);
  }, [type]);

  if (!currentUser) {
    return <></>;
  }

  return (
    <DrawerMotion
      className='relative h-min'
      isOpen={isOpen}
      onClose={onClose}
      title={t('generics.add')}
    >
      <Content className={className}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => addCollab({ ...values }))}
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
            <P16 className='text-primary/80'>
              {type === CollaboratorType.FULL_ACCESS
                ? t('fields:collabType.fullAccess')
                : t('fields:collabType.readOnly')}
            </P16>
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

const Content = tw(Col)`
  px-4
  pb-5
`;

const InputStyled = tw(Input)`
`;
