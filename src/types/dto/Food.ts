import { BaseDto } from "./BaseDto";

export interface Food extends BaseDto {
  name: string;
  aisle: string;
  icon: string;
}