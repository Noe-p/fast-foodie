import { ColCenter, H2, ImageLoader } from '@/components';
import { Skeleton } from '@/components/ui/skeleton';
import { useDishContext } from '@/contexts';
import { IMAGE_FALLBACK } from '@/static/constants';
import { Dish } from '@/types/dto/Dish';
import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { DrawerDetailDish } from '../Drawers';

interface DishesCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  dish?: Dish;
  from?: 'user' | 'weekly' | 'dish';
}

export function DishesCard(props: DishesCardProps): JSX.Element {
  const { className, dish, from = 'dish' } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { setWeeklyDishes, weeklyDishes } = useDishContext();

  const isWeeklyDish = weeklyDishes.some((d) => d.id === dish?.id);

  const imageCover = dish?.images.find(
    (image) => image.id === dish.favoriteImage
  );

  return (
    <Main onClick={() => setIsOpen(true)} className={className} {...props}>
      {!dish ? (
        <Skeleton className='h-[420px] w-full rounded-md' />
      ) : (
        <ImageLoader
          height={420}
          width={315}
          quality={80}
          src={
            dish.images.length > 0
              ? imageCover?.url ?? IMAGE_FALLBACK
              : IMAGE_FALLBACK
          }
          alt={dish.name}
        />
      )}
      {dish ? (
        <H2 className='mt-4 w-3/4 text-center leading-none'>{dish.name}</H2>
      ) : (
        <Skeleton className='mt-4 w-3/4 h-10' />
      )}
      {dish && (
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
      )}
      <DrawerDetailDish
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dish={dish}
      />
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
