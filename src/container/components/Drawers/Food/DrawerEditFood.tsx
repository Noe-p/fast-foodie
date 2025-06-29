import { DrawerMotion } from '@/components/Drawer';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateFood } from '@/hooks';
import { formatValidationErrorMessage } from '@/services/error';
import { cn } from '@/services/utils';
import { AisleType, Food, UpdateFoodApi } from '@/types';
import { foodValidation } from '@/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

interface DrawerEditFoodProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  currentFood?: Food;
}

export function DrawerEditFood(props: DrawerEditFoodProps): JSX.Element {
  const { className, isOpen, onClose, currentFood } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateFood = useUpdateFood();

  const form = useForm<UpdateFoodApi>({
    resolver: yupResolver(foodValidation.update),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      aisle: '',
    },
  });

  useEffect(() => {
    if (currentFood) {
      form.reset({
        name: currentFood.name,
        aisle: currentFood.aisle,
      });
    }
  }, [currentFood]);

  const handleUpdateFood = () => {
    if (currentFood?.id) {
      updateFood.mutate(
        { id: currentFood.id, data: form.getValues() },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
          onError: (error: any) => {
            formatValidationErrorMessage(error.data.errors, form.setError);
          },
        }
      );
    }
  };

  return (
    <DrawerMotion
      className='h-min relative'
      isOpen={isOpen}
      onClose={onClose}
      title={t('dishes:foods.create')}
    >
      <Content className={className}>
        <Form {...form}>
          <form className='flex flex-col gap-4 w-full'>
            <FormField
              control={form.control}
              name='name'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:foodName.label')}</FormLabel>
                  <FormControl>
                    <InputStyled
                      isRemovable
                      placeholder={t('fields:foodName.placeholder')}
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
              name='aisle'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields:aisle.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    {...field}
                  >
                    <FormControl
                      className={cn(updateFood.isError && 'border-destructive')}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('fields:aisle.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(AisleType).map((aisle) => (
                          <SelectItem key={aisle} value={aisle}>
                            {t(`dishes:aisleType.${aisle}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={updateFood.isPending || !form.formState.isValid}
              isLoading={updateFood.isPending}
              type='button'
              onClick={handleUpdateFood}
            >
              {t('generics.update')}
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
