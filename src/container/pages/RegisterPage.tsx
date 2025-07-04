import { useToast } from '@/components/ui/use-toast';
import { formatValidationErrorMessage } from '@/services/error';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import 'swiper/css';
import tw from 'tailwind-styled-components';
import {
  Col,
  ColCenter,
  Grid2,
  H1,
  InputPassword,
  P14,
  Row,
} from '../../components';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { useAuthContext } from '../../contexts';
import { ROUTES } from '../../routes';
import { ApiService } from '../../services/api';
import { AuthRegisterUi } from '../../types';
import { userValidationUi } from '../../validations';

export default function RegisterPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { currentUser, setToken } = useAuthContext();
  const { toast } = useToast();

  const { mutate: registerUser, isPending } = useMutation({
    mutationFn: ApiService.auth.register,
    onSuccess: (data) => {
      setToken(data);
      router.push(ROUTES.dishes.index);
    },
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
    if (!currentUser) return;
    router.push(ROUTES.dishes.index);
  }, [currentUser]);

  const form = useForm<AuthRegisterUi>({
    resolver: yupResolver(userValidationUi.create),
    mode: 'onTouched',
  });

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
            className='bg-background'
            onClick={() => router.push(ROUTES.auth.login)}
          >
            {t('generics.login')}
          </Button>
        </Row>
        <ColCenter className='h-full justify-center'>
          <Col className='lg:w-1/2 w-full gap-2 lain_background px-4 py-10 rounded'>
            <H1 className='font-bold text-center text-3xl'>
              {t('auth.register.title')}
            </H1>
            <P14 className='text-center text-primary/80'>
              {t('auth.register.subtitle')}
            </P14>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => registerUser(values))}
                className='space-y-3 mt-2'
              >
                <Grid2>
                  <FormField
                    control={form.control}
                    name='userName'
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields:userName.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('fields:userName.placeholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Grid2>
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
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields:confirmPassword.label')}</FormLabel>
                      <FormControl>
                        <InputPassword
                          placeholder={t('fields:confirmPassword.placeholder')}
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
                  {t('generics.register')}
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
  background
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
