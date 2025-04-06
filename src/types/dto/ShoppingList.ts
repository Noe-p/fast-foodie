import { IngredientUnit } from '../api';

export interface ShoppingList {
  aisle: string;
  foods: {
    id: string;
    name: string;
    icon: string;
    quantity?: number;
    unit?: IngredientUnit;
    isCheck: boolean;
  }[];
}
