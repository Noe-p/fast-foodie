import { useToast } from '@/components/ui/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import {
  Col,
  InputTags,
  Layout,
  P16,
  P18,
  Row,
  RowBetween,
  TextEditor,
  Toggle,
} from '@/components';
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
import { useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { ApiService } from '@/services/api';
import { formatValidationErrorMessage } from '@/services/error';
import { DishStatus, IngredientUnit, MediaDto, UpdateDishApi } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { dishValidation } from '@/validations/dish';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import router from 'next/router';
import { useEffect } from 'react';

interface UpdateDishPageProps {
  dish: Dish;
  className?: string;
}

export function UpdateDishPage(props: UpdateDishPageProps): React.JSX.Element {
  const { dish, className } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const { refresh } = useDishContext();

  const form = useForm<UpdateDishApi>({
    resolver: yupResolver(dishValidation.update),
    mode: 'onTouched',
    defaultValues: {
      name: dish?.name ?? '',
      instructions: dish?.instructions ?? '',
      ingredients:
        dish?.ingredients?.map((ingredient) => ({
          foodId: ingredient.food.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })) ?? [],
      tags: dish?.tags ?? [],
      imageIds: dish?.images.map((image) => image.id) ?? [],
      status: dish?.status ?? DishStatus.PUBLIC,
      ration: dish?.ration ?? 2,
    },
  });

  const { mutate: UpdateDish, isPending } = useMutation({
    mutationFn: (values: UpdateDishApi) => {
      if (values.ingredients) {
        values.ingredients = values.ingredients.map((ingredient) => {
          if (ingredient.quantity && !ingredient.unit) {
            // Si une quantité est présente mais pas d'unité, on définit l'unité par défaut
            return {
              ...ingredient,
              unit: IngredientUnit.UNIT,
            };
          }
          return ingredient;
        });
      }

      return ApiService.dishes.update(values, dish?.id ?? '');
    },
    onSuccess: (dish) => {
      form.reset();
      refresh();
      router.push(ROUTES.dishes.index);
      toast({
        title: t('toast:dish.update'),
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
    if (dish) {
      const ingredients =
        dish.ingredients?.map((ingredient) => ({
          foodId: ingredient.food.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })) || [];

      form.reset({
        name: dish.name ?? '',
        instructions: dish.instructions ?? '',
        ingredients,
        tags: dish.tags ?? [],
        imageIds: dish.images.map((image) => image.id) ?? [],
        status: dish.status ?? DishStatus.PUBLIC,
        ration: dish.ration ?? 2,
        weeklyDish: dish.weeklyDish ?? false,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dish]);

  return (
    <Layout className={'lain_background p-0'}>
      <RowBetween className='bg-primary fixed top-0 z-20 w-full items-center px-3 py-5'>
        <Row
          className='items-center'
          onClick={() => router.push(ROUTES.dishes.index)}
        >
          <ChevronLeft className='text-background' size={30} />
          <P16 className='text-background translate-y-0.5'>
            {t('generics.back')}
          </P16>
        </Row>
        <P18 className='text-background'>
          {dish.name.substring(0, 25)}
          {dish.name.length > 25 && '...'}
        </P18>
      </RowBetween>
      <Content className={className}>
        <motion.div
          initial={{
            x: 100,
          }}
          animate={{
            x: 0,
          }}
          transition={{
            duration: 0.2,
            type: 'spring',
            damping: 13,
            stiffness: 150,
          }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                UpdateDish({ ...values })
              )}
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
                      defaultValue={dish.images}
                      onFavoriteChange={(v) =>
                        form.setValue('favoriteImage', v)
                      }
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
                      defaultValues={dish.ingredients}
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
                {t('dishes:update.submit')}
              </Button>
            </form>
          </Form>
        </motion.div>
      </Content>
    </Layout>
  );
}

const Content = tw(Col)`
  px-3
  pb-25
  pt-23
`;
