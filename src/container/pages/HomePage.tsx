import { Col, Grid1, Layout, P12, Row, Title } from '@/components';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { DishesCard } from '../components/Dishes/DishesCard';
import { Input } from '@/components/ui/input';
import { Dish } from '@/types/dto/Dish';
import { Badge } from '@/components/ui/badge';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [ search , setSearch ] = useState('');
  const [ filterTag, setFilterTag ] = useState<string>('');
  const [ tags, setTags ] = useState<string[]>([]);

  const {
    isPending,
    isError,
    isSuccess,
    error,
    data: dishes,
  } = useQuery({
    queryKey: ['dishes'],
    queryFn: ApiService.dishes.get,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: t('errors:fetch.dishes'),
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [isError])

  useEffect(() => {
    if (isSuccess) {
      const allTags = dishes?.map((dish) => dish.tags).flat();
      const uniqueTags = Array.from(new Set(allTags));
      setTags(uniqueTags);
    }
  }, [isSuccess]);

  function filterDishes( search: string, tag: string, dishes?: Dish[]): Dish[] {
    return dishes?.filter((dish) => {
      const searchMatch = dish.name.toLowerCase().includes(search.toLowerCase());
      const tagsMatch = tag ? dish.tags.includes(tag) : true;
      return searchMatch && tagsMatch;
    }) ?? [];
  }
  
  return (
    <Layout>
      <Col className='lain_background p-5 rounded-sm shadow-md gap-2'>
        <Input 
          placeholder={t('generics.search')} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Row className='gap-1'>
          {tags.map((tag) => (
            <Badge
              variant={filterTag === tag ? 'active' : 'outline'}
              key={tag} onClick={() => tag === filterTag ? setFilterTag('') : setFilterTag(tag)}
              >
                {tag}
            </Badge>
          ))}
        </Row>
      </Col>
      <Col className="items-center gap-5 mt-5">
        {isPending ? 
          <Loader2 className='h-10 w-10 animate-spin text-secondary' />
        : filterDishes(search, filterTag, dishes)?.map((dish) => (
          <DishesCard key={dish.id} dish={dish}/>
        ))}
      </Col>
    </Layout>
  );
}
