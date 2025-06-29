import { Row } from '@tanstack/react-table';

import { useSetWeeklyDishes, useWeeklyDishes } from '@/hooks/useWeeklyDishes';
import { Dish } from '@/types/dto/Dish';
import { CalendarCheck } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface DishActionsProps {
  row: Row<Dish>;
}

export function DishActions(props: DishActionsProps): JSX.Element {
  const { row } = props;
  const dish = row.original;
  const { data: weeklyDishes = [] } = useWeeklyDishes();
  const setWeeklyDishes = useSetWeeklyDishes();

  const isWeeklyDish = weeklyDishes.some((d: Dish) => d.id === dish.id);
  return (
    <WeeklyDishButton
      className={`${
        isWeeklyDish
          ? 'bg-primary text-background'
          : 'bg-transparent border border-primary/80 text-primary/80'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (isWeeklyDish) {
          setWeeklyDishes.mutate(
            weeklyDishes.filter((d: Dish) => d.id !== dish.id)
          );
          return;
        }
        setWeeklyDishes.mutate([...weeklyDishes, dish]);
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
