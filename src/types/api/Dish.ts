import { CreateIngredientApi, UpdateIngredientApi } from "./Ingredient";

export interface CreateDishApi {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: CreateIngredientApi[];
  tags?: string[];
  images?: string[];
}

export interface UpdateDishApi {
  name?: string;
  description?: string;
  instructions?: string;
  ingredients?: UpdateIngredientApi[];
  tags?: string[];
  images?: string[];
}