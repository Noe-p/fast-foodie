import { Col, Layout, P14, Row, RowBetween, RowCenter } from '@/components';
import { Table } from '@/components/Table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts';
import { useDishContext } from '@/contexts/DishContext';
import { ROUTES } from '@/routes';
import { areSimilar } from '@/services/utils';
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
    search: '',
    tag: '',
    chef: '',
  });
  const [chefs, setChefs] = useState<string[]>([]);
  const { dishes, tags, isLoading, hasData, refresh } = useDishContext();

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
        if (filters.search && !areSimilar(filters.search, dish.name, false))
          return false;
        if (filters.chef && dish.chef.userName !== filters.chef) return false;
        if (!chefs.includes(dish.chef.userName)) return false;
        return true;
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  useEffect(() => {
    const savedFilters = window.localStorage.getItem('filters');

    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters && typeof parsedFilters === 'object') {
          setFilters((prevFilters) => ({
            ...prevFilters,
            tag: parsedFilters.tag || '',
            chef: parsedFilters.chef || '',
          }));
        }
      } catch (e) {
        console.error('[D] Error parsing filters', e);
      }
    }
  }, []);

  useEffect(() => {
    if (filters.tag || filters.chef) {
      const newFilters = {
        tag: filters.tag,
        chef: filters.chef,
      };
      window.localStorage.setItem('filters', JSON.stringify(newFilters));
    }
  }, [filters.tag, filters.chef]);

  return (
    <Layout>
      <Tabs defaultValue='card'>
        <Col className='lain_background top-0 left-0 w-full p-3 fixed z-20 shadow-lg'>
          <RowBetween className=''>
            <Input
              icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
              className='w-full'
              isRemovable
              placeholder={t('generics.search')}
              onChange={(v) => {
                setFilters({ ...filters, search: v });
              }}
              value={filters.search}
            />
            <FilterDishDrawer
              setFilters={setFilters}
              filters={filters}
              tags={tags.filter((tag) => tag)}
              chefs={chefs}
            />
          </RowBetween>
          {(filters.chef || filters.tag) && (
            <Row className='mt-2 gap-1 items-end'>
              <P14 className='text-primary/80'>
                {t('generics.filters') + ' :'}
              </P14>
              {filters.chef && (
                <Badge
                  onClick={() => {
                    setFilters({ ...filters, chef: '' });
                    window.localStorage.setItem(
                      'filters',
                      JSON.stringify({ ...filters, chef: '' })
                    );
                  }}
                  variant={'active'}
                >
                  {filters.chef}
                </Badge>
              )}
              {filters.tag && (
                <Badge
                  onClick={() => {
                    setFilters({ ...filters, tag: '' });
                    window.localStorage.setItem(
                      'filters',
                      JSON.stringify({ ...filters, tag: '' })
                    );
                  }}
                  variant={'active'}
                >
                  {filters.tag}
                </Badge>
              )}
            </Row>
          )}
        </Col>

        <div className='pt-20'>
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
            <div>
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
                  {isLoading || !hasData ? (
                    <div className='space-y-4'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`table-skeleton-${i}`}
                          className='flex items-center space-x-4'
                        >
                          <Skeleton className='h-12 w-12 rounded-full' />
                          <div className='space-y-2 flex-1'>
                            <Skeleton className='h-4 w-[250px]' />
                            <Skeleton className='h-4 w-[200px]' />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table
                      columns={dishColumns}
                      data={filterDishes(filters, dishes) ?? []}
                      redirection={(id) => {
                        router.push(`${ROUTES.dishes.detail(id)}?dish=true`);
                      }}
                    />
                  )}
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
                    {isLoading || !hasData
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <DishesCard key={`skeleton-${i}`} />
                        ))
                      : filterDishes(filters, dishes)?.map((dish: Dish, i) => (
                          <DishesCard
                            id={dish.id}
                            from='dish'
                            key={dish.id}
                            dish={dish}
                          />
                        ))}
                  </Col>
                </motion.div>
              </TabsContent>
            </div>
          </PullToRefresh>
        </div>
      </Tabs>
    </Layout>
  );
}
