import { CreateIngredientApi, UpdateIngredientApi } from "./Ingredient";

export enum DishStatus {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}
export interface CreateDishApi {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: CreateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
  status?: DishStatus; 
}

export interface UpdateDishApi {
  name?: string;
  description?: string;
  instructions?: string;
  ingredients?: UpdateIngredientApi[];
  tags?: string[];
  imageIds?: string[];
  status?: DishStatus;
}