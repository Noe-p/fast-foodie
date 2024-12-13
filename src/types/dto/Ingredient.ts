import { BaseDto } from "./BaseDto";
import { Food } from "./Food";

export interface Ingredient extends BaseDto {
  quantity: string;
  foodId: Food;
}