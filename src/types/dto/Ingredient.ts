import { IngredientUnit } from "../api";
import { BaseDto } from "./BaseDto";
import { Food } from "./Food";

export interface Ingredient extends BaseDto {
  quantity: number;
  food: Food;
  unit?: IngredientUnit;
}