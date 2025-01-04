import { Col, Layout, P14 } from '@/components';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts';
import { ApiService } from '@/services/api';
import { LocalSearchParams } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { DishesCard } from '../components/Dishes/DishesCard';

export function WeeklyDishPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const [ filters , setFilters ] = useState<LocalSearchParams>({
    search: undefined,
    tag: undefined,
    chef: undefined,
  });
  const [ tags, setTags ] = useState<string[]>([]);
  const [ chefs, setChefs ] = useState<string[]>([]);

  const {
    isPending,
    isError,
    isSuccess,
    error,
    data: dishes,
  } = useQuery({
    queryKey: ['getWeeklyDishes'],
    queryFn: ApiService.dishes.get,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: t('errors:fetch.dishes'),
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [isError])


  function filterDishes( filters: LocalSearchParams, dishes?: Dish[]): Dish[] {
    if (!dishes) return [];
    return dishes.filter((dish) => {
      if (dish.weeklyDish) return true;
      return false;
    });
  }

  return (
    <Layout id="scrollable">
      <Col className="items-center gap-5 mt-5">
        {isPending ? 
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        : filterDishes(filters, dishes)?.length === 0 ? 
          <P14 className='text-primary mt-20 text-center w-full'>
            {t('generics.noResults')}
          </P14>
        : filterDishes(filters, dishes)?.map((dish: Dish) => (
          <DishesCard key={dish.id} dish={dish}/>
        ))}
      </Col>
    </Layout>
  );
}
