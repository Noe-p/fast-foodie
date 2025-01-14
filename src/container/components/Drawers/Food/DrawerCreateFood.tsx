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
import { ApiService } from '@/services/api';
import { cn } from '@/services/utils';
import { AisleType, CreateFoodApi } from '@/types';
import { foodValidation } from '@/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

interface DrawerCreateFoodProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerCreateFood(
  props: DrawerCreateFoodProps
): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const [errorApi, setErrorApi] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateFoodApi>({
    resolver: yupResolver(foodValidation.create),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      aisle: '',
    },
  });

  const {
    mutate: createFood,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ApiService.foods.create,
    onSuccess: () => {
      form.reset();
      queryClient.refetchQueries({
        queryKey: ['getFoods'],
        exact: false,
        type: 'all',
      });
      onClose();
    },

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    onError: (message: any) => {
      toast({
        title: t('toast.new.error'),
        description: t(message.error),
        variant: 'destructive',
      });
      setErrorApi(message.error);
    },
  });

  return (
    <DrawerMotion className='lain_background h-min relative'  headerClassName='rounded-t-xl' isOpen={isOpen} onClose={onClose} title={t('dishes:foods.create')}>
      <Content className={className}>
        <Form {...form}>
          <form
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='name'
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel >
                    {t('fields:foodName.label')}
                  </FormLabel>
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
                  <FormLabel>
                    {t('fields:aisle.label')}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    {...field}
                  >
                    <FormControl
                      className={cn(
                        isError && 'border-destructive'
                      )}
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
              disabled={isPending || !form.formState.isValid}
              isLoading={isPending}
              type='button'
              onClick={() => createFood(form.getValues())}
            >
              {t('dishes:create.submit')}
            </Button>
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
