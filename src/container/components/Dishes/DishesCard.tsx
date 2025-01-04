import { ColCenter, H2 } from '@/components';
import { useToast } from '@/components/ui/use-toast';
import { DrawerType, useAppContext } from '@/contexts';
import { ApiService } from '@/services/api';
import { IMAGE_FALLBACK } from '@/static/constants';
import { UpdateDishApi } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';


interface DishesCardProps {
  className?: string;
  dish: Dish;
}

export function DishesCard(props: DishesCardProps): JSX.Element {
  const { className, dish } = props;
  const { setDrawerOpen, setCurrentDish } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ isWeeklyDish, setIsWeeklyDish ] = useState<boolean>(dish.weeklyDish);

  const { 
    mutate: updateDish,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn:(data: UpdateDishApi) => ApiService.dishes.update(data, dish.id),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ['getWeeklyDishes'],
        exact: false,
        type: 'all',
      });
      setIsWeeklyDish(data.weeklyDish);
    },
    onError(message: any){
      toast({
        title: message?.data?.error,
        variant: 'destructive',
      });
    }
  });

  return <Main 
    onClick={()=> {
      setCurrentDish(dish);
      setDrawerOpen(DrawerType.DETAIL_DISH);
    }} 
    className={className}
    >
      <Image src={dish.images.length > 0 ? dish.images[0]?.url : IMAGE_FALLBACK} alt={dish.name} />
      <H2 className='mt-4' >{dish.name}</H2>
      <WeeklyDishButton 
        className={`${isWeeklyDish ? 'bg-primary text-background' : 'bg-transparent border border-primary/80 text-primary/80'}`}
        onClick={(e) => {
          e.stopPropagation();
          updateDish({
            weeklyDish: !isWeeklyDish,
          });
        }}
      >
        <CalendarCheck size={15} />
      </WeeklyDishButton>
  </Main>;
}

const Main = tw(ColCenter)`
  p-4
  w-full
  lain_background
  rounded-sm
  shadow-md
  relative
`;
const Image = tw.img`
  w-full
  h-90
  object-cover
  rounded-sm
`;

const WeeklyDishButton = tw.div`
  absolute
  right-4
  bottom-4
  bg-primary
  text-white
  p-2
  rounded-full
  shadow-md
`;
