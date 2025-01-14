import { Col, Layout, P14 } from '@/components';
import { Button } from '@/components/ui/button';
import { useDishContext } from '@/contexts';
import { Dish } from '@/types/dto/Dish';
import { useTranslation } from 'next-i18next';
import { DishesCard } from '../components/Dishes/DishesCard';

export function WeeklyDishPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { weeklyDishes, clearWeeklyDishes } = useDishContext();

  return (
    <Layout id="scrollable">
      <Col className="items-center gap-5 mt-5">
        {weeklyDishes.length === 0 ? 
          <P14 className='text-primary mt-20 text-center w-full'>
            {t('generics.noResults')}
          </P14>
        : weeklyDishes.map((dish: Dish) => (
          <DishesCard key={dish.id} dish={dish}/>
        ))}
      </Col>
      <Button disabled={weeklyDishes.length === 0} className={'fixed bg-primary/90 bottom-20 right-2'} onClick={() => clearWeeklyDishes()}>
        {t('dishes:removeAll')}
      </Button>
    </Layout>
  );
}
