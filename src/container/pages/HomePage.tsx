import { Col, Layout, P14, RowBetween } from '@/components';
import { Input } from '@/components/ui/input';
import { useAuthContext, useDishContext } from '@/contexts';
import { LocalSearchParams } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { Loader2, SearchIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { FilterDishDrawer } from '../components';
import { DishesCard } from '../components/Dishes/DishesCard';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [ filters , setFilters ] = useState<LocalSearchParams>({
    search: undefined,
    tag: undefined,
    chef: undefined,
  });
  const [ tags, setTags ] = useState<string[]>([]);
  const [ chefs, setChefs ] = useState<string[]>([]);
  const { dishes, isPending } = useDishContext();

  useEffect(() => {
    if (dishes) {
      const allTags = dishes?.map((dish) => dish.tags).flat();
      const uniqueTags = Array.from(new Set(allTags));
      setTags(uniqueTags);
    }
    if(currentUser)
    setChefs([...currentUser?.collaborators.flatMap((collaborator) => collaborator.userName),currentUser.userName]);
  }, [dishes, currentUser]);

  function filterDishes( filters: LocalSearchParams, dishes?: Dish[]): Dish[] {
    if (!dishes) return [];
    return dishes.filter((dish) => {
      if (filters.tag && !dish.tags.includes(filters.tag)) return false;
      if (filters.search && !dish.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.chef && dish.chef.userName !== filters.chef) return false;
      return true;
    });
  }

  return (
    <Layout id="scrollable">
      <RowBetween className='lain_background w-full p-5 rounded-sm shadow-md'>
        <Input
          icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
          className='w-full'
          placeholder={t('generics.search')} 
          onChange={(v) => {
                      setFilters({ ...filters, search: v.target.value });
                    }}
        />
        <FilterDishDrawer setFilters={setFilters} filters={filters} tags={tags.filter(tag=> tag)} chefs={chefs}/>
      </RowBetween>
      <Col className="items-center gap-5 mt-5">
        {isPending ? 
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        : filterDishes(filters, dishes)?.length === 0 ? 
          <P14 className='text-primary mt-20 text-center w-full'>
            {t('generics.noResults')}
          </P14>
        : filterDishes(filters, dishes)?.map((dish: Dish) => (
          <DishesCard key={dish.id} dish={dish}/>
        ))}
      </Col>
    </Layout>
  );
}
