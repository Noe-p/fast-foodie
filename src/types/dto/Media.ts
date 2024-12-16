import { BaseDto } from './BaseDto';

export interface MediaDto extends BaseDto {
  filename: string;
  url: string;
  size: number;
}
