import { BaseDto } from "./BaseDto";
import { Ingredient } from "./Ingredient";
import { MediaDto } from "./Media";

export interface Dish extends BaseDto {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: Ingredient[];
  chefId: string;
  tags: string[];
  images: MediaDto[];
} 