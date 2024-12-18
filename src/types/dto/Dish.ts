import { DishStatus } from "../api";
import { BaseDto } from "./BaseDto";
import { Ingredient } from "./Ingredient";
import { MediaDto } from "./Media";
import { User } from "./User";

export interface Dish extends BaseDto {
  name: string;
  description?: string;
  instructions?: string;
  ingredients: Ingredient[];
  chefId: string;
  chef: User;
  tags: string[];
  images: MediaDto[];
  status: DishStatus; 
} 