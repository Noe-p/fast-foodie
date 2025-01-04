import { Col, Row } from '@/components/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateIngredientApi } from '@/types';
import { motion } from 'framer-motion';
import { PlusIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { SelectFood } from './SelectFood';

interface CreateIngredientsProps {
  className?: string;
  onIngredientChange: (ingredient: CreateIngredientApi[]) => void;
  values?: CreateIngredientApi[];
}


export function CreateIngredients(props: CreateIngredientsProps): JSX.Element {
  const {  className, onIngredientChange, values } = props;
  const { t } = useTranslation();

  return <Main className={className}>
    {values?.map((ingredient, index) => (
    <motion.div
        className='w-full'
        key={index}
        initial={{
          height: 0,
          opacity: 0,
        }}
        animate={{
          height: 'auto',
          opacity: 1,
        }}
        exit={{
          height: 0,
          opacity: 0,
        }}
        transition={{
          duration: 0.2,
          type: 'spring',
          damping: 13,
          stiffness: 150,
        }}
      >
        <Item >
          <Input
            value={ingredient.quantity}
            onChange={(e) => {
              const value = e.target.value;
              const newIngredients = [...values];
              newIngredients[index].quantity = value;
              onIngredientChange(newIngredients);
            }}
            className='text-xs'
            placeholder={t('fields:quantity.placeholder')}
          />
          <SelectFood
            foodsSelected={values.map((v) => v.foodId)}
            onSelect={(food) => {
              const newIngredients = [...values];
              newIngredients[index].foodId = food.id;
              onIngredientChange(newIngredients);
            }}
          />
          <Trash2
            onClick={() => {
              const newIngredients = [...values];
              newIngredients.splice(index, 1);
              onIngredientChange(newIngredients);
            }}
            size={20}
            className='text-red-700 cursor-pointer'
          />
        </Item>
      </motion.div>
    ))}
    <Button
      onClick={() => {
       if(values?.length === 0) {
        onIngredientChange([...(values || []), { quantity: '', foodId: '' }]);
        } else {
          if(values && values[values.length - 1].quantity && values[values.length - 1].foodId) {
            onIngredientChange([...(values || []), { quantity: '', foodId: '' }]);
          }
        }
      }}

      variant='outline'
      className='w-fit'
      type='button'
    >
      <PlusIcon size={24} />
    </Button>
  </Main>;
}

const Main = tw(Col)`
  gap-2
  items-center
`;

const Item = tw(Row)`
  gap-1
  w-full
  h-full
  items-center
  justify-between
`;