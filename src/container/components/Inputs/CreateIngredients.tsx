import { Col, Row } from '@/components/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateIngredientApi, IngredientUnit } from '@/types';
import { Ingredient } from '@/types/dto/Ingredient';
import { motion } from 'framer-motion';
import { PlusIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { SelectFood } from './SelectFood';
interface CreateIngredientsProps {
  className?: string;
  onIngredientChange: (ingredient: CreateIngredientApi[]) => void;
  values?: CreateIngredientApi[];
  defaultValues?: Ingredient[];
}

export function CreateIngredients(props: CreateIngredientsProps): JSX.Element {
  const { className, onIngredientChange, values, defaultValues } = props;
  const { t } = useTranslation();

  return (
    <Main className={className}>
      {values?.map((ingredient, index) => (
        <motion.div
          className='w-full'
          key={ingredient.foodId || index}
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
          <Item>
            <Input
              value={
                ingredient.quantity
                  ? ingredient.quantity?.toString()
                  : undefined
              }
              onChange={(e) => {
                const value = Number(e);
                const newIngredients = [...values];
                newIngredients[index].quantity = value;
                onIngredientChange(newIngredients);
              }}
              type='number'
              className='text-xs w-13'
              placeholder={t('...')}
            />
            <Select
              onValueChange={(unit) => {
                const newIngredients = [...values];
                newIngredients[index].unit = unit;
                onIngredientChange(newIngredients);
              }}
              defaultValue={ingredient.unit ?? IngredientUnit.UNIT}
            >
              <SelectTrigger className='w-30 mr-2'>
                <SelectValue placeholder='Select a fruit' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(IngredientUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {t(`enums.units.${unit}`)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <SelectFood
              foodsSelected={values.map((v) => v.foodId)}
              onSelect={(food) => {
                const newIngredients = [...values];
                newIngredients[index].foodId = food.id;
                onIngredientChange(newIngredients);
              }}
              defaultValue={
                defaultValues?.find((v) => v.food.id === ingredient.foodId)
                  ?.food
              }
              value={values[index].foodId}
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
          if (values?.length === 0) {
            onIngredientChange([
              ...(values || []),
              { quantity: undefined, foodId: '' },
            ]);
          } else {
            if (
              values &&
              values[values.length - 1].quantity &&
              values[values.length - 1].foodId
            ) {
              onIngredientChange([
                ...(values || []),
                { quantity: undefined, foodId: '' },
              ]);
            }
          }
        }}
        variant='outline'
        className='w-fit mt-2'
        type='button'
      >
        <PlusIcon size={24} />
      </Button>
    </Main>
  );
}

const Main = tw(Col)`
  gap-1
  items-center
`;

const Item = tw(Row)`
  gap-1
  w-full
  h-full
  items-center
  justify-between
`;
