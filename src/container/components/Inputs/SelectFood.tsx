import { P12, P14, P16 } from '@/components';
import { Row } from '@/components/Helpers';
import { useFoods } from '@/hooks/useFoods';
import { Food } from '@/types';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { DrawerSelectFood } from '../Drawers/Food';

interface SelectFoodProps {
  className?: string;
  onSelect: (food: Food) => void;
  value: string;
  foodsSelected: string[];
  defaultValue?: Food;
}

export function SelectFood(props: SelectFoodProps): JSX.Element {
  const { className, onSelect, foodsSelected, value, defaultValue } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: foods = [] } = useFoods();

  useEffect(() => {
    if (defaultValue) {
      onSelect(defaultValue);
    }
  }, [defaultValue]);

  const foodValue = foods?.find((food) => food.id === value);

  return (
    <>
      <Main>
        <Row
          onClick={() => setIsOpen(true)}
          className='gap-1 p-2 w-full justify-center items-center h-10'
        >
          {foodValue ? (
            <>
              <P16>{foodValue.icon}</P16>
              <P14>{foodValue.name}</P14>
            </>
          ) : (
            <>
              <PlusIcon className='text-muted-foreground' size={18} />
              <P12 className='text-center text-muted-foreground'>
                {t('fields:selectFood.label')}
              </P12>
            </>
          )}
        </Row>
      </Main>
      <DrawerSelectFood
        foodsSelected={foodsSelected}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={onSelect}
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
