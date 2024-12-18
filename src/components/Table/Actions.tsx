import { H1, P14 } from '@/components/Texts';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { userValidation } from '@/validations';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthLoginApi } from '@/types';
import { Col, ColCenter, Grid2, InputPassword } from '@/components';
import tw from 'tailwind-styled-components';
import { useMutation } from '@tanstack/react-query';
import {
  formatApiErrorMessage,
  formatValidationErrorMessage,
} from '@/services/error';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { currentUser, setToken } = useAuthContext();
  const [errorApi, setErrorApi] = useState<string>('');
  const { toast } = useToast();

  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ApiService.auth.login,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setErrorApi(formatApiErrorMessage(error.data.message, t));
      formatValidationErrorMessage(error.data.message, form.setError);
    },
    onSuccess: (data) => {
      setToken(data);
      router.push(ROUTES.home);
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    router.push(ROUTES.home);
  }, [currentUser]);

  const form = useForm<AuthLoginApi>({
    resolver: yupResolver(userValidation.login),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isError)
      toast({
        title: t('toast:login.error'),
        description: `${error.message} : ${error.name}`,
        variant: 'destructive',
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  return (
    <Main>
      <Col className='relative hidden md:flex'>
        <Title>{t('generics.appName')}</Title>
        <Background src='/images/header.jpg' alt='header' />
      </Col>
      <ColCenter className='h-full p-6 md:p-4 justify-center -translate-y-20 md:translate-y-0'>
        <Logo src='/logo.jpg' alt='logo' />
        <Col className='lg:w-1/2 w-full gap-2'>
          <H1 className='text-center'>{t('generics.login')}</H1>
          <P14 className='text-center text-muted'>
            {t('auth.login.subtitle')}
          </P14>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => loginUser(values))}
              className='space-y-3 mt-2'
            >
              <FormField
                control={form.control}
                name='email'
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields:email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        enterKeyHint='next'
                        placeholder={t('fields:email.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields:password.label')}</FormLabel>
                    <FormControl>
                      <InputPassword
                        enterKeyHint='go'
                        placeholder={t('fields:password.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant='outline'
                disabled={isPending}
                className='w-full'
                isLoading={isPending}
                type='submit'
              >
                {t('generics.login')}
              </Button>
              <FormMessage>{errorApi}</FormMessage>
            </form>
          </Form>
        </Col>
      </ColCenter>
    </Main>
  );
}

const Main = tw(Grid2)`
  h-screen
  w-full
  gap-0 md:gap-0
`;

const Background = tw.img`
  w-full
  h-full
  object-cover
  object-center
  z-0
  h-screen
`;

const Title = tw(H1)`
  absolute
  top-5
  left-5
  z-10
  w-full
  text-background
  lowercase
`;

const Logo = tw.img`
  w-30
  h-30
  rounded
  md:hidden
  mb-8
`;
