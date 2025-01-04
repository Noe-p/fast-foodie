import { DrawerMotion } from '@/components/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { InputTags, TextEditor } from '@/components';
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
import { Toggle } from '@/components/ui/toggle';
import { useAppContext } from '@/contexts';
import { CreateDishApi, DishStatus, MediaDto } from '@/types';
import { dishValidation } from '@/validations/dish';
import { Eye } from 'lucide-react';
import { CreateIngredients } from '../../Inputs';

interface DrawerCreateDishProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerCreateDish(
  props: DrawerCreateDishProps
): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setDrawerOpen } = useAppContext();

  const form = useForm<CreateDishApi>({
    resolver: yupResolver(dishValidation.add),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      instructions: '',
      ingredients: [],
      tags: [],
      imageIds: undefined,
      weeklyDish: false,
      status: DishStatus.PUBLIC,
    },
  });

  const {
    mutate: createDish,
    isPending,
  } = useMutation({
    mutationFn: ApiService.dishes.create,
    onSuccess: () => {
      form.reset();
      queryClient.refetchQueries({
        queryKey: ['getDishes'],
        exact: false,
        type: 'all',
      });
      setDrawerOpen(undefined);
    },

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    onError: (message: any) => {
      toast({
        title: message.data.error,
        variant: 'destructive',
      });
    },
  });

  return (
    <DrawerMotion className='lain_background' isOpen={isOpen} onClose={()=> {
      onClose();
      form.reset();
    }} title={t('dishes:create.title')}>
      <Content className={className}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              createDish({ ...values })
            )}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='name'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel >
                    {t('fields:dishesName.label')}
                  </FormLabel>
                  <FormControl>
                    <InputStyled
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
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel >
                    {t('fields:tags.label')}
                  </FormLabel>
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
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('fields:images.label')}
                  </FormLabel>
                  <ImageUpload
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
              name='ingredients'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('fields:ingredients.label')}
                  </FormLabel>
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
                  <FormLabel>
                    {t('fields:instructions.label')}
                  </FormLabel>
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
              isRequired
              render={({ field }) => (
                <FormItem>
                  <Toggle
                    onPressedChange={(v) => field.onChange(v === true ? DishStatus.PUBLIC : DishStatus.PRIVATE)}
                    pressed={field.value === DishStatus.PUBLIC}
                    variant='outline'
                    className='w-full gap-1'
                  >
                    <Eye size={15} />
                    {t('fields:isVisible.label')}
                  </Toggle>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending || !form.formState.isValid}
              isLoading={isPending}
              type='submit'
            >
              {t('dishes:create.submit')}
            </Button>
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
