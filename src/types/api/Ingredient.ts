export enum IngredientUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  MILLILITER = 'ml',
  CENTILITER = 'cl',
  LITER = 'l',
  UNIT = 'unit',
  TABLESPOON = 'tbsp',
  TEASPOON = 'tsp',
  CUP = 'cup',
  SLICE = 'slice',
  PACKETS = 'packet',
  PIECE = 'piece',
}

export interface CreateIngredientApi {
  quantity?: number;
  foodId: string;
  unit?: string;
}

export interface UpdateIngredientApi {
  foodId?: string;
  quantity?: number;
  unit?: string;
}
