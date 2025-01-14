import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { Dish } from '@/types/dto/Dish';
import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';


interface State {
  dishes?: Dish[];
  weeklyDishes: Dish[];
  isPending: boolean;
}

interface Context extends State {
  setWeeklyDishes: (dishes: Dish[]) => void;
  clearWeeklyDishes: () => void;
}

const defaultState: State = {
  dishes: [],
  weeklyDishes: [],
  isPending: false,
};

const DishContext = React.createContext<Context>({
  ...defaultState,
  setWeeklyDishes: () => {
    throw new Error('DishContext.setWeeklyDishes has not been set');
  },
  clearWeeklyDishes: () => {
    throw new Error('DishContext.clearWeeklyDishes has not been set');
  },
});

function useDishProvider() {
  const { toast } = useToast();
  const [ weeklyDishes, setStateWeeklyDishes ] = useState<Dish[]>([]);
  const [ localDishes, setLocalDishes ] = useState<Dish[]>([]);

  function setWeeklyDishes(dishes: Dish[]): void {
    setStateWeeklyDishes(dishes);
    window.localStorage.setItem('weeklyDishes', JSON.stringify(dishes));
  }

  function getWeeklyDishes(): Dish[] {
    const weeklyDishes = window.localStorage.getItem('weeklyDishes');
    return weeklyDishes ? JSON.parse(weeklyDishes) : [];
  }

  function getDishes(): Dish[] {
    const dishes = window.localStorage.getItem('dishes');
    return dishes ? JSON.parse(dishes) : [];
  }

  function updateLocalDishes(newDishes: Dish[]): void {
    const oldDishes = getDishes();
    const updatedDishes = oldDishes.map(oldDish => {
      const newDish = newDishes.find(dish => dish.id === oldDish.id);
      return newDish && newDish.updatedAt !== oldDish.updatedAt ? newDish : oldDish;
    });

    newDishes.forEach(newDish => {
      if (!oldDishes.some(oldDish => oldDish.id === newDish.id)) {
        updatedDishes.push(newDish);
      }
    });

    setLocalDishes(updatedDishes);
  }

  function clearWeeklyDishes(): void {
    setStateWeeklyDishes([]);
    window.localStorage.removeItem('weeklyDishes');
  }

  useEffect(() => {
    const weeklyDishes = getWeeklyDishes();
    setStateWeeklyDishes(weeklyDishes);
    const dishes = getDishes();
    setLocalDishes(dishes);
  }, [])

  const {
    isPending,
    isError,
    isSuccess,
    error,
    data: dishes,
  } = useQuery({
    queryKey: ['getDishes'],
    queryFn: () => ApiService.dishes.get(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: t('errors:fetch.dishes'),
        description: t(error.message),
        variant: 'destructive',
      });
    }
    if(isSuccess) {
      updateLocalDishes(dishes);
      window.localStorage.setItem('dishes', JSON.stringify(dishes));
    }
  }, [isError, isSuccess])


  return {
    dishes: localDishes,
    isPending,
    weeklyDishes,
    setWeeklyDishes,
    clearWeeklyDishes,
  };
}

interface Props {
  children: React.ReactNode;
}

export const DishProvider = ({ children }: Props): JSX.Element => {
  const context: Context = useDishProvider();

  return (
    <DishContext.Provider value={context}>
      {children}
    </DishContext.Provider>
  );
};

export const useDishContext = (): Context => React.useContext(DishContext);
