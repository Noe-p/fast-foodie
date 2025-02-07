import { Col, H2, Layout, P14, Row } from '@/components';
import { Table } from '@/components/Table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { Dish } from '@/types/dto/Dish';
import { motion } from 'framer-motion';
import { AlignJustify, Grid2X2, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import { DishesCard } from '../components/Dishes/DishesCard';
import { dishColumns } from '../components/Tables';

export function WeeklyDishPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { weeklyDishes, clearWeeklyDishes } = useDishContext();

  return (
    <Layout id='scrollable'>
      <Tabs defaultValue='card'>
        <Row className='justify-between lain_background p-3 rounded-sm shadow-md items-center mt-2 mb-5'>
          <H2>{t('weeklyDish')}</H2>
          <TabsList>
            <TabsTrigger value='card'>
              <Grid2X2 size={20} />
            </TabsTrigger>
            <TabsTrigger value='list'>
              <AlignJustify size={20} />
            </TabsTrigger>
          </TabsList>
        </Row>
        <TabsContent value='list'>
          <motion.div
            initial={{
              x: 100,
            }}
            animate={{
              x: 0,
            }}
            transition={{
              duration: 0.2,
              type: 'spring',
              damping: 13,
              stiffness: 150,
            }}
          >
            <Table
              columns={dishColumns}
              data={weeklyDishes ?? []}
              redirection={(id) => {
                router.push(`${ROUTES.dishes.detail(id)}?weekly=true`);
              }}
            />
          </motion.div>
        </TabsContent>
        <TabsContent value='card'>
          <motion.div
            initial={{
              x: 100,
            }}
            animate={{
              x: 0,
            }}
            transition={{
              duration: 0.2,
              type: 'spring',
              damping: 13,
              stiffness: 150,
            }}
          >
            <Col className='items-center gap-5 mt-5'>
              {weeklyDishes.length === 0 ? (
                <P14 className='text-primary mt-20 text-center w-full'>
                  {t('generics.noResults')}
                </P14>
              ) : (
                weeklyDishes.map((dish: Dish) => (
                  <DishesCard from={'weekly'} key={dish.id} dish={dish} />
                ))
              )}
            </Col>
          </motion.div>
        </TabsContent>

        <Button
          disabled={weeklyDishes.length === 0}
          className={'fixed bg-primary/90 bottom-23 right-2 gap-2'}
          onClick={() => clearWeeklyDishes()}
        >
          <Trash2Icon size={15} />
          {t('dishes:removeAll')}
        </Button>
      </Tabs>
    </Layout>
  );
}
