import { CreateIngredientApi, UpdateIngredientApi } from "./Ingredient";

export interface CreateDishApi {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: CreateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
}

export interface UpdateDishApi {
  name?: string;
  description?: string;
  instructions?: string;
  ingredients?: UpdateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
}