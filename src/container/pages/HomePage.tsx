import { Col, Layout, P14, Row, RowBetween, RowCenter } from '@/components';
import { Table } from '@/components/Table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext, useDishContext } from '@/contexts';
import { ROUTES } from '@/routes';
import {
  CollaboratorStatus,
  CollaboratorType,
  LocalSearchParams,
} from '@/types';
import { Dish } from '@/types/dto/Dish';
import { motion } from 'framer-motion';
import { AlignJustify, Grid2X2, Loader2, SearchIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import router from 'next/router';
import { useEffect, useState } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { FilterDishDrawer } from '../components';
import { DishesCard } from '../components/Dishes/DishesCard';
import { dishColumns } from '../components/Tables';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [filters, setFilters] = useState<LocalSearchParams>({
    search: undefined,
    tag: undefined,
    chef: undefined,
  });
  const [chefs, setChefs] = useState<string[]>([]);
  const { dishes, tags, isPending, refresh } = useDishContext();

  useEffect(() => {
    if (currentUser) {
      const collabFullAccess = [
        ...currentUser?.collaborators.filter(
          (collaborator) =>
            collaborator?.type === CollaboratorType.FULL_ACCESS &&
            collaborator?.status === CollaboratorStatus.IS_ACCEPTED
        ),
        ...currentUser?.collabSend.filter(
          (collab) =>
            collab?.type === CollaboratorType.FULL_ACCESS &&
            collab?.status === CollaboratorStatus.IS_ACCEPTED
        ),
      ];
      setChefs([
        currentUser.userName,
        ...collabFullAccess.map(
          (collab) => collab?.collaborator?.userName || collab.sender.userName
        ),
      ]);
    }
  }, [currentUser]);

  function filterDishes(filters: LocalSearchParams, dishes?: Dish[]): Dish[] {
    if (!dishes) return [];
    return dishes
      .filter((dish) => {
        if (filters.tag && !dish.tags.includes(filters.tag)) return false;
        if (
          filters.search &&
          !dish.name.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        if (filters.chef && dish.chef.userName !== filters.chef) return false;
        if (!chefs.includes(dish.chef.userName)) return false;
        return true;
        //SI Un chef d'un des plats n'est pas dans la liste des chefs, on ne l'affiche pas
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  return (
    <Layout>
      <PullToRefresh
        onRefresh={refresh}
        pullingContent={
          <RowCenter className='w-screen items-center justify-center'>
            <Loader2 className='h-8 text-primary w-8 animate-spin' />
          </RowCenter>
        }
        refreshingContent={
          <RowCenter className='w-screen items-center justify-center'>
            <Loader2 className='h-8 text-primary w-8 animate-spin' />
          </RowCenter>
        }
      >
        <Tabs defaultValue='card'>
          <Col>
            <RowBetween className='lain_background w-full p-5 rounded-sm shadow-md'>
              <Input
                icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
                className='w-full'
                placeholder={t('generics.search')}
                onChange={(v) => {
                  setFilters({ ...filters, search: v });
                }}
              />
              <FilterDishDrawer
                setFilters={setFilters}
                filters={filters}
                tags={tags.filter((tag) => tag)}
                chefs={chefs}
              />
            </RowBetween>
          </Col>

          <Row className='justify-end mt-2'>
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
                data={filterDishes(filters, dishes) ?? []}
                redirection={(id) => {
                  router.push(`${ROUTES.dishes.detail(id)}?dish=true`);
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
              <Col className='items-center gap-5'>
                {filterDishes(filters, dishes)?.length === 0 ? (
                  <P14 className='text-primary mt-20 text-center w-full'>
                    {t('generics.noResults')}
                  </P14>
                ) : (
                  filterDishes(filters, dishes)?.map((dish: Dish) => (
                    <DishesCard from='dish' key={dish.id} dish={dish} />
                  ))
                )}
              </Col>
            </motion.div>
          </TabsContent>
        </Tabs>
      </PullToRefresh>
    </Layout>
  );
}
