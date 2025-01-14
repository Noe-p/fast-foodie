import { H3, P12, P14, P16 } from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Col, Row } from '@/components/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { Food } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { DrawerCreateFood } from '../Drawers/Food';

interface SelectFoodProps {
  className?: string;
  onSelect: (food: Food) => void;
  foodsSelected: string[];
}

export function SelectFood(
  props: SelectFoodProps
): JSX.Element {
  const { className, onSelect, foodsSelected } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const [ isOpen, setIsOpen ] = useState(false);
  const [ foodSelected, setFoodSelected ] = useState<Food>();
  const [ addFoodOpen, setAddFoodOpen ] = useState(false);
  const [ searchFood, setSearchFood ] = useState('');
 
  useEffect(() => {
    if (foodSelected) {
      onSelect(foodSelected);
    }
  }, [foodSelected]);

  const {
      isError,
      error,
      data: foods,
    } = useQuery({
      queryKey: ['getFoods'],
      queryFn: ApiService.foods.get,
      refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: t('errors:fetch.dishes'),
        description: t(error.message),
        variant: 'destructive',
      });
    }
  }, [isError])

  function filterFoods() {
    if (foods) {
      return foods.filter(food => food.name.toLowerCase().includes(searchFood.toLowerCase())).filter(food => !foodsSelected.includes(food.id));
    }
    return foods;
  }


  return (
    <>
      <Main>
        <Row onClick={
          () => setIsOpen(true)
        } className='gap-1 p-2 w-full justify-center items-center h-10'>
        {foodSelected ? <>
            <P16>{foodSelected.icon}</P16>
            <P14>{foodSelected.name}</P14>
          </>
        :
        <>
          <PlusIcon className='text-muted-foreground' size={18} />
          <P12 className='text-center text-muted-foreground'>{t('fields:selectFood.label')}</P12>
        </>
        }
        </Row>
        <DrawerMotion className='lain_background' isOpen={isOpen} onClose={()=> setIsOpen(false)} title={t('dishes:foods.select')}>
          <DrawerContent className={className}>
            <Input
              icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
              className='w-full'
              placeholder={t('generics.search')} 
              onChange={(v) => setSearchFood(v.target.value)}
            />
            <div className='grid grid-cols-3 gap-2 mt-2'>
            {
              filterFoods()?.map((food) => (
                <Col  onClick={
                    () => {
                      setFoodSelected(food);
                      setIsOpen(false);
                    }
                  } className='bg-background p-2 rounded-lg items-center w-full' key={food.id}>
                  <H3>{food.icon}</H3>
                  <P16>{food.name}</P16>
                  <Row className='justify-end w-full'>
                    <PlusIcon size={17} className='text-muted-foreground'/>
                  </Row>
                </Col>
              ))
            }
            </div>
            <Button type="button" className='mt-5' onClick={() => setAddFoodOpen(true)}>
              {t('dishes:foods.create')}
            </Button>
          </DrawerContent>
        </DrawerMotion>
      </Main>
      <DrawerCreateFood
        isOpen={addFoodOpen}
        onClose={() => setAddFoodOpen(false)}
      />
  </>
  );
}

const Main = tw.div`
  bg-background
  rounded-md
  border
  border-input
  w-2/3
`;

const DrawerContent = tw(Col)`
  px-4
  pb-5
  gap-2
  
`;
