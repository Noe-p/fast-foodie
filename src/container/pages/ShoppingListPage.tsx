import {
  Col,
  H1,
  H3,
  Layout,
  Modal,
  P12,
  P14,
  P16,
  Row,
  RowBetween,
} from '@/components';
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
import { useToast } from '@/components/ui/use-toast';
import { useDishContext } from '@/contexts';
import {
  addItemToShoppingList,
  cn,
  writeUnitFromQuantity,
} from '@/services/utils';
import { Food, IngredientUnit } from '@/types';
import { Ingredient } from '@/types/dto/Ingredient';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { DrawerSelectFood } from '../components/Drawers/Food';

export function ShoppingListPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { shoppingList, setShoppingList } = useDishContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [ingredient, setIngredient] = useState<{
    quantity?: number;
    food?: Food;
    unit?: IngredientUnit;
  }>({
    quantity: undefined,
    food: undefined,
    unit: IngredientUnit.UNIT,
  });
  const { toast } = useToast();

  function removeItemFromShoppingList(aisle: string, id: string) {
    const newShoppingList = shoppingList.map((group) => {
      if (group.aisle === aisle) {
        return {
          ...group,
          foods: group.foods.filter((food) => food.id !== id),
        };
      }
      return group;
    });
    setShoppingList(newShoppingList.filter((group) => group.foods.length > 0));
  }

  function checkFood(aisle: string, foodName: string) {
    const newShoppingList = shoppingList.map((filteredFood) => {
      if (filteredFood.aisle === aisle) {
        return {
          ...filteredFood,
          foods: filteredFood.foods.map((food) =>
            food.name === foodName ? { ...food, isCheck: !food.isCheck } : food
          ),
        };
      }
      return filteredFood;
    });
    setShoppingList(newShoppingList);
  }

  function addFood(food?: Food, quantity?: number, unit?: IngredientUnit) {
    if (!food || !quantity || !unit) {
      toast({
        title: t('errors:fields.missing'),
        variant: 'destructive',
      });
      return;
    }

    const newShoppingList = addItemToShoppingList(
      shoppingList,
      ingredient as Ingredient
    );

    setShoppingList(newShoppingList);
    setIsDrawerOpen(false);
    setIngredient({
      quantity: 0,
      food: undefined,
      unit: IngredientUnit.UNIT,
    });
    toast({
      title: t('shoppingList.addSuccess'),
    });
  }

  return (
    <Layout>
      <Col className='lain_background p-5 rounded-sm shadow-md gap-3'>
        <H1 className='text-center'>{t('shoppingList.title')}</H1>
        {shoppingList.length === 0 && (
          <P16 className='text-center'>{t('shoppingList.empty')}</P16>
        )}
        {shoppingList.map((shopping, index) => (
          <Col className='mt-3' key={index}>
            <H3 className='mb-1'>{t(`dishes:aisleType.${shopping.aisle}`)}</H3>
            <Todo>
              {shopping.foods
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((food) => (
                  <TodoRow
                    $checked={food.isCheck}
                    key={food.id}
                    onClick={() => {
                      checkFood(shopping.aisle, food.name);
                    }}
                  >
                    <Row className='gap-1 items-center'>
                      <Check $checked={food.isCheck}>
                        {food.isCheck && (
                          <CheckIcon size={15} className='text-white' />
                        )}
                      </Check>
                      <P16 className='translate-y-0.5'>{food.name}</P16>
                      <P16 className='translate-y-0.5'>
                        <strong>
                          {writeUnitFromQuantity(food.quantity, food.unit, t)}
                        </strong>
                      </P16>
                    </Row>
                    <XIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItemFromShoppingList(shopping.aisle, food.id);
                      }}
                      size={18}
                      className='text-muted-foreground'
                    />
                  </TodoRow>
                ))}
            </Todo>
          </Col>
        ))}
        <Button
          className='fixed bg-primary/90 bottom-23 right-2 gap-2'
          onClick={() => setIsDrawerOpen(true)}
        >
          <PlusIcon size={15} />
          {t('generics.add')}
        </Button>
      </Col>
      <Modal
        className={cn(!isOpen && 'relative h-fit')}
        isOpen={isDrawerOpen}
        title={t('shoppingList.add')}
        onClose={() => setIsDrawerOpen(false)}
        button={
          <Button
            onClick={() =>
              addFood(ingredient?.food, ingredient?.quantity, ingredient?.unit)
            }
          >
            {t('generics.add')}
          </Button>
        }
      >
        <Item>
          <Input
            value={
              ingredient.quantity ? ingredient.quantity?.toString() : undefined
            }
            onChange={(e) =>
              setIngredient({ ...ingredient, quantity: Number(e) })
            }
            type='number'
            className='text-xs w-13'
            placeholder={'...'}
          />
          <Select
            onValueChange={(unit) =>
              setIngredient({ ...ingredient, unit: unit as IngredientUnit })
            }
            defaultValue={IngredientUnit.UNIT}
            value={ingredient?.unit ?? IngredientUnit.UNIT}
          >
            <SelectTrigger className='w-30 mr-3'>
              <SelectValue placeholder={t('fields:unit.placeholder')} />
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
          <Main>
            <Row
              onClick={() => setIsOpen(true)}
              className='gap-1 p-2 w-full justify-center items-center h-10'
            >
              {ingredient?.food ? (
                <>
                  <P16>{ingredient.food.icon}</P16>
                  <P14>{ingredient.food.name}</P14>
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
            foodsSelected={[]}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSelect={(food) => setIngredient({ ...ingredient, food })}
          />
        </Item>
      </Modal>
    </Layout>
  );
}

const Todo = tw(Col)`
  gap-1
`;

const TodoRow = tw(RowBetween)<{ $checked: boolean }>`
  gap-1
  bg-background/80
  py-2
  px-2
  rounded-lg
  items-center
  relative
  ${(props) =>
    props.$checked && 'line-through text-muted-foreground opacity-60'}
`;

const Check = tw(Col)<{ $checked: boolean }>`
  w-6
  h-6
  items-center
  justify-center
  rounded-full
  border
  border-primary
  mr-1
  ${(props) => (props.$checked ? 'bg-primary' : 'bg-transparent')}

`;

const AddButton = tw(Row)`
  bg-background
  p-2
  fixed
  bottom-23
  right-2
  w-20
  justify-center
  items-center
  h-10
  border
  border-primary/80
  rounded-md
  shadow-lg
`;

const Item = tw(Row)`
  gap-1
  w-full
  h-full
  items-center
  justify-between
`;

const Main = tw.div`
  bg-background
  rounded-md
  border
  border-input
  w-2/3
`;
