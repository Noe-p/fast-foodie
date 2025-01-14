import { ColCenter, H2 } from '@/components';
import { useToast } from '@/components/ui/use-toast';
import { DrawerType, useAppContext, useDishContext } from '@/contexts';
import { IMAGE_FALLBACK } from '@/static/constants';
import { Dish } from '@/types/dto/Dish';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { setWeeklyDishes, weeklyDishes } = useDishContext();

  const isWeeklyDish = weeklyDishes.some((d) => d.id === dish.id);
  
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
          if (isWeeklyDish) {
            setWeeklyDishes(weeklyDishes.filter((d) => d.id !== dish.id));
            return;
          }
          setWeeklyDishes([...weeklyDishes, dish]);
        }}
      > 
        <CalendarCheck size={18} />
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
  bottom-3
  bg-primary
  text-white
  h-10
  w-10
  rounded-full
  shadow-md
  flex 
  items-center
  justify-center
`;
