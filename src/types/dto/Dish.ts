import { BaseDto } from "./BaseDto";
import { Image } from "./Image";
import { Ingredient } from "./Ingredient";
import { Tag } from "./Tags";

export interface Dish extends BaseDto {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: Ingredient[];
  chefId: string;
  tags: string[];
  images: Image[];
} 