import { Row } from '@tanstack/react-table';


import { useDishContext } from '@/contexts';
import { Dish } from '@/types/dto/Dish';
import { CalendarCheck } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface DishActionsProps {
  row: Row<Dish>;
}

export function DishActions(props: DishActionsProps): JSX.Element {
  const { row } = props;
  const dish = row.original;
  const { setWeeklyDishes, weeklyDishes } = useDishContext();
  
  const isWeeklyDish = weeklyDishes.some((d) => d.id === dish.id);
  return (
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
        <CalendarCheck size={15} />
    </WeeklyDishButton>
  );
}

const WeeklyDishButton = tw.div`
  bg-primary
  text-white
  h-8
  w-8
  rounded-full
  shadow-md
  flex 
  items-center
  justify-center
`;
