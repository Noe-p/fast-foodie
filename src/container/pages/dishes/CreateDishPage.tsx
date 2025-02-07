import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { H1, InputTags, Layout, TextEditor, Toggle } from '@/components';
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
import { CreateIngredients } from '@/container/components';
import { useAppContext, useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { formatValidationErrorMessage } from '@/services/error';
import { CreateDishApi, DishStatus, MediaDto } from '@/types';
import { dishValidation } from '@/validations/dish';
import router from 'next/router';

interface CreateDishPageProps {
  className?: string;
}

export function CreateDishPage(props: CreateDishPageProps): React.JSX.Element {
  const { className } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const { setDrawerOpen } = useAppContext();
  const { refresh } = useDishContext();

  const form = useForm<CreateDishApi>({
    resolver: yupResolver(dishValidation.add),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      instructions: '',
      ingredients: [],
      tags: [],
      imageIds: [],
      weeklyDish: false,
      status: DishStatus.PUBLIC,
      ration: 2,
    },
  });

  const { mutate: createDish, isPending } = useMutation({
    mutationFn: ApiService.dishes.create,
    onSuccess: () => {
      form.reset();
      refresh();
      router.push(ROUTES.dishes.index);
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

  return (
    <Layout className='p-0 lain_background'>
      <Content className={className}>
        <H1 className='text-center mb-5'>{t('dishes:create.title')}</H1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createDish({ ...values }))}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='name'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:dishesName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      isRemovable
                      placeholder={t('fields:dishesName.placeholder')}
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
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:tags.label')}</FormLabel>
                  <InputTags
                    tags={field.value}
                    onChange={(v) => field.onChange(v)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='imageIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:images.label')}</FormLabel>
                  <ImageUpload
                    favorite={form.watch('favoriteImage')}
                    onFavoriteChange={(v) => form.setValue('favoriteImage', v)}
                    onImageUpload={(v: MediaDto[]) => {
                      field.onChange(v.map((file) => file.id));
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ration'
              render={({ field }) => (
                <FormItem className='flex flex-row w-full items-center justify-between'>
                  <FormLabel className='w-full'>
                    {t('fields:ration.label')}
                  </FormLabel>
                  <Input
                    className='w-14 h-7'
                    isArrow
                    iconSize={22}
                    min={1}
                    type='number'
                    onChange={(v) => field.onChange(v)}
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ingredients'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:ingredients.label')}</FormLabel>
                  <CreateIngredients
                    values={field.value}
                    onIngredientChange={(v) => {
                      field.onChange(v);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='instructions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:instructions.label')}</FormLabel>
                  <FormControl>
                    <TextEditor
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='flex flex-row w-full items-center justify-between'>
                  <FormLabel className='w-full'>
                    {t('fields:isVisible.label')}
                  </FormLabel>
                  <Toggle
                    onChange={(v) =>
                      field.onChange(
                        v === true ? DishStatus.PUBLIC : DishStatus.PRIVATE
                      )
                    }
                    value={field.value === DishStatus.PUBLIC}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending || !form.formState.isValid}
              isLoading={isPending}
              type='submit'
              className='mt-5'
            >
              {t('dishes:create.submit')}
            </Button>
          </form>
        </Form>
      </Content>
    </Layout>
  );
}

const Content = tw.div`
  px-3
  pb-25
  pt-5
  h-full
  overflow-y-scroll
`;
