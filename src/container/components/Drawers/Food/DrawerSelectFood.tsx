import {
  Col,
  H2,
  H3,
  Modal,
  ModalRemove,
  P16,
  Row,
  RowBetween,
} from '@/components';
import { DrawerMotion } from '@/components/Drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useDishContext } from '@/contexts';
import { ApiService } from '@/services/api';
import { areSimilar } from '@/services/utils';
import { Food } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { CircleEllipsis, EditIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { DrawerCreateFood } from './DrawerCreateFood';
import { DrawerEditFood } from './DrawerEditFood';

interface DrawerSelectFoodProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: Food) => void;
  foodsSelected: string[];
}

export function DrawerSelectFood(props: DrawerSelectFoodProps): JSX.Element {
  const { className, isOpen, onClose, onSelect, foodsSelected } = props;
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchFood, setSearchFood] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [foodLongPressed, setFoodLongPressed] = useState<Food | undefined>(
    undefined
  );
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isDrawerEditOpen, setIsDrawerEditOpen] = useState(false);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const { foods, refresh } = useDishContext();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => ApiService.foods.remove(foodLongPressed?.id ?? ''),
    onSuccess: () => {
      toast({
        title: t('toast.remove.success.title'),
        description: t('toast.remove.success.description'),
      });
      refresh();
      setIsRemoveOpen(false);
      setFoodLongPressed(undefined);
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t(error.data.response.title),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    },
  });

  function filterAndGroupFoods(
    foods: Food[],
    searchFood: string,
    foodsSelected: string[]
  ) {
    if (!foods) return {};

    // Filtrer les aliments en fonction de la recherche et de ceux déjà sélectionnés
    const filteredFoods = foods
      .filter((food) => areSimilar(food.name, searchFood, false)) // 🔥 Recherche flexible
      .filter((food) => !foodsSelected.includes(food.id));

    // Grouper les aliments par rayon
    return filteredFoods.reduce((grouped, food) => {
      const category = food.aisle || 'Other'; // Catégorie par défaut
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(food);
      return grouped;
    }, {} as Record<string, Food[]>);
  }

  // Grouper et trier les aliments par rayon
  const groupedFoods = filterAndGroupFoods(
    foods || [],
    searchFood,
    foodsSelected
  );

  return (
    <>
      <DrawerMotion
        isOpen={isOpen}
        onClose={onClose}
        title={t('dishes:foods.select')}
      >
        <Content className={className}>
          <Input
            icon={<SearchIcon className='h-5 w-5 text-muted-foreground' />}
            className='w-full'
            isRemovable={true}
            placeholder={t('generics.search')}
            onChange={(e) => setSearchFood(e)}
          />
          <div className='pb-13 mt-4'>
            {Object.keys(groupedFoods).map((category) => (
              <div key={category} className='mb-6'>
                <H2 className='text-xl font-bold mb-2'>
                  {t(`dishes:aisleType.${category}`)}
                </H2>
                <div className='grid grid-cols-3 gap-2'>
                  {groupedFoods[category]
                    .sort((a, b) => a.name.localeCompare(b.name)) // Trier les aliments par ordre alphabétique
                    .map((food) => (
                      <Col
                        onClick={() => {
                          onClose();
                          onSelect(food);
                        }}
                        className='bg-background p-2 rounded-lg items-center w-full'
                        key={food.id}
                      >
                        <Col className='items-center justify-center h-full'>
                          <H3 className='text-center'>{food.icon}</H3>
                          <P16 className='text-center leading-none'>
                            {food.name}
                          </P16>
                        </Col>
                        <Row className='justify-end items-end w-full'>
                          <CircleEllipsis
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditOpen(true);
                              setFoodLongPressed(food);
                            }}
                            size={17}
                            className='text-muted-foreground'
                          />
                        </Row>
                      </Col>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            type='button'
            className='fixed bg-primary/90 bottom-10 right-2 gap-2'
            onClick={() => setAddFoodOpen(true)}
          >
            <PlusIcon size={15} />
            {t('dishes:foods.create')}
          </Button>
        </Content>
      </DrawerMotion>
      <Modal
        className='h-min relative'
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      >
        <Col className='gap-1'>
          <RowBetween
            onClick={() => {
              setIsEditOpen(false);
              setIsDrawerEditOpen(true);
            }}
            className='bg-background text-primary p-2 rounded-lg gap-2 items-center'
          >
            <EditIcon />
            <P16>{t('generics.edit')}</P16>
          </RowBetween>
          <ModalRemove isPending={isPending} onRemove={() => remove()} />
        </Col>
      </Modal>

      <DrawerEditFood
        isOpen={isDrawerEditOpen}
        onClose={() => setIsDrawerEditOpen(false)}
        currentFood={foodLongPressed}
      />
      <DrawerCreateFood
        isOpen={addFoodOpen}
        onClose={() => setAddFoodOpen(false)}
      />
    </>
  );
}

const Content = tw(Col)`
  px-4
  pb-5
  h-full
`;
