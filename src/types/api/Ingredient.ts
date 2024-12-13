export interface CreateIngredientApi{
  quantity: string;
  foodId: string;
}

export interface UpdateIngredientApi{
  quantity?: string;
}