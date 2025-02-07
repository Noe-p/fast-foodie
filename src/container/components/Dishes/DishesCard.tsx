import { ColCenter, H2, ImageLoader } from '@/components';
import { useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { IMAGE_FALLBACK } from '@/static/constants';
import { Dish } from '@/types/dto/Dish';
import { CalendarCheck } from 'lucide-react';
import router from 'next/router';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';

interface DishesCardProps {
  className?: string;
  dish: Dish;
  from?: 'user' | 'weekly' | 'dish';
}

export function DishesCard(props: DishesCardProps): JSX.Element {
  const { className, dish, from = 'dish' } = props;
  const { t } = useTranslation();
  const { setWeeklyDishes, weeklyDishes } = useDishContext();

  const isWeeklyDish = weeklyDishes.some((d) => d.id === dish.id);

  const imageCover = dish.images.find(
    (image) => image.id === dish.favoriteImage
  );

  return (
    <Main
      onClick={() => {
        if (from === 'weekly') {
          router.push(`${ROUTES.dishes.detail(dish.id)}?weekly=true`);
        } else if (from === 'user') {
          router.push(`${ROUTES.dishes.detail(dish.id)}?user=${dish.chef.id}`);
        } else {
          router.push(ROUTES.dishes.detail(dish.id));
        }
      }}
      className={className}
    >
      <ImageLoader
        height={420}
        src={
          dish.images.length > 0
            ? imageCover?.url ?? IMAGE_FALLBACK
            : IMAGE_FALLBACK
        }
        alt={dish.name}
      />
      <H2 className='mt-4 w-3/4 text-center leading-none'>{dish.name}</H2>
      <WeeklyDishButton
        className={`${
          isWeeklyDish
            ? 'bg-primary text-background'
            : 'bg-transparent border border-primary/80 text-primary/80'
        }`}
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
    </Main>
  );
}

const Main = tw(ColCenter)`
  p-4
  w-full
  lain_background
  rounded-sm
  shadow-md
  relative
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
