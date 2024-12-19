import { Grid1, Layout, P12, Title } from '@/components';
import ImageUpload from '@/components/Inputs/ImageUpload';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { MediaDto } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { DishesCard } from '../components/Dishes/DishesCard';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    isPending,
    isError,
    error,
    data: dishes,
  } = useQuery({
    queryKey: ['dishes'],
    queryFn: ApiService.dishes.get,
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
  
  return (
    <Layout>
      <Grid1 className="flex flex-col items-center justify-between">
        {isPending ? <Loader2 className='h-6 w-6 animate-spin' /> : dishes?.map((dish) => (
          <DishesCard key={dish.id} dish={dish}/>
        ))}
    </Grid1>
    </Layout>
  );
}
