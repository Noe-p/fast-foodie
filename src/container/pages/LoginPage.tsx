import { H1, P14 } from '@/components/Texts';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { authValidation } from '@/validations';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import React, { useEffect } from 'react';
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
import { Col, ColCenter, Grid2, InputPassword, Row } from '@/components';
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
  const { toast } = useToast();

  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ApiService.auth.login,
    onSuccess: (data) => {
      setToken(data);
      router.push(ROUTES.dishes.index);
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    router.push(ROUTES.dishes.index);
  }, [currentUser]);

  const form = useForm<AuthLoginApi>({
    resolver: yupResolver(authValidation.login),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isError) {
      const errorData = error as any;
      toast({
        title: errorData?.data?.error,
        description: errorData?.data?.details ?? '',
        variant: 'destructive',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  return (
    <Main>
      <Col className='relative hidden md:flex'>
        <Title>{process.env.NEXT_PUBLIC_DEFAULT_META_TITLE}</Title>
        <Background src='/images/header.jpg' alt='header' />
      </Col>
      <Col className='p-6 md:p-4'>
        <Row className='justify-end'>
          <Button
            variant='outline'
            onClick={() => router.push(ROUTES.auth.register)}
          >
            {t('generics.register')}
          </Button>
        </Row>
        <ColCenter className='h-full justify-center'>
          <Col className='lg:w-1/2 w-full gap-2'>
            <H1 className='font-bold text-center text-3xl'>
              {t('generics.login')}
            </H1>
            <P14 className='text-center text-primary/40'>
              {t('auth.login.subtitle')}
            </P14>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => loginUser(values))}
                className='space-y-3 mt-2'
              >
                <FormField
                  control={form.control}
                  name='login'
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields:login.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder={t('fields:login.placeholder')}
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
                          placeholder={t('fields:password.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isPending}
                  className='w-full'
                  isLoading={isPending}
                  type='submit'
                >
                  {t('generics.login')}
                </Button>
              </form>
            </Form>
          </Col>
        </ColCenter>
      </Col>
    </Main>
  );
}

const Main = tw(Grid2)`
  h-screen
  w-full
  bg-white
  gap-0 md:gap-0
  bg-background
`;

const Background = tw.img`
  w-full
  h-full
  object-cover
  object-center
  z-0
`;

const Title = tw(H1)`
  text-center
  absolute
  top-1/2
  left-1/2
  transform
  -translate-x-1/2
  -translate-y-1/2
  z-10
  w-full
  text-5xl
  font-bold
  text-white
`;
